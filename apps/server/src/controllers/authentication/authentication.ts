import { Response, NextFunction } from "express";
import {
  generateAuthenticationOptions,
  verifyAuthenticationResponse
} from "@simplewebauthn/server";
import type { GenerateAuthenticationOptionsOpts } from "@simplewebauthn/server";
import type {
  AuthenticatorTransportFuture,
  PublicKeyCredentialDescriptorFuture,
  AuthenticationResponseJSON
} from "@webauthn/types";

import type { TypedRequestBody } from "../../types";
import { CustomError } from "../../middleware";
import { userService, credentialService } from "../../service";
import { Base64Url, getExpectedOrigins } from "../../utils";

type PostAuthenticationReqBody = TypedRequestBody<{
  username: string;
  params: {
    authenticatorSelection?: {
      userVerification?: UserVerificationRequirement;
    };
  };
}>;

export const handleAuthStart = async (
  req: PostAuthenticationReqBody,
  res: Response,
  next: NextFunction
) => {
  const {
    username,
    params: { authenticatorSelection: { userVerification = "preferred" } = {} }
  } = req.body;
  if (!username) {
    return next(new CustomError("請填入使用者名稱", 400));
  }

  try {
    const user = await userService.getUserByUsername(username);
    if (!user) {
      return next(new CustomError("User ID is exist", 400));
    }

    const credentials = await credentialService.getAllCredentialByUserId(user.id);

    const allowCredentials = credentials.map((credential) => {
      return {
        id: Base64Url.decodeBase64Url(credential.credential_id),
        type: "public-key",
        transports: JSON.parse(credential.transports) as AuthenticatorTransportFuture[]
      } as PublicKeyCredentialDescriptorFuture;
    });

    const opts: GenerateAuthenticationOptionsOpts = {
      userVerification: userVerification,
      allowCredentials: allowCredentials,
      rpID: process.env.RP_ID
    };

    const options = await generateAuthenticationOptions(opts);

    req.session.currentChallenge = options.challenge;
    req.session.loggedInUserId = user.id;

    res.status(200).json({
      status: "Success",
      data: options
    });
  } catch (error) {
    next(error instanceof CustomError ? error : new CustomError("Internal Server Error", 500));
  }
};

type PutAuthenticationReqBody = TypedRequestBody<{
  data: AuthenticationResponseJSON;
}>;

export const handleAuthFinish = async (
  req: PutAuthenticationReqBody,
  res: Response,
  next: NextFunction
) => {
  const { currentChallenge, loggedInUserId } = req.session;

  if (!loggedInUserId) {
    return next(new CustomError("User ID is missing", 400));
  }

  if (!currentChallenge) {
    return next(new CustomError("Current challenge is missing", 400));
  }
  try {
    const { data = undefined } = req.body;
    if (!data) {
      return next(new CustomError("缺少必要資訊", 403));
    }

    const authenticator = await credentialService.getCredentialByCredentialId(data.id);
    if (!authenticator) {
      return next(new CustomError("User is not registered this device", 403));
    }

    const verification = await verifyAuthenticationResponse({
      response: data,
      expectedChallenge: currentChallenge,
      expectedOrigin: getExpectedOrigins(),
      expectedRPID: process.env.RP_ID,
      authenticator: {
        credentialID: new Uint8Array(Base64Url.decodeBase64Url(authenticator.credential_id)),
        credentialPublicKey: new Uint8Array(Base64Url.decodeBase64Url(authenticator.public_key)),
        counter: authenticator.counter,
        transports: JSON.parse(authenticator.transports)
      },
      requireUserVerification: true
    });

    const { verified, authenticationInfo } = verification;

    if (verified && authenticationInfo) {
      await credentialService.updateCredentialCounterAndTime(
        Base64Url.encodeBase64Url(authenticationInfo.credentialID),
        authenticationInfo.newCounter
      );
    } else {
      return next(new CustomError("Verification failed", 400));
    }

    const user = await userService.getUserById(loggedInUserId);
    res.status(200).json({
      status: "Success",
      data: {
        useId: loggedInUserId,
        credentialId: Base64Url.encodeBase64Url(verification.authenticationInfo.credentialID),
        username: user?.username
      }
    });
  } catch (error) {
    next(error instanceof CustomError ? error : new CustomError("Internal Server Error", 500));
  } finally {
    req.session.currentChallenge = undefined;
  }
};
