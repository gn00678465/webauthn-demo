/* 第 2 課 */
const LESSON_2 = {
    id: 2,
    title: "加密基礎知識",
    difficulty: "beginner",
    objectives: [
      "說明非對稱加密如何消除 WebAuthn 中的共享秘密",
      "辨識三種主要簽章演算法（ES256、RS256、EdDSA）及其 COSE 識別碼",
      "描述 CBOR 和 COSE 編碼格式，以及 WebAuthn 選擇它們而非 JSON 的原因",
      "追蹤驗證器在典禮（ceremony）中實際簽署了什麼資料"
    ],
    body: `
      <h3>WebAuthn 中的公鑰加密</h3>
      <p>WebAuthn 使用<strong>非對稱金鑰對</strong>：私鑰（儲存在驗證器的安全晶片中）和公鑰（儲存在伺服器上）。伺服器<em>永遠</em>不持有秘密。認證時，驗證器透過簽署挑戰（challenge）來證明它持有私鑰——簽章可以用公鑰驗證，但無法用來推導出私鑰。</p>

      <h3>簽章演算法</h3>
      <p>WebAuthn 使用 COSE（CBOR Object Signing and Encryption）的整數識別碼來表示演算法。你必須支援以下三種：</p>
      <ul>
        <li><strong>ES256</strong>（COSE ID <code>-7</code>）——ECDSA 搭配 P-256 曲線 + SHA-256。支援度最廣：Apple Touch ID/Face ID、Android、Windows 11+、大多數安全金鑰。約 128 位元安全性。公鑰 = 64 位元組（32 位元組 x + 32 位元組 y）。</li>
        <li><strong>RS256</strong>（COSE ID <code>-257</code>）——RSA PKCS#1 v1.5 + SHA-256。Windows 10 Hello（TPM）必需。最少 2048 位元金鑰。</li>
        <li><strong>EdDSA</strong>（COSE ID <code>-8</code>）——Ed25519。YubiKey 5.2+ 和 SoloKey 支援。速度快、32 位元組精簡公鑰。</li>
      </ul>
      <pre>// 建議的 pubKeyCredParams 陣列
pubKeyCredParams: [
  { type: "public-key", alg: -7   }, // ES256
  { type: "public-key", alg: -257 }, // RS256
  { type: "public-key", alg: -8   }, // EdDSA
]</pre>

      <h3>CBOR 與 COSE</h3>
      <p><strong>CBOR</strong>（Concise Binary Object Representation，RFC 8949）是一種二進位序列化格式，比 JSON 小 20-50%。WebAuthn 用它來編碼 <code>attestationObject</code> 和 <code>credentialPublicKey</code>，因為驗證器是透過頻寬有限的通道（NFC、BLE）進行通訊。</p>
      <p><strong>COSE_Key</strong> 使用整數標籤：正整數代表標準欄位（<code>kty=1</code>、<code>alg=3</code>），<em>負整數</em>代表演算法特定參數（<code>crv=-1</code>、<code>x=-2</code>、<code>y=-3</code>）。</p>
      <pre>// ES256 (P-256) 的 COSE_Key
{
  1: 2,    // kty: EC2
  3: -7,   // alg: ES256
  -1: 1,   // crv: P-256
  -2: &lt;x&gt;, // x 座標 (32 bytes)
  -3: &lt;y&gt;  // y 座標 (32 bytes)
}</pre>

      <h3>驗證器簽署了什麼？</h3>
      <p>認證時，驗證器簽署的內容是：</p>
      <pre>signedData = concat(authenticatorData, SHA-256(clientDataJSON))</pre>
      <p>這將 RP ID 雜湊值（防釣魚保護）、使用者存在/驗證旗標、簽名計數器，<em>以及</em>來自 clientDataJSON 的挑戰 + 來源，全部綁定在一個不可偽造的簽章中。</p>

      <div class="callout">挑戰（challenge）是協定的加密心跳：它必須由伺服器產生、至少 16 位元組熵值（建議 32 位元組）、且只能使用一次。移除隨機性會讓安全性完全崩潰。</div>

      <h3>硬體安全晶片</h3>
      <p>私鑰在專用硬體中產生並儲存：Apple Secure Enclave、Android StrongBox Keymaster，或 TPM（Trusted Platform Module）。金鑰<em>永遠不會離開</em>安全晶片——所有簽章運算都在裡面完成。這是硬體層面的保證，不是軟體承諾。</p>
    `,
    flashcards: [
      { front: "ES256 的 COSE 演算法 ID 是什麼？", back: "-7。ES256 使用 ECDSA 搭配 P-256（secp256r1）曲線和 SHA-256。它在平台驗證器中擁有最廣泛的支援度，產生 64 位元組的公鑰（32 位元組 x + 32 位元組 y 座標）。簽章採用 ASN.1 DER 編碼。" },
      { front: "WebAuthn 為什麼用 CBOR 而不是 JSON？", back: "CBOR（Concise Binary Object Representation）比 JSON 小 20-50%，且原生支援二進位資料。這對於透過頻寬受限通道（NFC 424 Kbps、BLE 1 Mbps）通訊的驗證器來說很重要。attestationObject 和 credentialPublicKey 一律使用 CBOR 編碼。" },
      { front: "認證時，驗證器實際簽署了什麼資料？", back: "signedData = concat(authenticatorData, SHA-256(clientDataJSON))。這涵蓋了：rpIdHash（防釣魚保護）、flags（UP/UV/BE/BS）、signCount（偵測複製）、以及來自 clientDataJSON 的 challenge 和 origin。簽章證明驗證器在典禮時持有私鑰。" }
    ],
    quiz: [
      {
        question: "為了相容 Windows 10 Hello，pubKeyCredParams 中「必須」包含哪個演算法？",
        options: [
          "ES256（COSE ID -7）",
          "RS256（COSE ID -257）",
          "EdDSA（COSE ID -8）",
          "PS256（COSE ID -37）"
        ],
        correct: 1,
        explanation: "RS256（RSA PKCS#1 v1.5 + SHA-256，COSE ID -257）是 Windows 10 Hello 特別需要的，因為它使用基於 TPM 的 RSA 金鑰。Windows 11+ 原生支援 ES256，但 RS256 確保了向後相容性。"
      }
    ],
    sources: [
      { title: "IETF RFC 8949 — CBOR", url: "https://datatracker.ietf.org/doc/html/rfc8949" },
      { title: "IETF RFC 9052 — COSE Structures", url: "https://datatracker.ietf.org/doc/html/rfc9052" },
      { title: "Corbado: CBOR and COSE in WebAuthn", url: "https://www.corbado.com/blog/webauthn-pubkeycredparams-credentialpublickey" },
      { title: "WebAuthn Guide", url: "https://webauthn.guide/" }
    ]
  };
