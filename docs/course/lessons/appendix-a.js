/* 附錄 A：Step-Up Authentication（升級認證） */
const APPENDIX_A = {
  id: 9,
  title: "附錄 A：Step-Up Authentication（升級認證）",
  difficulty: "intermediate",
  objectives: [
    "定義 Step-Up Authentication 及其在應用程式安全中的角色",
    "區分高保證（high-assurance）與低保證（low-assurance）裝置，並說明如何分類",
    "使用 allowCredentials 限制升級認證只接受高保證憑證",
    "設計完整的 Step-Up Authentication 流程，包括資料庫結構與 FIDO MDS 整合"
  ],
  body: `
    <h3>什麼是 Step-Up Authentication？</h3>
    <p>Step-Up Authentication（升級認證）是一種安全機制，<strong>對應用程式中的敏感或關鍵操作施加額外的認證要求</strong>。使用者可能一開始用較低保證等級的方式登入（例如同步 Passkey），但在執行敏感操作時，系統會要求使用較高保證等級的驗證器重新認證。</p>

    <div class="callout">核心概念：不是所有操作都需要最高等級的認證。日常瀏覽用 Passkey 就夠了，但轉帳超過一定金額時，系統應該要求使用硬體安全金鑰重新驗證。</div>

    <h3>什麼時候需要升級認證？</h3>
    <p>典型的場景包括：</p>
    <ul>
      <li><strong>金融交易</strong>——銀行允許多種驗證器登入，但超過特定金額（例如 $1,000）的轉帳需要高保證裝置</li>
      <li><strong>帳號安全設定</strong>——變更密碼、綁定新的認證方式、修改通知設定</li>
      <li><strong>敏感資料存取</strong>——檢視完整的社會安全號碼、下載個人資料匯出檔</li>
      <li><strong>管理員操作</strong>——變更權限、刪除使用者、存取稽核日誌</li>
      <li><strong>電子簽章或法律文件</strong>——需要更強的身分驗證來確保不可否認性</li>
    </ul>

    <h3>裝置保證等級分類</h3>
    <p>Step-Up Authentication 的前提是能區分驗證器的保證等級：</p>

    <p><strong>低保證裝置（Low-Assurance）：</strong></p>
    <ul>
      <li>缺少證明聲明（attestation statement）的註冊</li>
      <li>未綁定特定硬體的憑證</li>
      <li>可複製的 Passkeys（同步憑證，BE=1）</li>
      <li>軟體式驗證器</li>
    </ul>

    <p><strong>高保證裝置（High-Assurance）：</strong></p>
    <ul>
      <li>具有硬體證明的驗證器（attestation='direct'）</li>
      <li>透過 FIDO Metadata Service（MDS）驗證過的裝置</li>
      <li>裝置綁定的憑證（BE=0, BS=0）</li>
      <li>FIDO 認證 L2 以上的硬體安全金鑰（如 YubiKey）</li>
    </ul>

    <h3>實作流程</h3>
    <p>完整的 Step-Up Authentication 流程如下：</p>
    <ol>
      <li>使用者嘗試執行敏感操作（如大額轉帳）</li>
      <li>伺服器檢查使用者目前 session 的認證保證等級</li>
      <li><strong>快樂路徑：</strong>初始認證已使用高保證裝置 → 操作直接放行</li>
      <li><strong>升級路徑：</strong>初始認證使用低保證裝置 → 系統提示使用高保證裝置重新認證</li>
      <li>重新認證成功後，敏感操作完成</li>
    </ol>

    <h3>資料庫結構</h3>
    <p>在憑證儲存模型中加入 <code>is_high_assurance</code> 欄位，在註冊時根據證明分析和 MDS 查詢來計算：</p>
    <pre>-- 憑證資料表（加入保證等級欄位）
credential_id     VARCHAR(1023) PRIMARY KEY
public_key        BYTEA
counter           BIGINT
user_id           UUID REFERENCES users(id)
aaguid            CHAR(36)
transports        TEXT[]
backup_eligible   BOOLEAN
backup_state      BOOLEAN
is_high_assurance BOOLEAN DEFAULT false  -- 升級認證用
registration_time TIMESTAMPTZ
last_used_time    TIMESTAMPTZ</pre>

    <p><code>is_high_assurance</code> 的判斷邏輯：</p>
    <pre>function classifyAssurance(attestation, mdsEntry) {
  // 有有效證明 + MDS 中查得到 + 非同步憑證 = 高保證
  if (attestation.fmt !== "none"
      && mdsEntry !== null
      && mdsEntry.certificationLevel >= 2
      && !backupEligible) {
    return true;
  }
  return false;
}</pre>

    <h3>前提條件：FIDO Metadata Service（MDS）</h3>
    <p>要判斷裝置的保證等級，你需要整合 FIDO MDS：</p>
    <ul>
      <li>MDS 是 FIDO 聯盟維護的公開資料庫，包含已認證驗證器的中繼資料</li>
      <li>透過 AAGUID 查詢可以得到：認證等級、支援的演算法、證明憑證鏈、安全公告</li>
      <li>伺服器端函式庫如 <code>java-webauthn-server</code>（Yubico）和 <code>fido2-net-lib</code>（.NET）有內建的 MDS 整合</li>
    </ul>

    <h3>關鍵實作：用 allowCredentials 限制升級認證</h3>
    <p>升級認證時，<strong>只允許高保證憑證</strong>。透過 <code>allowCredentials</code> 只列出標記為高保證的 credential ID：</p>
    <pre>// 伺服器端：產生升級認證選項
async function generateStepUpOptions(userId) {
  // 只取該使用者的高保證憑證
  const highAssuranceCreds = await db.getCredentials(userId, {
    isHighAssurance: true
  });

  if (highAssuranceCreds.length === 0) {
    throw new Error("此使用者沒有註冊高保證裝置，無法進行升級認證");
  }

  return {
    challenge: crypto.randomBytes(32),
    rpId: "example.com",
    userVerification: "required",
    allowCredentials: highAssuranceCreds.map(c => ({
      type: "public-key",
      id: c.credentialId,
      transports: c.transports
    })),
    timeout: 120000  // 升級認證給較短的 timeout
  };
}</pre>

    <pre>// 客戶端：觸發升級認證
async function performStepUp() {
  const options = await fetch("/auth/step-up/options", {
    method: "POST"
  }).then(r => r.json());

  const assertion = await navigator.credentials.get({
    publicKey: PublicKeyCredential.parseRequestOptionsFromJSON(options)
  });

  const result = await fetch("/auth/step-up/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(assertion.toJSON())
  }).then(r => r.json());

  if (result.success) {
    // 升級認證成功，繼續敏感操作
    proceedWithSensitiveAction();
  }
}</pre>

    <h3>Session 中的升級狀態管理</h3>
    <p>升級認證成功後，在 session 中記錄時間戳記，並設定有效期限：</p>
    <pre>// 升級認證成功後
session.stepUpVerifiedAt = Date.now();
session.stepUpExpiresAt = Date.now() + 5 * 60 * 1000; // 5 分鐘

// 檢查升級狀態的 middleware
function requireStepUp(req, res, next) {
  if (!req.session.stepUpExpiresAt
      || Date.now() > req.session.stepUpExpiresAt) {
    return res.status(403).json({
      error: "step_up_required",
      message: "此操作需要升級認證"
    });
  }
  next();
}</pre>

    <div class="callout-critical callout"><strong>升級認證的時效必須很短</strong>（建議 5-15 分鐘）。過長的有效期會降低安全性——使用者可能已經離開座位，讓別人接手操作。每次敏感操作都應該重新檢查時效。</div>

    <h3>與 NIST AAL 的對應</h3>
    <ul>
      <li><strong>AAL1</strong>（單因子）——密碼登入。不適合任何敏感操作。</li>
      <li><strong>AAL2</strong>（多因子，抗釣魚）——同步 Passkeys 符合此等級（NIST SP 800-63-4）。適合一般操作。</li>
      <li><strong>AAL3</strong>（硬體綁定，驗證器模擬抵抗）——裝置綁定 Passkeys、FIDO 認證 L2+ 硬體金鑰。敏感操作應要求此等級。</li>
    </ul>
    <p>Step-Up Authentication 本質上就是：讓使用者在需要時，從 AAL2 升級到 AAL3。</p>

    <h3>最佳實踐</h3>
    <ul>
      <li><strong>預先儲存保證等級</strong>——在註冊時就計算並儲存 <code>is_high_assurance</code>，不要每次認證時才動態計算（效能考量）</li>
      <li><strong>引導使用者註冊高保證裝置</strong>——在使用者首次遇到升級認證需求時，提供註冊硬體安全金鑰的選項</li>
      <li><strong>清楚的 UX 訊息</strong>——告訴使用者為什麼需要額外驗證，以及可以用哪些裝置</li>
      <li><strong>降級處理</strong>——如果使用者沒有高保證裝置，提供替代流程（如人工審核、延遲執行）</li>
      <li><strong>稽核日誌</strong>——記錄所有升級認證的嘗試和結果，包括使用了哪個憑證</li>
    </ul>
  `,
  flashcards: [
    { front: "什麼是 Step-Up Authentication？", back: "一種安全機制，在使用者已經登入的情況下，對敏感或關鍵操作要求額外的、更高保證等級的認證。例如使用者用同步 Passkey（AAL2）登入後，執行大額轉帳時需要用硬體安全金鑰（AAL3）重新驗證。本質上是從 AAL2 升級到 AAL3。" },
    { front: "升級認證時如何限制只接受高保證裝置？", back: "在 PublicKeyCredentialRequestOptions 的 allowCredentials 陣列中，只列出標記為 is_high_assurance = true 的 credential ID。這樣瀏覽器只會提示使用者用高保證的驗證器（如硬體安全金鑰），而不會接受同步 Passkey。" },
    { front: "如何判斷一個憑證是否為高保證？", back: "在註冊時根據三個條件判斷：(1) 具有有效的證明聲明（attestation.fmt !== 'none'），(2) 在 FIDO MDS 中查得到該 AAGUID 且認證等級 >= L2，(3) 不是可同步的憑證（BE=0）。在資料庫中用 is_high_assurance 布林欄位儲存，避免每次認證時動態計算。" }
  ],
  quiz: [
    {
      question: "銀行應用中，使用者用同步 Passkey 登入後想轉帳 $5,000。Step-Up Authentication 應該怎麼做？",
      options: [
        "直接拒絕操作，要求使用者用硬體金鑰重新登入整個 session",
        "在 allowCredentials 中只列出該使用者的高保證憑證，觸發一次新的 WebAuthn 認證典禮",
        "顯示一個確認對話框讓使用者點擊「確認」",
        "發送 SMS OTP 作為額外驗證"
      ],
      correct: 1,
      explanation: "正確做法是觸發一次新的 WebAuthn 認證典禮，但在 allowCredentials 中只列出標記為高保證的 credential ID（例如硬體安全金鑰）。這樣使用者不需要重新登入整個 session，只需要用高保證裝置額外驗證一次。SMS OTP 不符合抗釣魚要求。"
    },
    {
      question: "升級認證成功後的時效應該設定多長？",
      options: [
        "24 小時——一天只需要驗證一次",
        "與 session 相同——直到登出都有效",
        "5-15 分鐘——短時效確保安全性",
        "不需要時效——升級後永久有效"
      ],
      correct: 2,
      explanation: "升級認證的時效應該很短（建議 5-15 分鐘）。過長的有效期降低安全性——使用者可能已經離開座位讓別人接手。每次敏感操作都應該重新檢查時效，過期就要求重新進行升級認證。"
    }
  ],
  sources: [
    { title: "Yubico: Step-Up Authentication Implementation Guidance", url: "https://developers.yubico.com/WebAuthn/Concepts/Authenticator_Management/Implementation_Guidance/Step_Up_Authentication.html" },
    { title: "NIST SP 800-63-3: Digital Identity Guidelines", url: "https://pages.nist.gov/800-63-3/" },
    { title: "FIDO Alliance Metadata Service (MDS)", url: "https://fidoalliance.org/metadata/" },
    { title: "W3C WebAuthn Level 3: Assertion Options", url: "https://www.w3.org/TR/webauthn-3/#sctn-credentialrequestoptions-extension" }
  ]
};
