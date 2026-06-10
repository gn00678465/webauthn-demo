/**
 * WebAuthn expectedOrigin 固定 allow-list（D-002）。
 * 驗證對象是 authenticator 簽入 clientDataJSON 的 origin，
 * 不可使用 client 自報的 Origin header 作為期望值（檢查恆真）。
 */
const DEFAULT_ALLOWED_ORIGINS = [
  // 瀏覽器 + iOS + macOS 共用
  "https://webauthn-demo-10ja.onrender.com",
  // Android debug 簽章（base64url(SHA-256(簽章憑證))）
  "android:apk-key-hash:jjh-F27qoyZV7OtsfhPMMEdSUWOVEOlMHFixAUqmWSg"
];

export function getExpectedOrigins(): string[] {
  const env = process.env.ALLOWED_ORIGINS;
  if (!env) return DEFAULT_ALLOWED_ORIGINS;
  return env
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}
