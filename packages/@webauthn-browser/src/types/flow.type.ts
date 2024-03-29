import type { CreateCredentialOptions } from "./webauthn.type";

interface CommonOptions<TR> extends CreateCredentialOptions {
  onError?: (error: unknown) => void;
  onSuccess?: (arg?: TR | null) => void;
  onComplete?: () => void;
}

export interface WebauthnRegistrationOptions<TR> extends CommonOptions<TR> {
  getPublicKeyCreationOptions: () => Promise<PublicKeyCredentialCreationOptions | undefined>;
  sendSignedChallenge: (arg: PublicKeyCredential) => Promise<TR>;
}

export interface WebauthnAuthenticationOptions<TR> extends CommonOptions<TR> {
  getPublicKeyRequestOptions: () => Promise<PublicKeyCredentialRequestOptions | undefined>;
  sendSignedChallenge: (arg: PublicKeyCredential) => Promise<TR>;
}
