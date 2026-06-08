import { Router, Request, Response } from "express";

const router = Router();

// Android Digital Asset Links
router.get("/assetlinks.json", (req: Request, res: Response) => {
  const packageName = process.env.ANDROID_PACKAGE_NAME;
  const sha256Fingerprints = process.env.ANDROID_SHA256_FINGERPRINTS;

  if (!packageName || !sha256Fingerprints) {
    return res.status(404).json({ error: "Not configured" });
  }

  res.json([
    {
      relation: [
        "delegate_permission/common.handle_all_urls",
        "delegate_permission/common.get_login_creds"
      ],
      target: {
        namespace: "android_app",
        package_name: packageName,
        sha256_cert_fingerprints: sha256Fingerprints.split(",").map((s) => s.trim())
      }
    }
  ]);
});

// iOS Apple App Site Association
router.get("/apple-app-site-association", (req: Request, res: Response) => {
  const appIds = process.env.APPLE_APP_IDS;

  if (!appIds) {
    return res.status(404).json({ error: "Not configured" });
  }

  res.json({
    webcredentials: {
      apps: appIds.split(",").map((s) => s.trim())
    }
  });
});

// WebAuthn Related Origin Requests (ROR)
router.get("/webauthn", (req: Request, res: Response) => {
  const origins = process.env.RELATED_ORIGINS;

  if (!origins) {
    return res.status(404).json({ error: "Not configured" });
  }

  res.json({
    origins: origins.split(",").map((s) => s.trim())
  });
});

// Passkey Endpoints (W3C Draft)
router.get("/passkey-endpoints", (req: Request, res: Response) => {
  const enroll = process.env.PASSKEY_ENROLL_URL;
  const manage = process.env.PASSKEY_MANAGE_URL;

  if (!enroll && !manage) {
    return res.status(404).json({ error: "Not configured" });
  }

  const endpoints: Record<string, string> = {};
  if (enroll) endpoints.enroll = enroll;
  if (manage) endpoints.manage = manage;

  res.json(endpoints);
});

export default router;
