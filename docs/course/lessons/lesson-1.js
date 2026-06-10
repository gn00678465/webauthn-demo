/* 第 1 課 */
const LESSON_1 = {
    id: 1,
    title: "密碼的困境與 FIDO 的演進",
    difficulty: "beginner",
    objectives: [
      "說明密碼為何在結構上就是有缺陷的，並辨識各種傳統 MFA 方法的攻擊向量",
      "追溯從 FIDO UAF/U2F (2014) 到 FIDO2 (2018) 再到 Passkeys (2022+) 的演進歷程",
      "描述 FIDO 聯盟的使命，以及全球監管機構轉向抗釣魚認證的趨勢",
      "闡述 Passkeys 如何「從設計上」消除整個攻擊類別，而非只是做風險緩解"
    ],
    body: `
      <h3>密碼為什麼行不通？</h3>
      <p>根據 Verizon DBIR 報告，77% 的駭客入侵事件涉及被竊取或弱密碼。密碼的根本問題在於它是<strong>共享秘密（shared secret）</strong>——它同時存在於使用者端和伺服器端。任何共享秘密都可以被釣魚、外洩或暴力破解。</p>
      <p>第二因子驗證方法嘗試解決這個問題，但各自帶來了新的弱點：</p>
      <ul>
        <li><strong>SMS OTP</strong>——容易被 SIM 卡劫持（SIM swap）、SS7 攔截</li>
        <li><strong>TOTP</strong>（如 Google Authenticator）——容易被即時中間人代理攻擊（AiTM）即時轉發驗證碼</li>
        <li><strong>推播通知</strong>——容易被 MFA 疲勞攻擊（一直彈出提示直到使用者按同意）</li>
      </ul>

      <h3>FIDO 聯盟</h3>
      <p>FIDO（Fast IDentity Online）聯盟於 2013 年 2 月成立，目前有超過 250 個成員（Apple、Google、Microsoft、Amazon、Visa、Mastercard 等）。它的使命是解決密碼的<em>結構性失敗</em>——不是改善密碼，而是用公鑰加密技術完全取代密碼。</p>

      <h3>演進時間軸</h3>
      <ul>
        <li><strong>2014 年 12 月</strong>——FIDO 1.0：UAF（無密碼生物辨識）及 U2F（硬體安全金鑰作為第二因子）</li>
        <li><strong>2018 年</strong>——FIDO2 發布：結合 WebAuthn（W3C 瀏覽器 API）+ CTAP2（驗證器協定）</li>
        <li><strong>2019 年 3 月</strong>——WebAuthn 成為 W3C 正式網頁標準</li>
        <li><strong>2022 年</strong>——Apple iOS 16、Google、Microsoft 宣布支援 Passkeys（跨裝置同步憑證）</li>
        <li><strong>2025 年 5 月</strong>——Microsoft 將 Passkeys 設為預設登入方式</li>
        <li><strong>2025 年 7 月</strong>——NIST SP 800-63-4 正式認可同步 Passkeys 符合 AAL2 等級</li>
        <li><strong>2026 年</strong>——全球 50 億個活躍 Passkeys；阿聯酋、印度、菲律賓禁用 SMS OTP</li>
      </ul>

      <div class="callout">Passkeys 不是「又一種 MFA 方法」。它從根本上消除了共享秘密——伺服器永遠不會儲存任何可以被釣魚或外洩的東西。</div>

      <h3>採用里程碑（2026 年）</h3>
      <ul>
        <li>150 億個使用者帳號可使用 FIDO2 認證</li>
        <li>69% 的消費者至少擁有一個 Passkey</li>
        <li>前 100 大網站中有 48% 支援 Passkeys</li>
        <li>87% 的企業正在部署或試行 FIDO2</li>
      </ul>
    `,
    flashcards: [
      { front: "密碼的根本安全缺陷是什麼？", back: "密碼是共享秘密（shared secret）——它同時存在於客戶端和伺服器端。任何共享秘密都可以被釣魚、外洩、暴力破解或攔截。WebAuthn 使用非對稱公鑰加密技術來消除這個問題，伺服器端永遠不持有任何秘密。" },
      { front: "FIDO2 由哪兩個部分組成？", back: "FIDO2 恰好由兩個元件組成：WebAuthn（W3C 瀏覽器 JavaScript API，負責註冊和認證）以及 CTAP2（FIDO 聯盟的 Client-to-Authenticator Protocol，負責瀏覽器/OS 與外部驗證器之間透過 USB、NFC 或藍牙的通訊）。" },
      { front: "為什麼 TOTP（驗證器 App）仍然容易被釣魚？", back: "TOTP 驗證碼在一個時間窗口內有效（通常 30 秒）。中間人代理（AiTM）可以即時將驗證碼轉發到真正的伺服器。TOTP 沒有來源綁定（origin binding）——無論使用者在哪個網站輸入，驗證碼都能用。" }
    ],
    quiz: [
      {
        question: "FIDO 聯盟為什麼選擇公鑰加密技術，而不是改善密碼？",
        options: [
          "密碼是結構性問題（共享秘密），無法透過增加強度來修復",
          "密碼對於現代認證來說太慢了",
          "公鑰加密技術的實作成本比密碼雜湊更低",
          "瀏覽器原生不支援基於密碼的認證"
        ],
        correct: 0,
        explanation: "核心問題在於密碼是儲存在伺服器上的共享秘密。無論怎麼加強雜湊、加鹽或複雜度要求，都無法消除伺服器端秘密可被竊取的根本弱點。公鑰加密技術確保伺服器端完全不儲存任何秘密。"
      },
      {
        question: "2025 年 7 月，Passkeys 達成了什麼監管里程碑？",
        options: [
          "歐盟禁止所有基於密碼的認證",
          "NIST SP 800-63-4 正式認可同步 Passkeys 符合 AAL2 等級",
          "FIDO 聯盟強制要求所有網站使用 Passkeys",
          "WebAuthn Level 3 成為 W3C 正式推薦標準"
        ],
        correct: 1,
        explanation: "NIST SP 800-63-4（2025 年 7 月）正式認可同步 Passkeys 符合 Authenticator Assurance Level 2（AAL2），為企業採用提供了監管基礎。這是一個關鍵里程碑，因為先前的 NIST 指引並未明確涵蓋同步憑證。"
      }
    ],
    sources: [
      { title: "Verizon Data Breach Investigations Report", url: "https://www.verizon.com/business/resources/reports/dbir/" },
      { title: "FIDO Alliance Specifications", url: "https://fidoalliance.org/specifications/" },
      { title: "NIST SP 800-63-4 Digital Identity Guidelines", url: "https://pages.nist.gov/800-63-4/" },
      { title: "FIDO Alliance: A Brief History", url: "https://www.daon.com/resource/a-brief-history-of-fido/" }
    ]
  };
