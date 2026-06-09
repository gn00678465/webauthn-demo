/* 第 3 課 */
const LESSON_3 = {
    id: 3,
    title: "FIDO2 架構與三方模型",
    difficulty: "beginner",
    objectives: [
      "繪製三方模型圖：信賴方（Relying Party）、客戶端/瀏覽器、驗證器",
      "區分 WebAuthn（瀏覽器到伺服器）和 CTAP2（瀏覽器到驗證器）的範疇",
      "用實際範例比較平台驗證器與漫遊驗證器的差異",
      "描述 CTAP 2.1/2.2 的企業功能擴充及 FIDO 認證計畫"
    ],
    body: `
      <h3>FIDO2 = WebAuthn + CTAP2</h3>
      <p>FIDO2 是一個傘式標準，恰好由兩個元件組成：</p>
      <ul>
        <li><strong>WebAuthn</strong>（W3C）——瀏覽器 JavaScript API。涵蓋瀏覽器到伺服器的通訊：<code>navigator.credentials.create()</code> 和 <code>.get()</code></li>
        <li><strong>CTAP2</strong>（FIDO 聯盟）——Client to Authenticator Protocol。涵蓋瀏覽器/OS 到驗證器的通訊，透過 USB、NFC 或藍牙</li>
      </ul>

      <h3>三方模型</h3>
      <p>每一個 FIDO2 流程都涉及三個參與者，它們之間<em>永遠不會直接通訊</em>：</p>
      <ol>
        <li><strong>信賴方（Relying Party, RP）</strong>——你的網頁應用程式。負責產生挑戰、驗證回應、儲存公鑰</li>
        <li><strong>客戶端/瀏覽器</strong>——中介所有通訊。捕捉來源（origin）、強制 HTTPS、呈現 UI</li>
        <li><strong>驗證器（Authenticator）</strong>——產生金鑰對、將私鑰儲存在安全硬體中、產生簽章</li>
      </ol>
      <div class="callout">RP 和驗證器永遠不會直接通訊。瀏覽器中介一切。這個分離是根本性的——瀏覽器獨立捕捉來源（origin）作為防釣魚保護，RP 和釣魚攻擊者都無法覆寫。</div>

      <h3>CTAP2 核心指令</h3>
      <ul>
        <li><code>authenticatorMakeCredential</code>——註冊：建立金鑰對</li>
        <li><code>authenticatorGetAssertion</code>——認證：簽署挑戰</li>
        <li><code>authenticatorGetInfo</code>——功能探索</li>
        <li><code>authenticatorClientPIN</code>——PIN 管理</li>
      </ul>

      <h3>平台驗證器 vs 漫遊驗證器</h3>
      <p><strong>平台驗證器</strong>內建在裝置中：Apple Touch ID/Face ID（Secure Enclave）、Windows Hello（TPM）、Android 生物辨識（StrongBox）。它們可以透過雲端同步憑證（iCloud 鑰匙圈、Google 密碼管理器）——這就是定義「Passkey」體驗的關鍵。</p>
      <p><strong>漫遊驗證器</strong>是外部硬體：YubiKey、Google Titan Key、SoloKey。它們透過 USB/NFC/BLE 連接。私鑰永久綁定在實體裝置上——無法同步或匯出。搭配 FIDO 認證硬體可提供 AAL3 等級安全性。</p>

      <h3>CTAP 2.1 和 2.2 新增功能</h3>
      <ul>
        <li><strong>企業證明（Enterprise Attestation）</strong>——序號層級的裝置識別，用於組織管控</li>
        <li><strong>憑證管理（Credential Management）</strong>——刪除特定憑證，不需要重設整個裝置</li>
        <li><strong>credProtect 擴充</strong>——要求使用者驗證（UV）才能存取憑證</li>
        <li><strong>largeBlob 儲存</strong>——在驗證器上儲存憑證或資料</li>
        <li><strong>混合傳輸（Hybrid transport）</strong>（2.2）——透過 QR 碼 + BLE 近距離驗證進行跨裝置認證</li>
        <li><strong>CTAP 2.3</strong>（2026 年 2 月）——混合互動的多資料傳輸通道</li>
      </ul>

      <h3>FIDO 認證等級</h3>
      <p>FIDO 聯盟營運一套累進式認證計畫：<strong>L1</strong>（協定合規）、<strong>L2</strong>（硬體隔離、認可實驗室審查）、<strong>L3</strong>（實體攻擊防禦、滲透測試）、<strong>L3+</strong>（晶片級智慧卡防禦）。</p>
    `,
    flashcards: [
      { front: "FIDO2 的兩個元件是什麼？", back: "WebAuthn（W3C 瀏覽器 JavaScript API，定義瀏覽器到伺服器的通訊）和 CTAP2（FIDO 聯盟的 Client-to-Authenticator Protocol，定義瀏覽器/OS 到驗證器的通訊，透過 USB、NFC 或藍牙）。CTAP1 是舊版 U2F 協定的向後相容名稱。" },
      { front: "平台驗證器和漫遊驗證器有什麼不同？", back: "平台驗證器內建在裝置中（Touch ID、Windows Hello、Android 生物辨識），可以透過雲端同步憑證。漫遊驗證器是外部硬體（YubiKey、Titan Key），透過 USB/NFC/BLE 連接——私鑰永久綁定且無法同步。漫遊驗證器提供 AAL3 等級；同步的平台驗證器提供 AAL2 等級。" },
      { front: "什麼是 AAGUID？", back: "Authenticator Attestation Globally Unique Identifier——一個 16 位元組的 UUID，在註冊時嵌入 authenticatorData 中。它識別的是驗證器「型號」（例如所有 YubiKey 5 NFC 共用同一個 AAGUID），不是特定個體。搭配 FIDO MDS3 使用可查詢中繼資料和安全公告。Apple 基於隱私考量會將它歸零。" }
    ],
    quiz: [
      {
        question: "為什麼信賴方（RP）和驗證器永遠不會直接通訊？",
        options: [
          "因為瀏覽器會獨立捕捉來源（origin），提供任何一方都無法覆寫的防釣魚保護",
          "因為直接通訊需要驗證器能連上網路",
          "因為 RP 不知道使用者用的是哪種驗證器",
          "因為 CTAP2 不支援 HTTP"
        ],
        correct: 0,
        explanation: "瀏覽器作為可信的中介者，獨立記錄頁面來源到 clientDataJSON 中。這個來源無法被 JavaScript 或攻擊者覆寫。如果 RP 和驗證器直接通訊，這種獨立的來源捕捉就會被繞過，防釣魚能力就會被摧毀。"
      }
    ],
    sources: [
      { title: "Corbado: WebAuthn vs CTAP vs FIDO2", url: "https://www.corbado.com/blog/webauthn-vs-ctap-vs-fido2" },
      { title: "Yubico: CTAP2 Developer Guide", url: "https://developers.yubico.com/CTAP/" },
      { title: "FIDO Alliance Certification Levels", url: "https://fidoalliance.org/certification/authenticator-certification-levels/" },
      { title: "FIDO Metadata Service", url: "https://fidoalliance.org/metadata/" }
    ]
  };
