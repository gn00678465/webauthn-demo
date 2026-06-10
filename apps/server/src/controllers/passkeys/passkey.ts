import { Response, NextFunction } from "express";
import {
  generateAuthenticationOptions,
  verifyAuthenticationResponse
} from "@simplewebauthn/server";
import type { GenerateAuthenticationOptionsOpts } from "@simplewebauthn/server";
import type { AuthenticationResponseJSON } from "@webauthn/types";

import type { TypedRequestBody } from "../../types";
import { CustomError } from "../../middleware";
import { credentialService } from "../../service";
import { Base64Url, getExpectedOrigins } from "../../utils";

type PostPassKeysReqBody = TypedRequestBody<{
  params: {
    authenticatorSelection?: {
      userVerification?: UserVerificationRequirement;
    };
  };
}>;

export const handlePasskeysStart = async (
  req: PostPassKeysReqBody,
  res: Response,
  next: NextFunction
) => {
  const {
    params: { authenticatorSelection: { userVerification = "preferred" } = {} }
  } = req.body;

  try {
    const opts: GenerateAuthenticationOptionsOpts = {
      userVerification: userVerification,
      allowCredentials: [],
      rpID: process.env.RP_ID
    };

    const options = await generateAuthenticationOptions(opts);

    req.session.currentChallenge = options.challenge;

    res.status(200).json({
      status: "Success",
      data: options
    });
  } catch (error) {
    next(error instanceof CustomError ? error : new CustomError("Internal Server Error", 500));
  }
};

type PutPasskeyReqBody = TypedRequestBody<{
  data: AuthenticationResponseJSON;
}>;

export const handlePasskeysFinish = async (
  req: PutPasskeyReqBody,
  res: Response,
  next: NextFunction
) => {
  const { currentChallenge } = req.session;

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
    } else {
      req.session.loggedInUserId = authenticator.user_id;
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
      next(new CustomError("Verification failed", 400));
    }

    res.status(200).json({
      status: "Success",
      data: {}
    });
  } catch (error) {
    next(error instanceof CustomError ? error : new CustomError("Internal Server Error", 500));
  } finally {
    req.session.currentChallenge = undefined;
  }
};
