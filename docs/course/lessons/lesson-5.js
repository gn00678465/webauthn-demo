/* 第 5 課 */
const LESSON_5 = {
    id: 5,
    title: "認證典禮（Assertion）深入解析",
    difficulty: "intermediate",
    objectives: [
      "為可發現式和非可發現式流程建構 PublicKeyCredentialRequestOptions",
      "實作伺服器端簽章驗證，包括 ES256 的 DER 編碼要求",
      "說明硬體 Token 與同步 Passkey（signCount=0）的 signCount 邏輯差異",
      "辨識憑證對使用者綁定的漏洞（CVE-2025-26788 模式）"
    ],
    body: `
      <h3>認證 API</h3>
      <pre>// 可發現式憑證 / Passkey 流程（不帶 allowCredentials）
const assertion = await navigator.credentials.get({
  publicKey: {
    challenge: newServerChallenge,
    rpId: "example.com",
    userVerification: "required",
    // allowCredentials: [] -- Passkey 流程省略此欄位
    timeout: 300000
  }
});

// 非可發現式 / 2FA 流程
const assertion = await navigator.credentials.get({
  publicKey: {
    challenge: newServerChallenge,
    rpId: "example.com",
    allowCredentials: [{
      type: "public-key",
      id: storedCredentialId,
      transports: ["internal", "hybrid"]
    }]
  }
});</pre>

      <h3>認證回應</h3>
      <p><code>AuthenticatorAssertionResponse</code> 包含四個欄位：</p>
      <ul>
        <li><code>clientDataJSON</code>——ArrayBuffer：type、challenge、origin</li>
        <li><code>authenticatorData</code>——ArrayBuffer：rpIdHash + flags + signCount（不含 attestedCredentialData）</li>
        <li><code>signature</code>——ArrayBuffer：ECDSA 使用 ASN.1 DER 編碼</li>
        <li><code>userHandle</code>——ArrayBuffer|null：註冊時的 user.id</li>
      </ul>

      <h3>簽章驗證</h3>
      <pre>// 被簽署的資料：
const signedData = concat(authenticatorData, SHA256(clientDataJSON));

// Node.js 中驗證 ES256：
const isValid = crypto.createVerify("SHA256")
  .update(signedData)
  .verify(
    { key: storedPublicKey, dsaEncoding: "der" },
    signature
  );</pre>

      <h3>伺服器端驗證檢查清單（8 個步驟）</h3>
      <ol>
        <li>用 rawId / credential ID 查找已儲存的憑證</li>
        <li>驗證 <code>clientDataJSON.type === "webauthn.get"</code></li>
        <li>驗證挑戰一致且已消耗（單次使用、立即作廢）</li>
        <li>驗證 origin 精確比對</li>
        <li>驗證 rpIdHash 等於設定的 RP ID 的 SHA-256</li>
        <li>檢查 flags：UP 必須設定；UV 若有要求也必須設定</li>
        <li>用已儲存的公鑰驗證簽章</li>
        <li>更新 signCount</li>
      </ol>

      <div class="callout-critical callout"><strong>重要：憑證對使用者的綁定。</strong>你必須驗證這個憑證「屬於」正在認證的使用者——不只是簽章有效就好。CVE-2025-26788（StrongKey FIDO Server）因為伺服器只檢查簽章有效性，卻沒有確認憑證是否屬於聲稱的使用者，導致了完整的帳號接管。</div>

      <h3>signCount 邏輯</h3>
      <p>硬體 Token 在每次認證時都會遞增 signCount。如果新的計數沒有嚴格大於已儲存的計數，驗證器可能已被複製。<strong>但是</strong>：同步 Passkeys 每次都回傳 signCount=0。規則如下：</p>
      <pre>if (storedCount !== 0 || responseCount !== 0) {
  if (responseCount &lt;= storedCount) {
    throw new Error("可能是被複製的驗證器");
  }
}
// 兩者都是 0？接受——該憑證的複製偵測已停用</pre>

      <h3>升級認證（Step-Up Authentication）</h3>
      <p>對於敏感操作（變更密碼、付款），無論現有 session 狀態如何，都觸發一次新的 WebAuthn 典禮。用時間戳記來防護：</p>
      <pre>if (!session.stepUpUntil || Date.now() > session.stepUpUntil) {
  return redirectToWebAuthnChallenge();
}</pre>
    `,
    flashcards: [
      { front: "什麼是憑證對使用者綁定的漏洞？", back: "CVE-2025-26788 模式：伺服器驗證簽章在加密學上是有效的，但沒有確認該憑證屬於正在認證的使用者。攻擊者可以在請求中替換自己的 credential ID，用自己的金鑰通過簽章驗證，從而取得受害者帳號的存取權。大約一半的自行實作都遺漏了這個檢查。" },
      { front: "signCount 在同步 Passkey 和硬體 Token 上有什麼不同？", back: "硬體 Token 每次認證時遞增 signCount——如果新計數沒有大於已儲存的，Token 可能被複製了。同步 Passkeys 永遠回傳 signCount=0，因為多個裝置合法地共享同一個憑證。當已儲存和回應的計數都是 0 時，直接接受（該憑證的複製偵測已停用）。" },
      { front: "為什麼挑戰必須立即消耗？", back: "挑戰必須在首次使用後立即作廢，即使驗證失敗也一樣。延遲消耗會開啟一個重放窗口，攻擊者可以在挑戰過期前重放捕獲到的回應。使用原子性的消耗並刪除語義（例如 Redis DEL 只會成功回傳一次）。" }
    ],
    quiz: [
      {
        question: "CVE-2025-26788 對 WebAuthn 伺服器實作有什麼啟示？",
        options: [
          "WebAuthn 簽章可以用足夠的算力偽造",
          "伺服器必須驗證憑證屬於聲稱的使用者，不只是簽章有效就好",
          "ECDSA 簽章比 RSA 不安全",
          "signCount 必須永遠大於零"
        ],
        correct: 1,
        explanation: "CVE-2025-26788（StrongKey FIDO Server）證明了僅驗證加密簽章是不夠的。伺服器還必須確認 credential ID 確實與嘗試認證的使用者相關聯。缺少這個綁定檢查，攻擊者可以註冊自己的憑證，然後用它以任何使用者的身分進行認證。"
      }
    ],
    sources: [
      { title: "W3C WebAuthn Level 3: Assertion", url: "https://www.w3.org/TR/webauthn-3/#sctn-verifying-assertion" },
      { title: "MDN: navigator.credentials.get()", url: "https://developer.mozilla.org/en-US/docs/Web/API/CredentialsContainer/get" },
      { title: "The Copenhagen Book: WebAuthn Verification", url: "https://thecopenhagenbook.com/webauthn" },
      { title: "WorkOS: Cryptographic Origin Binding", url: "https://workos.com/blog/cryptographic-origin-binding" }
    ]
  };
