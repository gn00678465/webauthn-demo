declare global {
  namespace NodeJS {
    interface ProcessEnv {
      [key: string]: string | undefined;
      SESSION_SECRET: string;
      PORT: string;
      RP_ID: string;
      RP_NAME: string;
      DATABASE: "sqlite3" | "mongodb";
      DATABASE_URL?: string;
      ANDROID_PACKAGE_NAME?: string;
      ANDROID_SHA256_FINGERPRINTS?: string;
      APPLE_APP_IDS?: string;
      RELATED_ORIGINS?: string;
      PASSKEY_ENROLL_URL?: string;
      PASSKEY_MANAGE_URL?: string;
    }
  }
}
export {};
