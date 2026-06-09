/* 第 8 課 */
const LESSON_8 = {
    id: 8,
    title: "企業部署、進階擴充與未來趨勢",
    difficulty: "advanced",
    objectives: [
      "使用 Crawl-Walk-Run 框架設計 IDP 中介的企業 Passkey 部署方案",
      "實作 PRF 擴充以達成硬體支援的端對端加密，以及 Signal API 進行憑證生命週期管理",
      "設定 Related Origin Requests 以實現跨網域 Passkey 共享",
      "評估後量子威脅、Digital Credentials API，以及 FIDO 代理式認證倡議"
    ],
    body: `
      <h3>企業部署</h3>
      <p>2026 年，87% 的企業正在部署或試行 FIDO2 Passkeys。正確的架構模式是<strong>IDP 中介</strong>：Passkeys 透過 Okta、Microsoft Entra ID、Auth0 認證——不是直接對每個應用程式。</p>
      <p><strong>Crawl-Walk-Run 框架：</strong></p>
      <ol>
        <li><strong>Crawl（爬）：</strong>多協定智慧卡 + 憑證式認證（CBA）</li>
        <li><strong>Walk（走）：</strong>App 式 MFA，逐步減少對密碼的依賴</li>
        <li><strong>Run（跑）：</strong>完整的 Passkey 部署搭配 Conditional Access 強制執行</li>
      </ol>
      <p><strong>引導悖論（bootstrapping paradox）：</strong>新員工無法在沒有強認證的情況下註冊 Passkey，但他們還沒有任何憑證。解決方案：Temporary Access Pass（TAP）——Microsoft Entra ID 的時效性一次性密碼，透過 Graph API 自動化。</p>
      <p><strong>混合模式：</strong>47% 的企業結合同步 Passkeys（AAL2，一般員工）和裝置綁定 Passkeys（AAL3，特權/管理員角色）。</p>

      <h3>PRF 擴充</h3>
      <p>PRF（Pseudo-Random Function）擴充從硬體綁定的金鑰 + RP 提供的鹽值中推導出一個確定性的 32 位元組秘密。這實現了網頁應用中的<strong>硬體支援端對端加密</strong>：</p>
      <pre>// 註冊：啟用 PRF
extensions: { prf: {} }

// 認證：推導加密金鑰
extensions: {
  prf: {
    eval: {
      first: new TextEncoder().encode("encryption-salt-v1")
    }
  }
}

// 將 PRF 輸出作為 Input Keying Material（IKM）
const prfOutput = assertion.getClientExtensionResults().prf.results.first;
const ikm = await crypto.subtle.importKey(
  "raw", prfOutput, "HKDF", false, ["deriveKey"]);
const aesKey = await crypto.subtle.deriveKey(
  { name: "HKDF", hash: "SHA-256",
    salt: new Uint8Array(32),
    info: new TextEncoder().encode("my-app-encryption") },
  ikm, { name: "AES-GCM", length: 256 }, false,
  ["encrypt", "decrypt"]
);</pre>
      <p>Bitwarden 就使用這個模式：Data Encryption Keys（DEK）用每個憑證的 Key Encryption Keys（KEK）包裹。任何已註冊的 Passkey 都可以解包保險庫。</p>

      <h3>Signal API</h3>
      <p>三個方法用來通知 Passkey 提供者憑證狀態的變更：</p>
      <ul>
        <li><code>PublicKeyCredential.signalAllAcceptedCredentials({rpId, userId, allAcceptedCredentialIds})</code>——回報完整的有效憑證清單（每次認證後都要呼叫）</li>
        <li><code>PublicKeyCredential.signalUnknownCredential({rpId, credentialId})</code>——回報無法識別的憑證</li>
        <li><code>PublicKeyCredential.signalCurrentUserDetails({rpId, userId, name, displayName})</code>——更新使用者中繼資料</li>
      </ul>
      <div class="callout-critical callout">signalAllAcceptedCredentials：遺漏有效的 ID 會導致鎖定。你必須傳送該使用者所有有效 credential ID 的完整清單。</div>

      <h3>Related Origin Requests（ROR）</h3>
      <p>讓單一 Passkey 跨多個網域使用。主要網域提供 <code>/.well-known/webauthn</code>：</p>
      <pre>// https://example.com/.well-known/webauthn
{
  "origins": [
    "https://app.example.com",
    "https://example.de",
    "https://example.co.uk"
  ]
}
// 硬性限制：最多 5 個不同的 eTLD+1 標籤
// rpId 本身不可以出現在清單中</pre>

      <h3>未來趨勢</h3>
      <ul>
        <li><strong>Digital Credentials API</strong>——<code>navigator.credentials.get()</code> 擴充用於從身分錢包取得可驗證憑證。Chrome 141 正式版（2025 年 10 月）。Passkeys 認證身分；VCs 證明屬性（年齡、資格）。</li>
        <li><strong>歐盟 eIDAS 2.0</strong>——每個成員國必須在 2026 年 12 月 31 日前提供數位身分錢包，使用 CTAP 2.2 混合流程。</li>
        <li><strong>代理式認證（Agentic Authentication）</strong>——FIDO 聯盟 TWG（2026 年 4 月）：為 AI 代理認證制定標準，由 CVS Health、Google 和 OpenAI 共同主持。預計 2030 年代理式商務規模達 5 兆美元。</li>
        <li><strong>後量子加密</strong>——ML-DSA（Module-Lattice Digital Signature）於 2025 年 4 月加入 IANA COSE 註冊表。Google 的第一把量子抵抗 FIDO2 金鑰：ECDSA + Dilithium 混合（2023 年 8 月）。現在就要建構演算法敏捷架構。</li>
        <li><strong>市場規模</strong>——無密碼認證：2025 年 241 億美元，預計 2030 年達 557 億美元（年複合成長率 18.24%）。</li>
      </ul>
    `,
    flashcards: [
      { front: "PRF 擴充能實現什麼？", back: "在網頁應用中實現硬體支援的端對端加密。PRF 用硬體綁定的秘密 + RP 提供的鹽值執行 HMAC，產生一個確定性的 32 位元組輸出。這個輸出再透過 HKDF 推導出 AES 金鑰。秘密永遠不會離開驗證器。Bitwarden 就用這個模式來實現零知識的保險庫加密。" },
      { front: "企業 Passkey 部署中的引導悖論是什麼？", back: "新員工需要強認證才能註冊他們的第一個 Passkey，但他們還沒有任何憑證。解決方案：Temporary Access Pass（TAP）——Microsoft Entra ID 的時效性一次性密碼。必須透過 Graph API 大規模自動化（isUsableOnce: true），並在首次使用後立即作廢。" },
      { front: "FIDO 代理式認證倡議是什麼？", back: "FIDO 聯盟的技術工作小組（2026 年 4 月），由 CVS Health、Google 和 OpenAI 共同主持，為 AI 代理認證制定標準。三個工作流：可驗證使用者指令、代理認證、以及商務受信委託。針對預計 2030 年達 5 兆美元的代理式商務市場。" }
    ],
    quiz: [
      {
        question: "正確的企業 Passkey 架構模式是什麼？",
        options: [
          "每個應用程式各自實作自己的 WebAuthn 伺服器",
          "IDP 中介：透過 Okta/Entra ID/Auth0 認證，再透過 SSO 發放 token 給下游應用",
          "一個集中式的 WebAuthn 代理攔截所有認證請求",
          "客戶端使用 Web Crypto API 進行 Passkey 驗證"
        ],
        correct: 1,
        explanation: "IDP 中介架構是正確的企業模式：Passkeys 在身分提供者（Okta、Microsoft Entra ID、Auth0）處認證，再由其發放 OIDC token 或 SAML assertion 給下游應用透過 SSO 存取。直接的 RP 對驗證器 Passkeys 無法擴展到數百個企業應用。"
      },
      {
        question: "PRF 擴充的輸出在用作加密金鑰之前需要什麼處理？",
        options: [
          "Base64 編碼將它轉成字串",
          "HKDF（RFC 5869）金鑰推導以產生正確的 AES 金鑰材料",
          "不需要處理——32 位元組輸出可直接作為 AES-256 金鑰使用",
          "RSA 包裹以在傳輸中保護金鑰"
        ],
        correct: 1,
        explanation: "PRF 的輸出是 Input Keying Material（IKM），不是最終金鑰。它必須透過 HKDF（RFC 5869）搭配域別資訊字串處理後，才能作為 AES 金鑰材料使用。直接使用原始 PRF 輸出會跳過提供域別分離和正確金鑰格式化的金鑰推導步驟。"
      }
    ],
    sources: [
      { title: "W3C WebAuthn Level 3: Extensions", url: "https://www.w3.org/TR/webauthn-3/#sctn-defined-extensions" },
      { title: "FIDO Alliance: Agentic Authentication TWG", url: "https://fidoalliance.org/" },
      { title: "Microsoft: Passwordless Deployment Guide", url: "https://learn.microsoft.com/en-us/entra/identity/authentication/howto-authentication-passwordless-deployment" },
      { title: "W3C Digital Credentials API", url: "https://wicg.github.io/digital-credentials/" }
    ]
  };
