import type { AxiosResponse } from "axios";
import { request } from "./request";

export interface PasskeyEndpoints {
  enroll?: string;
  manage?: string;
}

export async function getPasskeyEndpoints() {
  return request.get<string, AxiosResponse<PasskeyEndpoints>>("/.well-known/passkey-endpoints");
}
