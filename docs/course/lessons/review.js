/* 總複習測驗與參考資料 */
const REVIEW_QUESTIONS = [
  {
    question: "FIDO2 標準由哪兩個元件組成？",
    options: [
      "WebAuthn（瀏覽器 API）和 CTAP2（驗證器協定）",
      "OAuth 2.0 和 OpenID Connect",
      "TLS 和 X.509 憑證",
      "SAML 和 Kerberos"
    ],
    correct: 0,
    explanation: "FIDO2 = WebAuthn（W3C 瀏覽器 JavaScript API，用於瀏覽器到伺服器的通訊）+ CTAP2（FIDO 聯盟的 Client-to-Authenticator Protocol，用於瀏覽器/OS 到驗證器的通訊，透過 USB、NFC 或藍牙）。"
  },
  {
    question: "attestationObject 和 credentialPublicKey 使用什麼二進位格式編碼？",
    options: ["JSON", "Protocol Buffers", "CBOR（Concise Binary Object Representation）", "MessagePack"],
    correct: 2,
    explanation: "WebAuthn 使用 CBOR（RFC 8949）來編碼 attestationObject 和 COSE 金鑰，因為它比 JSON 小 20-50%，且原生支援二進位資料，這對頻寬受限的 NFC/BLE 驗證器通道至關重要。"
  },
  {
    question: "認證典禮中，驗證器簽署了什麼資料？",
    options: [
      "只有挑戰（challenge）的位元組",
      "concat(authenticatorData, SHA-256(clientDataJSON))",
      "使用者 ID 和密碼雜湊",
      "驗證器自行產生的隨機 nonce"
    ],
    correct: 1,
    explanation: "被簽署的資料是 concat(authenticatorData, SHA-256(clientDataJSON))。這將 rpIdHash（防釣魚保護）、flags（UP/UV）、signCount，以及來自 clientDataJSON 的 challenge + origin 全部綁定在一個不可偽造的簽章中。"
  },
  {
    question: "在 authenticatorData 中，什麼區分了同步 Passkey 和裝置綁定憑證？",
    options: [
      "signCount 永遠大於 1000",
      "AAGUID 被設為全零",
      "BE（Backup Eligible）和 BS（Backup State）旗標都被設為 1",
      "UV（User Verified）旗標未被設定"
    ],
    correct: 2,
    explanation: "同步 Passkeys 的 BE=1（位元 3，0x08：憑證可以同步）和 BS=1（位元 4，0x10：憑證目前已備份）。裝置綁定憑證的 BE=0, BS=0。這些旗標應該存到資料庫中以便制定安全策略決策。"
  },
  {
    question: "為什麼 Conditional UI 的 get() 呼叫需要在頁面載入時發起？",
    options: [
      "因為瀏覽器需要時間載入 CTAP2 驅動程式",
      "因為 Promise 會一直掛起直到使用者從自動填入中選取——在點擊時呼叫就失去了自動填入的 UX 意義",
      "因為 WebAuthn 需要 5 秒的暖機時間",
      "因為挑戰在產生後立即過期"
    ],
    correct: 1,
    explanation: "conditional 的 get() Promise 會無限期掛起，直到使用者從自動填入下拉選單中選取一個 Passkey。如果在按鈕點擊時才呼叫，自動填入建議要到點擊後才會出現，那就變成一般的 modal 流程了。重點是要在已儲存的密碼旁邊自動顯示 Passkeys。"
  },
  {
    question: "同步 Passkeys 的主要攻擊面是什麼？",
    options: [
      "破解 ECDSA P-256 演算法",
      "同步帳號（Apple ID、Google 帳號）的帳號接管",
      "在混合認證期間攔截藍牙通訊",
      "複製驗證器硬體"
    ],
    correct: 1,
    explanation: "同步架構（iCloud 鑰匙圈、Google 密碼管理器）才是真正的攻擊面。Passkey 的加密學是健全的，但如果攻擊者接管了同步帳號，就能存取所有同步的 Passkeys。這就是為什麼帳號復原設計需要和認證設計一樣嚴謹的安全考量。"
  },
  {
    question: "PRF 擴充的輸出在用作 AES 加密金鑰前需要什麼處理？",
    options: [
      "直接使用——32 位元組輸出就是有效的 AES-256 金鑰",
      "Base64url 編碼",
      "HKDF 金鑰推導（RFC 5869）搭配域別資訊",
      "RSA 加密包裹"
    ],
    correct: 2,
    explanation: "PRF 輸出是 Input Keying Material（IKM），不是最終金鑰。它必須透過 HKDF 搭配域別資訊字串處理後才能推導出正確的 AES 金鑰材料。直接使用會跳過域別分離和正確的金鑰格式化。"
  },
  {
    question: "大規模部署 Passkey 的正確企業架構是什麼？",
    options: [
      "每個應用程式各自執行自己的 WebAuthn 伺服器",
      "IDP 中介：在 Okta/Entra ID/Auth0 認證，透過 SSO 發放 OIDC/SAML token 給應用",
      "客戶端用 JavaScript 做 WebAuthn 驗證",
      "跨應用共享的私鑰資料庫"
    ],
    correct: 1,
    explanation: "IDP 中介模式是正確的：Passkeys 在身分提供者處認證，再由其發放標準化的 token（OIDC/SAML）給下游應用。直接的 RP 實作無法擴展到數百個企業應用，且會造成難以管理的憑證生命週期複雜性。"
  }
];

const OVERVIEW_SOURCES = [
  { title: "W3C WebAuthn Level 3 — Candidate Recommendation (May 2026)", url: "https://www.w3.org/TR/webauthn-3/" },
  { title: "FIDO Alliance Specifications & CTAP 2.3", url: "https://fidoalliance.org/specifications/" },
  { title: "NIST SP 800-63-4 Digital Identity Guidelines (July 2025)", url: "https://pages.nist.gov/800-63-4/" },
  { title: "passkeys.dev — Developer Reference Hub", url: "https://passkeys.dev/" },
  { title: "Passkey Central — FIDO UX Design Guidelines", url: "https://passkeycentral.org/" },
  { title: "MDN: Web Authentication API", url: "https://developer.mozilla.org/en-US/docs/Web/API/Web_Authentication_API" }
];
