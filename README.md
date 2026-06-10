# WebAuthn Demo

> WebAuthn 無密碼登入實做練習

### 流程

**註冊**

```mermaid
sequenceDiagram
  Title: Registration
  autonumber
  Actor User
  participant User Agent
  participant Relying Party
  participant Authenticator
  User ->> User Agent: Click Regist
  User Agent ->> Relying Party: Get Challenge
  Relying Party -->> User Agent: Challenge
  Note over User Agent,Relying Party: 產生 PublicKeyCredential 相關參數
  User Agent->>Authenticator: Create new credentials
  Note over User Agent,Authenticator: navigator.credentials.create
  Authenticator ->> User: 請使用生物辨識或 PIN
  User -->> Authenticator: User verified
  Authenticator ->> User Agent: Create PublicCredential
  User Agent ->> +Relying Party: This is PublicCredential
  Relying Party ->> -Relying Party: Verlify PublicCredential
  Relying Party -->> User Agent: Device registered!
  User Agent -->> User: User registered
```

**登入**

```mermaid
sequenceDiagram
  Title: Authentication
  autonumber
  Actor User
  participant User Agent
  participant Relying Party
  participant Authenticator
  User ->> User Agent: Click Login
  Note over User,User Agent: 帶入必要訊息(username)
  User Agent ->> Relying Party: Get challenge
  Relying Party -->> User Agent: Challenge + private key ID
  Note over Relying Party,User Agent: 產生 PublicKeyCredential 相關參數
  User Agent->>Authenticator: Get credentials
  Note over User Agent,Authenticator: navigator.credentials.get
  Authenticator ->> User: 請使用生物辨識或 PIN
  User -->> Authenticator: User verified
  Authenticator ->> User Agent: Send signed challenge
  User Agent ->> +Relying Party: This is signed data
  Relying Party ->> -Relying Party: Verlify signed using public key
  Relying Party -->> User Agent: Welcome!
  User Agent ->> User: User logged in
```

**PassKeys**

```mermaid
sequenceDiagram
  Title: Passkeys Authentication
  autonumber
  Actor User
  participant User Agent
  participant Relying Party
  participant Authenticator
  User Agent ->> User Agent: isConsitionalMediationAvailable
  User Agent ->> Relying Party: Get challenge
  Relying Party -->> User Agent: Challenge + private key ID
  Note over Relying Party,User Agent: 產生 PublicKeyCredential 相關參數
  User Agent->>Authenticator: Get credentials
  Note over User Agent,Authenticator: navigator.credentials.get <br> PublicKeyCredentialOptions + mediation: conditional
  Authenticator ->> User: show autofill selection
  User -->> Authenticator: User verified
  Note over User, Authenticator: 使用 token & 生物辨識(e.g. Face ID, Touch ID, ...)
  Authenticator ->> User Agent: Send signed challenge
  User Agent ->> +Relying Party: This is signed data
  Relying Party ->> -Relying Party: Verlify signed using public key
  Relying Party -->> User Agent: Welcome!
  User Agent ->> User: User logged in
```

### Feature

- [x] 將 WebAuthn 功能模組化
- [x] 調整為 Monorepo 資料夾結構
- [x] 遷移資料庫 sqlite -> prisma + mongodb
- [x] Dockerlize
- [ ] 後端驗證功能研究並實作

### Development

**Client Env**

- VITE_API_HOST: API 的路徑

**Server Env**

| 變數 | 說明 | 必填 |
| :--- | :--- | :---: |
| `PORT` | Server port | Yes |
| `RP_ID` | 必須符合當前部署的網域 | Yes |
| `RP_NAME` | 必須符合當前部署的網域 | Yes |
| `SESSION_SECRET` | Session 加密金鑰 | Yes |
| `DATABASE_URL` | MongoDB 連線字串 (`mongodb+srv://USER:PASS@HOST/DB`) | Yes |
| `ALLOWED_ORIGINS` | WebAuthn 驗證的 origin allow-list（逗號分隔），比對 `clientDataJSON.origin`；Android 格式為 `android:apk-key-hash:<hash>`，未設定時使用程式內建預設值 | No |
| `ANDROID_PACKAGE_NAME` | Android App package name | No |
| `ANDROID_SHA256_FINGERPRINTS` | Android 簽章 SHA256 指紋（逗號分隔） | No |
| `APPLE_APP_IDS` | iOS App ID，格式 `TEAMID.BUNDLEID`（逗號分隔） | No |
| `RELATED_ORIGINS` | WebAuthn ROR 允許的跨網域來源（逗號分隔，含 `https://`） | No |
| `PASSKEY_ENROLL_URL` | Passkey 註冊頁面 URL | No |
| `PASSKEY_MANAGE_URL` | Passkey 管理頁面 URL | No |

> `.well-known` 相關環境變數皆為選填，未設定時對應端點回傳 404。

> Client 路由與 `/.well-known/passkey-endpoints` 廣告的網址對齊：
> enroll → `/passkeys/create`（建立 Passkey）、manage → `/passkeys`（管理 Passkey），
> 兩者皆可直接以 URL 開啟（server 已提供 SPA fallback）。

```bash
bun install

bun run prisma:generate

bun run prisma:push

bun run dev
```

### Docker

1. 準備憑證
   - **webauthn.localhost**
2. 將憑證放入根目錄 **.certs**
   - 名稱對應 **docker/dynamic_conf.yaml** 內的設定名稱
3. webauthn service
   - 環境變數 **DATABASE_URL** 請填入對應的 mongodb path

```bash
docker compose up -d
```
