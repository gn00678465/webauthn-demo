import { Base64Url } from '../utils';

export default class WebAuthnClient {
  constructor() {}

  static isAvailable(): boolean {
    return !!window.PublicKeyCredential;
  }

  static async isLocalAuthenticator() {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  }

  static async createPublicKey(
    challenge: string,
    user: PublicKeyCredentialUserEntity,
    options?: WebAuthnClientType.CreatePubKeyOptions
  ): Promise<Credential | null> {
    options = options ?? {};
    const credential = await navigator.credentials.create({
      publicKey: new PublicKeyOptions(challenge, user, options).publicKeyOptions
    });

    return credential;
  }

  static async authenticate(challenge: string): Promise<void> {}
}

// 產生 public key 的參數
class PublicKeyOptions {
  challenge: string;
  user: PublicKeyCredentialUserEntity;
  options: WebAuthnClientType.CreatePubKeyOptions;
  constructor(
    challenge: string,
    user: PublicKeyCredentialUserEntity,
    options: WebAuthnClientType.CreatePubKeyOptions
  ) {
    this.challenge = challenge;
    this.user = user;
    this.options = options;
  }

  get publicKeyOptions(): PublicKeyCredentialCreationOptions {
    return {
      challenge: Base64Url.decodeBase64Url(this.challenge),
      rp: {
        name: window.location.hostname,
        id: window.location.hostname
      },
      user: this.user,
      pubKeyCredParams: [
        { alg: -7, type: 'public-key' },
        { alg: -257, type: 'public-key' }
      ],
      timeout: this.options.timeout ?? 60000,
      excludeCredentials: this.options?.excludeCredentials,
      authenticatorSelection: {
        userVerification: this.options?.userVerification ?? 'required',
        residentKey: this.options?.discoverable ?? 'preferred',
        requireResidentKey: this.options?.discoverable === 'required',
        authenticatorAttachment: this.options?.authenticatorAttachment
      },
      attestation: this.options?.attestation ?? 'indirect'
    };
  }
}
