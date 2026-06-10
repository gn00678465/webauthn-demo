/* 第 4 課 */
const LESSON_4 = {
    id: 4,
    title: "註冊典禮（Attestation）深入解析",
    difficulty: "intermediate",
    objectives: [
      "建構完整的 PublicKeyCredentialCreationOptions 物件，包含所有必要和關鍵的選用欄位",
      "走過從使用者操作到資料庫儲存的 10 步驟註冊典禮",
      "解析 authenticatorData 二進位結構：rpIdHash、flags、signCount、AAGUID、credentialId、COSE 金鑰",
      "實作伺服器端的 8 步驟註冊驗證檢查清單"
    ],
    body: `
      <h3>註冊 API</h3>
      <pre>const credential = await navigator.credentials.create({
  publicKey: {
    challenge: serverGeneratedBytes,      // 最少 16 bytes，建議 32
    rp: { id: "example.com", name: "Example" },
    user: {
      id: opaqueUserHandle,               // 最多 64 bytes，不可放個資
      name: "user@example.com",
      displayName: "Jane Doe"
    },
    pubKeyCredParams: [
      { type: "public-key", alg: -7 },    // ES256
      { type: "public-key", alg: -257 },  // RS256
      { type: "public-key", alg: -8 },    // EdDSA
    ],
    authenticatorSelection: {
      residentKey: "required",             // passkeys 必要
      userVerification: "required"
    },
    attestation: "none",                   // 消費者應用建議值
    excludeCredentials: existingCreds,     // 防止重複註冊
    timeout: 300000
  }
});</pre>

      <h3>註冊流程（10 個步驟）</h3>
      <ol>
        <li>使用者在 RP 發起註冊</li>
        <li>RP 伺服器產生加密隨機挑戰，回傳 PublicKeyCredentialCreationOptions</li>
        <li>客戶端呼叫 <code>navigator.credentials.create({publicKey})</code></li>
        <li>瀏覽器找到可用的驗證器</li>
        <li>使用者執行授權手勢（PIN、生物辨識、按鈕）</li>
        <li>驗證器產生以 RP ID 為範圍的新金鑰對</li>
        <li>驗證器回傳公鑰 + credential ID + attestationObject</li>
        <li>客戶端將 <code>AuthenticatorAttestationResponse</code> 回傳給腳本</li>
        <li>腳本將 <code>{clientDataJSON, attestationObject}</code> 傳送到 RP 伺服器</li>
        <li>RP 驗證並儲存憑證</li>
      </ol>

      <h3>authenticatorData 二進位結構</h3>
      <pre>Bytes 0-31  : rpIdHash（RP ID 字串的 SHA-256）
Byte  32    : flags（UP=0x01, UV=0x04, BE=0x08, BS=0x10, AT=0x40, ED=0x80）
Bytes 33-36 : signCount（big-endian uint32）
Bytes 37-52 : AAGUID（16 bytes，驗證器型號 ID）
Bytes 53-54 : credentialIdLength（big-endian uint16）
Bytes 55+   : credentialId（N bytes）
剩餘部分    : credentialPublicKey（CBOR 編碼的 COSE_Key）</pre>

      <h3>伺服器端驗證檢查清單</h3>
      <ol>
        <li>驗證 <code>clientDataJSON.type === "webauthn.create"</code></li>
        <li>驗證挑戰與伺服器端儲存的挑戰一致（base64url，無填充）</li>
        <li>驗證 <code>clientDataJSON.origin</code> 與預期的來源完全一致（必須精確字串比對！）</li>
        <li>解析 attestationObject CBOR → 提取 authData</li>
        <li>驗證 rpIdHash 等於你設定的 RP ID 的 SHA-256</li>
        <li>檢查 flags：UP 必須設定；UV 若有要求也必須設定；AT 必須設定</li>
        <li>從 attestedCredentialData 中提取 AAGUID、credentialId、credentialPublicKey</li>
        <li>儲存：<code>{credential_id, public_key, sign_count, user_id, aaguid, transports, backup_eligible, backup_state}</code></li>
      </ol>

      <div class="callout-critical callout">Origin 必須用精確字串比對來檢查，絕對不能用子字串比對。在 evil.example.com 的子網域攻擊者會通過對 example.com 的子字串檢查。</div>

      <h3>資料庫結構</h3>
      <pre>credential_id   VARCHAR(1023) PRIMARY KEY  -- 有些 ID 非常長
public_key      BYTEA                       -- COSE 編碼
counter         BIGINT                      -- signCount
user_id         UUID REFERENCES users(id)
aaguid          CHAR(36)
transports      TEXT[]                      -- 來自 getTransports()
backup_eligible BOOLEAN                     -- BE 旗標
backup_state    BOOLEAN                     -- BS 旗標
created_at      TIMESTAMPTZ</pre>
    `,
    flashcards: [
      { front: "註冊選項中 excludeCredentials 的用途是什麼？", back: "防止重複的憑證註冊。這個陣列包含使用者所有現有憑證的 {id, type, transports}。如果驗證器已經持有匹配的憑證，它會拒絕建立新的並拋出 InvalidStateError。伺服器必須在此填入使用者所有現有的 credential ID。" },
      { front: "authenticatorData 中的 BE 和 BS 旗標是什麼？", back: "BE（Backup Eligibility，位元 3/0x08）：憑證「可以」同步到雲端。BS（Backup State，位元 4/0x10）：憑證「目前已經」備份。兩者共同識別同步 Passkeys：BE=1, BS=1 = 同步 Passkey；BE=0, BS=0 = 裝置綁定憑證。兩者都要存到資料庫中以便制定安全策略。" },
      { front: "為什麼 credential_id 要用 VARCHAR(1023)？", back: "不同的驗證器實作會產生長度不一的 credential ID。有些會產生非常長的 ID（可達數百位元組，base64url 編碼後更長）。使用太小的 VARCHAR 會靜默截斷 ID，導致認證失敗。W3C 規格沒有定義最大長度，所以 1023 足以容納所有已知的實作。" }
    ],
    quiz: [
      {
        question: "註冊時，伺服器為什麼必須驗證 clientDataJSON.type === 'webauthn.create'？",
        options: [
          "確認瀏覽器使用的是最新版 WebAuthn",
          "防止跨典禮攻擊——認證回應被重放為註冊回應",
          "確保驗證器支援請求的演算法",
          "驗證使用者已授權相機權限進行生物辨識掃描"
        ],
        correct: 1,
        explanation: "type 欄位區分了註冊（'webauthn.create'）和認證（'webauthn.get'）。如果不檢查，攻擊者可以將認證的 assertion 重放為註冊回應，可能綁定攻擊者控制的憑證。這稱為跨典禮攻擊（cross-ceremony attack）。"
      },
      {
        question: "面向消費者的應用程式應該使用哪個 attestation 值？",
        options: [
          "attestation: 'direct'——驗證驗證器型號",
          "attestation: 'enterprise'——最高安全性",
          "attestation: 'none'——消費者流程不需要證明",
          "attestation: 'indirect'——保護隱私的證明"
        ],
        correct: 2,
        explanation: "W3C 建議消費者應用使用 'none'。證明（attestation）會揭露驗證器型號，引起隱私疑慮。企業證明用於組織管控（追蹤裝置資產）。對消費者 Passkey 流程來說，無論證明格式如何，憑證的功能完全相同。"
      }
    ],
    sources: [
      { title: "W3C WebAuthn Level 3 Specification", url: "https://www.w3.org/TR/webauthn-3/" },
      { title: "MDN: PublicKeyCredentialCreationOptions", url: "https://developer.mozilla.org/en-US/docs/Web/API/PublicKeyCredentialCreationOptions" },
      { title: "The Copenhagen Book: WebAuthn", url: "https://thecopenhagenbook.com/webauthn" },
      { title: "MDN: Attestation and Assertion", url: "https://developer.mozilla.org/en-US/docs/Web/API/Web_Authentication_API/Attestation_and_Assertion" }
    ]
  };
