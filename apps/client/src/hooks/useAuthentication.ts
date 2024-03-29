import { webauthnAuthentication } from "@webauthn/browser";
import type { WebauthnAuthenticationOptions } from "@webauthn/browser";
import { startAuth, finishAuth } from "../service/authentication";
import {
  PublicKeyCredentialAssertionAdapter,
  PublicKeyCredentialRequestOptionsTransform
} from "../utils";
import type { AuthenticationAdvanceState } from "./useAuthenticationAdvance";

export interface UseAuthenticationOptions<TR>
  extends Pick<
    WebauthnAuthenticationOptions<TR>,
    "onSuccess" | "onComplete" | "onError" | "signal"
  > {
  params?: AuthenticationAdvanceState;
}

export function useAuthentication<TR>({
  params = {},
  onComplete,
  onSuccess,
  onError
}: UseAuthenticationOptions<TR>) {
  async function handleAuthentication(username: string, signal?: AbortSignal) {
    await webauthnAuthentication({
      signal,
      getPublicKeyRequestOptions: async () => {
        const res = await startAuth({ username, params });
        if (res.data.status === "Success") {
          return new PublicKeyCredentialRequestOptionsTransform(res.data.data).options;
        }
        throw new Error(res.data.message);
      },
      sendSignedChallenge: async (options) => {
        if (options) {
          const res = await finishAuth(new PublicKeyCredentialAssertionAdapter(options).toJson());
          return res.data;
        }
        return null;
      },
      onSuccess,
      onError,
      onComplete
    });
  }

  return { handleAuthentication };
}
