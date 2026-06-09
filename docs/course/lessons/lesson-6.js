/* 第 6 課 */
const LESSON_6 = {
    id: 6,
    title: "Passkeys、Conditional UI 與實作",
    difficulty: "intermediate",
    objectives: [
      "區分同步 Passkeys（BE=1/BS=1）與裝置綁定憑證，並說明同步架構",
      "實作 Conditional UI（Passkey 自動填入）並搭配正確的 AbortController 生命週期",
      "選擇並使用伺服器端函式庫（SimpleWebAuthn、py_webauthn 等）進行註冊和認證",
      "設計用於生產環境 Passkey 部署的資料庫架構和挑戰儲存機制"
    ],
    body: `
      <h3>什麼是 Passkeys？</h3>
      <p>Passkey 是一種 WebAuthn 可發現式憑證，透過端對端加密的雲端服務在使用者的裝置間同步。技術上透過 authenticatorData 中的 <code>BE</code>（Backup Eligibility）和 <code>BS</code>（Backup State）旗標都設為 1 來識別。</p>

      <h3>同步架構</h3>
      <ul>
        <li><strong>iCloud 鑰匙圈</strong>——加密金鑰來自 Secure Enclave，透過 iCloud Secure Sync 託管，端對端加密（Apple 無法讀取）</li>
        <li><strong>Google 密碼管理器</strong>——加密金鑰來自螢幕鎖定憑證，託管在搭載 Titan HSM 的 Cloud Key Vault 中</li>
        <li><strong>第三方</strong>（1Password、Bitwarden、Dashlane）——在 Android 14+ 和 Windows 11 25H2+ 上作為 CTAP2 提供者</li>
      </ul>
      <div class="callout">同步 Passkeys 的攻擊向量是同步帳號（Apple ID、Google 帳號）的帳號接管，而不是 Passkey 加密本身。</div>

      <h3>Conditional UI（Passkey 自動填入）</h3>
      <pre>&lt;!-- HTML：autocomplete 的 token 必須放在最後 --&gt;
&lt;input type="text" id="username" autocomplete="username webauthn"&gt;</pre>
      <pre>// JavaScript：在頁面載入時呼叫，不是在按鈕點擊時
async function initPasskeyAutofill() {
  if (!await PublicKeyCredential.isConditionalMediationAvailable())
    return;

  const options = await fetch("/auth/login/options").then(r => r.json());

  // SPA 路由切換時用 AbortController
  window.autofillController?.abort();
  window.autofillController = new AbortController();

  const assertion = await navigator.credentials.get({
    publicKey: PublicKeyCredential.parseRequestOptionsFromJSON(options),
    mediation: "conditional",
    signal: window.autofillController.signal
  });

  await fetch("/auth/login/verify", {
    method: "POST",
    body: JSON.stringify(assertion.toJSON())
  });
}</pre>

      <h3>伺服器端函式庫</h3>
      <ul>
        <li><strong>SimpleWebAuthn</strong>（TypeScript）——<code>generateRegistrationOptions()</code>、<code>verifyRegistrationResponse()</code>、<code>generateAuthenticationOptions()</code>、<code>verifyAuthenticationResponse()</code></li>
        <li><strong>py_webauthn</strong>（Python）——<code>generate_registration_options()</code>、<code>verify_registration_response()</code></li>
        <li><strong>webauthn-rs</strong>（Rust）——<code>start_passkey_registration()</code> / <code>finish_passkey_registration()</code></li>
        <li><strong>java-webauthn-server</strong>（Java/Yubico）——<code>startRegistration()</code> / <code>finishRegistration()</code></li>
        <li><strong>fido2-net-lib</strong>（.NET）——<code>RequestNewCredential()</code> / <code>MakeNewCredentialAsync()</code></li>
        <li><strong>go-webauthn</strong>（Go）——<code>BeginRegistration()</code> / <code>FinishRegistration()</code></li>
        <li><strong>webauthn-ruby</strong>（Ruby）——<code>WebAuthn::Credential.options_for_create()</code> / <code>.from_create().verify()</code></li>
      </ul>

      <h3>挑戰儲存</h3>
      <div class="callout-critical callout"><strong>絕對不要把挑戰存在 JWT 或未綁定的 Cookie 中。</strong>挑戰必須存在伺服器端（Redis 或資料庫），搭配 TTL 和原子性的消耗並刪除語義。這是 WebAuthn 實作中最常見的架構錯誤。</div>
      <pre>-- pending_challenges 資料表
challenge     BYTEA PRIMARY KEY
user_id       UUID
purpose       VARCHAR(20)  -- 'registration' 或 'authentication'
expires_at    TIMESTAMPTZ  -- NOW() + INTERVAL '5 minutes'</pre>
    `,
    flashcards: [
      { front: "Conditional UI 的 navigator.credentials.get() 應該什麼時候呼叫？", back: "在頁面載入時呼叫，不是在按鈕點擊時。conditional 的 get() 呼叫會無限期掛起，直到使用者從自動填入下拉選單中選取一個 Passkey。如果在按鈕點擊時才呼叫，自動填入建議要到點擊後才會出現，那就變成一般的 modal 流程了，失去了 Conditional UI 的意義。" },
      { front: "為什麼挑戰絕對不能存在 JWT 中？", back: "JWT 是無狀態的——伺服器無法在首次使用後讓它失效。存在 JWT 中的挑戰會一直有效到 JWT 過期為止，產生重放攻擊的窗口。挑戰必須存在伺服器端（Redis 或 DB），並在首次驗證嘗試後立即、原子性地作廢，無論驗證成功還是失敗。" },
      { front: "什麼是 Credential Exchange Protocol（CXP）？", back: "FIDO 聯盟的規格（2024 年 10 月），實現端對端加密的跨提供者 Passkey 轉移。不像 CSV 匯出，憑證在轉移過程中永遠不會以明文存在。Apple iOS 26 是第一個主要的實作。CXP 消除了 Passkey 採用的首要反對意見：供應商鎖定。" }
    ],
    quiz: [
      {
        question: "Conditional UI（Passkey 自動填入）需要哪個 HTML 屬性？",
        options: [
          "data-passkey=\"autofill\"",
          "autocomplete=\"username webauthn\"（webauthn 必須是最後一個 token）",
          "role=\"passkey-input\"",
          "type=\"passkey\""
        ],
        correct: 1,
        explanation: "autocomplete 屬性必須包含 'webauthn' 作為最後一個 token：autocomplete='username webauthn'。這告訴瀏覽器在自動填入下拉選單中，除了已儲存的密碼外，也要顯示已儲存的 Passkeys。瀏覽器會檢查這個 token 才啟用 conditional mediation。"
      },
      {
        question: "WebAuthn 伺服器實作中最常見的架構錯誤是什麼？",
        options: [
          "使用 ES256 而不是 RS256",
          "把挑戰存在 JWT 或未綁定的 Cookie 中，而不是存在伺服器端",
          "沒有實作證明（attestation）驗證",
          "使用 base64 而不是 base64url 編碼"
        ],
        correct: 1,
        explanation: "把挑戰存在 JWT 或 Cookie 中是最常見的錯誤，因為 JWT 是無狀態的——伺服器無法在使用後讓它失效。這會產生重放攻擊的窗口。挑戰必須存在伺服器端（Redis、資料庫），搭配 TTL 和原子性的消耗並刪除語義。"
      }
    ],
    sources: [
      { title: "passkeys.dev — Developer Reference", url: "https://passkeys.dev/" },
      { title: "SimpleWebAuthn Documentation", url: "https://simplewebauthn.dev/" },
      { title: "Corbado: Conditional UI / Passkey Autofill", url: "https://www.corbado.com/blog/webauthn-conditional-ui-passkeys-autofill" },
      { title: "FIDO Alliance: Credential Exchange Protocol", url: "https://fidoalliance.org/specifications/" }
    ]
  };
