/* 第 7 課 */
const LESSON_7 = {
    id: 7,
    title: "安全性、UX 設計與瀏覽器相容性",
    difficulty: "advanced",
    objectives: [
      "說明 WebAuthn 防釣魚的兩層保護：rpIdHash 綁定和 origin 綁定",
      "辨識真實世界的攻擊向量：DEF CON 33 提示欺騙、瀏覽器擴充功能劫持、CVE 漏洞",
      "應用 UX 設計模式：觸發式註冊、漸進式採用和無障礙設計",
      "掌握瀏覽器/平台相容性矩陣，包括關鍵缺口（Windows 10、Linux、Android NFC）"
    ],
    body: `
      <h3>兩層防釣魚保護</h3>
      <p><strong>第一層——rpIdHash：</strong>authenticatorData 的前 32 位元組是 RP ID 的 SHA-256。在 'bank.com' 註冊的憑證無法在 'evil-bank.com' 使用，因為 rpIdHash 不會匹配。這由驗證器強制執行。</p>
      <p><strong>第二層——Origin 綁定：</strong>瀏覽器獨立捕捉完整的來源（scheme+host+port）到 clientDataJSON 中。這個值來自瀏覽器的導航上下文，無法被 JavaScript 覆寫。伺服器會將它與允許清單比對。</p>
      <p>AiTM 代理為什麼會失敗：代理的 origin 被記錄到 clientDataJSON 中，而不是合法網站的 origin。伺服器會拒絕。</p>

      <h3>已知的攻擊向量</h3>
      <ul>
        <li><strong>DEF CON 33（2025 年 8 月）：</strong>針對同步 Passkeys 的 UI 層級提示欺騙——精確到像素的 OS 對話框仿製品，在活躍的 session 中攔截使用者。對硬體安全晶片中的裝置綁定 Passkeys 無效。</li>
        <li><strong>SquareX（DEF CON 2025）：</strong>惡意瀏覽器擴充功能在驗證器「看到」之前就劫持了 WebAuthn API，產生攻擊者控制的金鑰對。這是瀏覽器安全問題，不是協定漏洞。</li>
        <li><strong>CVE-2024-9956</strong>（Chrome Android）：藍牙範圍內的攻擊者透過 FIDO:/ URI 處理觸發未經使用者互動的未授權 Passkey 認證。</li>
        <li><strong>CVE-2025-26788</strong>（StrongKey）：缺少憑證對使用者的綁定檢查，允許完整的帳號接管。</li>
      </ul>

      <h3>五個最常見的伺服器端邏輯缺陷</h3>
      <ol>
        <li>可預測或可重複使用的挑戰</li>
        <li>缺少憑證對使用者的綁定</li>
        <li>演算法混淆（沒檢查 COSE 演算法是否與註冊時一致）</li>
        <li>跳過 origin 或 rpIdHash 驗證</li>
        <li>缺少 UP/UV 旗標檢查</li>
      </ol>

      <h3>UX 設計模式</h3>
      <ul>
        <li><strong>觸發式註冊</strong>——在密碼登入成功後立即自動提示。eBay 相比將選項藏在設定頁面中，獲得了 102% 的採用率提升。</li>
        <li><strong>便利性導向的文案</strong>——「簡化你的登入」比安全性訊息更有效。Google 發現「建立 Passkey」比「新增 Passkey」更好。</li>
        <li><strong>靜默轉換</strong>——在不需要使用者操作的情況下，從已儲存的密碼建立 Passkeys（Roblox 手機端 50%、TikTok iOS）。</li>
        <li><strong>管理介面</strong>——每個 Passkey 的卡片，顯示建立日期、生態系來源（AAGUID 查詢）、最後使用時間、刪除選項。</li>
      </ul>
      <div class="callout">在沒有 Passkey 管理介面的情況下就推出 Passkey 註冊是反模式——會讓使用者覺得被困住了。FIDO 聯盟要求同時提供建立和管理兩種設計模式。</div>

      <h3>瀏覽器/平台相容性</h3>
      <ul>
        <li><strong>Windows 10：</strong>不支援 Conditional UI、不支援 PRF——最大的企業缺口</li>
        <li><strong>Linux：</strong>沒有原生平台驗證器——只能用混合 QR 或硬體金鑰</li>
        <li><strong>Android NFC：</strong>不支援透過 NFC 的 CTAP2（Android 上無法透過 NFC 使用可發現式憑證）</li>
        <li><strong>Safari：</strong>Safari 17.3 及更早版本中，create()/get() 必須在原生 click handler 內呼叫</li>
        <li><strong>Firefox Android：</strong>歷史上問題較多；部署前務必明確測試</li>
        <li><strong>全球 WebAuthn 覆蓋率：</strong>94.05%；Passkeys 特定覆蓋率：91.04%</li>
      </ul>

      <h3>生產環境實績</h3>
      <ul>
        <li>Google：設為預設後 Passkey 增長 352%</li>
        <li>TikTok：90%+ 成功率，比 Email OTP 快 20 倍</li>
        <li>Uber：認證速度快 5 倍，成功率高 2 倍</li>
        <li>DocuSign：99% 成功率，部署超過 1100 萬個 Passkeys</li>
      </ul>
    `,
    flashcards: [
      { front: "為什麼 AiTM（中間人代理）攻擊對 WebAuthn 無效？", back: "瀏覽器從它的導航上下文中獨立記錄完整的 origin（scheme+host+port）到 clientDataJSON——JavaScript 無法覆寫這個值。當使用者在釣魚代理上時，代理的 origin 會被記錄，而不是合法網站的。伺服器的 origin 檢查會拒絕該請求。此外，代理的 rpIdHash 也不存在對應的憑證。" },
      { front: "什麼是觸發式註冊？為什麼它很有效？", back: "觸發式註冊是在密碼登入成功後立即自動提示建立 Passkey。eBay 相比將選項藏在帳號設定中，獲得了 102% 的採用率提升。它之所以有效，是因為使用者正處於安全意識狀態、裝置在手邊、而且剛剛證明了自己的身分。75% 的新 Passkey 註冊來自觸發式提示。" },
      { front: "2026 年 Passkeys 的關鍵平台缺口有哪些？", back: "Windows 10：不支援 Conditional UI 或 PRF。Linux：沒有原生平台驗證器（只能用 QR/混合或硬體金鑰）。Android：不支援透過 NFC 的 CTAP2（打破了 NFC 安全金鑰的預期）。Safari 17.3 及更早版本：需要在原生 click handler 內呼叫。Firefox Android：歷史上不穩定，務必明確測試。" }
    ],
    quiz: [
      {
        question: "DEF CON 33 的 Passkey 提示欺騙攻擊是怎麼運作的？",
        options: [
          "破解 WebAuthn 加密協定",
          "顯示精確到像素的假 OS 對話框來攔截使用者的生物辨識，只對同步 Passkeys 有效",
          "利用 CTAP2 藍牙傳輸中的漏洞",
          "注入惡意 JavaScript 來覆寫 navigator.credentials"
        ],
        correct: 1,
        explanation: "Allthenticate 在 DEF CON 33 的研究展示了 UI 層級的提示欺騙：一個精確到像素的 OS Passkey 對話框仿製品，在活躍的 session 中攔截使用者。這不是協定層級的攻擊——WebAuthn 的加密學是完整的。它對硬體安全晶片中的裝置綁定 Passkeys 無效，因為真正的安全晶片對話框無法在 OS 層級被仿製。"
      },
      {
        question: "什麼單一 UX 改變讓 eBay 的 Passkey 採用率增加了 102%？",
        options: [
          "重新設計 Passkey 管理頁面",
          "在密碼登入成功後立即自動提示建立 Passkey（觸發式註冊）",
          "發送關於 Passkey 好處的電子郵件行銷活動",
          "強制所有新帳號使用 Passkeys"
        ],
        correct: 1,
        explanation: "觸發式註冊——在密碼登入成功後立即呈現 Passkey 建立提示——帶來了 102% 的採用率增長。時機是關鍵：使用者處於認證情境中、剛剛證明了身分、裝置也在手邊。這個單一的提示改變佔了所有新 Passkey 註冊的 75%。"
      }
    ],
    sources: [
      { title: "WorkOS: Cryptographic Origin Binding", url: "https://workos.com/blog/cryptographic-origin-binding" },
      { title: "Passkey Central — FIDO UX Guidelines", url: "https://passkeycentral.org/" },
      { title: "Can I Use: WebAuthn", url: "https://caniuse.com/webauthn" },
      { title: "passkeys.dev: Device Support", url: "https://passkeys.dev/device-support/" }
    ]
  };
