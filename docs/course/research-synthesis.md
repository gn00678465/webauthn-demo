# WebAuthn and Passkeys: The Complete Professional Curriculum

## Overview
This curriculum synthesizes comprehensive research across 13 domains covering every aspect of WebAuthn, Passkeys, FIDO2, and the broader passwordless authentication ecosystem. It is structured as a progressive learning journey from foundational concepts to expert-level implementation, security analysis, and emerging standards. Each module builds on the previous, establishing the theoretical grounding before moving to practical application. By the end of this curriculum, a learner will be capable of architecting, implementing, auditing, and deploying production-grade passkey systems — skills that are increasingly critical as 87% of enterprises deploy FIDO2 and regulatory mandates eliminate legacy MFA globally. The material is drawn from W3C WebAuthn Level 3 (Candidate Recommendation, May 2026), FIDO Alliance specifications through CTAP 2.3, real-world CVE analysis, production deployment case studies from Google, Microsoft, Amazon, eBay, and Roblox, and security research presented at DEF CON 33.

**Total Estimated Hours: 150**
**Total Topics Researched: 13**
**Total Key Findings: 176**
**Total Concepts Documented: 162**

---

## Module 1: The History and Evolution of Web Authentication
**Difficulty: Beginner**

### Topics
- The password problem: why passwords fail at scale (77% of hacking breaches involve stolen or weak passwords, Verizon DBIR)
- Early authentication attempts: username/password, HTTP Basic Auth, session cookies
- Second-factor authentication (2FA): SMS OTP, TOTP authenticator apps, push notifications
- Vulnerabilities of each legacy method: SIM swap fraud, SS7 interception, real-time AiTM relay attacks, MFA fatigue
- FIDO Alliance founding in February 2013 and its mission to reduce reliance on passwords
- FIDO 1.0 (December 2014): UAF (Universal Authentication Framework) and U2F (Universal Second Factor)
- FIDO UAF: passwordless biometric authentication using device-generated key pairs
- FIDO U2F: hardware security keys as second factors alongside passwords
- The U2F protocol timeline: U2F 1.0 (October 2014), UAF 1.1 (February 2017), U2F 1.2 (July 2017)
- The transition to FIDO2: joint W3C/FIDO Alliance project, 2018 release
- WebAuthn becomes official W3C standard in March 2019
- CTAP1: the backward-compatible name for U2F, allowing legacy U2F devices in FIDO2 flows
- The passkey era: Apple iOS 16/macOS Ventura (2022), Google accounts (2023), Microsoft default (May 2025)
- Adoption milestones: 1 billion passkey activations, 15 billion accounts supporting passkeys, 5 billion active passkeys (2026)
- The regulatory shift: NIST SP 800-63-4 (July 2025) formally recognizing synced passkeys as AAL2-compliant
- SMS OTP bans: UAE (March 2026 deadline), India (April 2026), Philippines, US USPTO, FINRA

### Key Takeaways
- Every legacy authentication method has a known, exploitable attack vector; passkeys eliminate entire attack categories by design rather than by mitigation
- The FIDO Alliance was founded specifically to address the structural failure of passwords, not to improve them
- The evolution from U2F hardware keys to synced multi-device passkeys represents a decade of iterative standardization
- Regulatory mandates are now eliminating SMS OTP in financial services globally, making FIDO2 adoption a compliance requirement, not just a security preference
- Understanding the history is essential for explaining to stakeholders why passkeys are not just 'another MFA method'

### Practical Exercises
- Perform an AiTM phishing simulation against a TOTP-protected account to viscerally understand why TOTP is not phishing-resistant
- Audit an existing application's authentication stack and classify each method against NIST SP 800-63-4 AAL levels
- Register a physical YubiKey as a FIDO U2F token on GitHub and document the experience, then register a passkey and compare the user flows
- Read CVE records for SIM swap incidents and map the attack steps to understand the structural vulnerability
- Create a threat model timeline showing which attacks were possible against authentication in 2014, 2019, and 2026

---

## Module 2: Cryptographic Foundations of WebAuthn
**Difficulty: Beginner**

### Topics
- Public-key cryptography fundamentals: key pairs, digital signatures, and verification
- Why asymmetric cryptography eliminates shared secrets from the server
- Elliptic Curve Digital Signature Algorithm (ECDSA): the P-256 (secp256r1) curve
- ES256 (COSE ID -7): ECDSA with P-256 and SHA-256, the most widely supported WebAuthn algorithm
- RSA: RSASSA-PKCS1-v1_5 and RS256 (COSE ID -257) for Windows Hello and legacy devices
- Edwards-curve Digital Signature Algorithm (EdDSA): Ed25519 and COSE ID -8, supported by YubiKey 5+
- Algorithm selection strategy: always include ES256 (-7), RS256 (-257), and EdDSA (-8) in pubKeyCredParams
- SHA-256 hashing: its role in WebAuthn for rpIdHash, clientDataHash, and challenge binding
- CBOR (Concise Binary Object Representation): RFC 8949, major types (0-7), deterministic encoding
- Why WebAuthn chose CBOR over JSON: compactness (20-50% smaller), binary data support, bandwidth constraints on NFC/BLE
- COSE (CBOR Object Signing and Encryption): RFC 8152, RFC 9052, RFC 9053
- COSE_Key structure: positive integer labels (kty=1, alg=3) and negative integer labels (crv=-1, x=-2, y=-3 for EC2)
- COSE_Key for ES256: {1:2, 3:-7, -1:1, -2:<x 32 bytes>, -3:<y 32 bytes>}
- COSE_Key for EdDSA: {1:1, 3:-8, -1:6, -2:<public key 32 bytes>}
- base64url encoding: URL-safe Base64 without padding, '+' to '-', '/' to '_', strip '='
- The challenge-response protocol: how random server challenges prevent replay attacks
- The signature over concat(authenticatorData, SHA-256(clientDataJSON)): what is actually signed and why
- Hardware secure enclaves: Apple Secure Enclave, Android StrongBox Keymaster, TPM (Trusted Platform Module)
- Why private keys never leave the secure enclave in hardware-backed implementations
- HKDF (RFC 5869) for key derivation from PRF extension output

### Key Takeaways
- The private key never leaves the authenticator — this is a hardware guarantee, not a software promise
- CBOR encoding is mandatory for the attestationObject and credentialPublicKey; every implementation must include a CBOR library
- COSE uses negative integer labels for algorithm-specific parameters, which surprises developers unfamiliar with the format
- ES256 has the broadest platform authenticator support; RS256 exists specifically for Windows 10 Hello compatibility
- The challenge is the cryptographic heartbeat of the protocol: removing randomness from it collapses security entirely

### Practical Exercises
- Implement ECDSA P-256 key generation, signing, and verification from scratch in Python using the cryptography library without any WebAuthn library
- Write a CBOR decoder for the minimal subset needed to parse an attestationObject (fmt, attStmt, authData)
- Decode a real WebAuthn attestationObject captured from the browser's DevTools network tab using a CBOR tool like cbor.me
- Parse the binary authenticatorData byte-by-byte: extract rpIdHash, flags, signCount, AAGUID, credentialId, and COSE public key
- Use the FIDO Alliance's WebAuthn Response Decoder at passkeys.dev/tools to inspect a real credential and trace every field to its spec definition

---

## Module 3: FIDO2 Architecture — WebAuthn, CTAP2, and the Three-Party Model
**Difficulty: Beginner**

### Topics
- FIDO2 as the umbrella standard: exactly two components — WebAuthn (W3C) and CTAP2 (FIDO Alliance)
- The three participants in every FIDO2 flow: Relying Party, Client/Browser, Authenticator
- The browser as mediator: why the RP and Authenticator never communicate directly
- WebAuthn scope: browser-to-server communication and the JS API surface
- CTAP2 scope: browser/OS-to-authenticator communication over USB, NFC, and Bluetooth
- CTAP2 commands: authenticatorMakeCredential, authenticatorGetAssertion, authenticatorGetInfo, authenticatorClientPIN, authenticatorReset
- CTAP1 backward compatibility: legacy U2F devices working with FIDO2 browsers
- CTAP 2.1 additions: Enterprise Attestation, Credential Management API, Bio Enrollment, alwaysUV, minimum PIN length, largeBlobs extension, credProtect extension, HMAC Secret extension
- CTAP 2.2 additions: Persistent PIN/UV Auth Tokens (PPUATs), enhanced PIN complexity, thirdPartyPayment extension, hmac-secret-mc, hybrid transport formalization, enhanced getInfo metadata
- CTAP 2.3 (February 2026): multiple data transfer channels for hybrid interactions, BLE as new channel
- Platform authenticators: Apple Secure Enclave (Touch ID/Face ID), Windows Hello (TPM), Android Biometric (StrongBox)
- Roaming authenticators: YubiKey, Google Titan Key, Feitian ePass, SoloKey — USB, NFC, BLE
- Key differences: platform authenticators can sync via cloud; roaming authenticators cannot export private keys
- AAGUID: Authenticator Attestation Globally Unique Identifier — 16 bytes identifying the authenticator model
- FIDO Alliance certification program: L1 through L3+ levels, cumulative requirements
- L1: protocol compliance, vendor questionnaire; L2: Restricted Operating Environment, accredited lab review; L3: physical attack defense, penetration testing; L3+: chip-level smart card defenses
- FIDO Metadata Service (MDS3): registry of certified authenticators with attestation certificates and security advisories
- Relationship clarification: FIDO2 is the standard; WebAuthn is the browser API component; Passkeys are the synced credential implementation

### Key Takeaways
- FIDO2 = WebAuthn + CTAP2; WebAuthn alone does not encompass the full FIDO2 standard
- The three-party model is fundamental: understanding it prevents common architectural mistakes like assuming the browser is trusted
- Roaming authenticators provide AAL3 hardware guarantees that synced passkeys cannot match — each has appropriate use cases
- CTAP 2.1 and 2.2 add enterprise-critical features that are invisible to most consumer developers but essential for regulated deployments
- The FIDO Alliance certification program is the supply chain verification mechanism for hardware authenticators

### Practical Exercises
- Draw the complete three-party message flow diagram for both registration and authentication, labeling every message with its protocol (HTTP, CTAP2, internal OS API)
- Use Wireshark with a USB HID sniffer to capture raw CTAP2 traffic between a browser and a YubiKey during a WebAuthn registration
- Look up a real AAGUID (e.g., YubiKey 5 NFC) in the FIDO MDS3 API and read its metadata including supported algorithms, attestation CA, and security characteristics
- Compare the FIDO certification levels for three different authenticators (one L1, one L2, one L3) and explain what additional security each level provides
- Read the CTAP2.1 specification section on authenticatorMakeCredential and map every parameter to its corresponding WebAuthn PublicKeyCredentialCreationOptions field

---

## Module 4: WebAuthn Registration Ceremony — Deep Dive
**Difficulty: Intermediate**

### Topics
- WebAuthn Level 3 specification status: W3C Candidate Recommendation, May 26, 2026
- The Credential Management API: navigator.credentials as the entry point
- navigator.credentials.create({publicKey: PublicKeyCredentialCreationOptions}) — full signature
- PublicKeyCredentialCreationOptions required fields: challenge, rp.name, user.id, user.name, user.displayName, pubKeyCredParams
- PublicKeyCredentialCreationOptions optional fields: rp.id, attestation, attestationFormats, authenticatorSelection, excludeCredentials, extensions, hints, timeout
- challenge requirements: minimum 16 bytes entropy (32 recommended), server-generated, cryptographically random, never client-generated
- rp.id: domain string, must be effective domain or registrable suffix of page origin — not URL, no scheme or port
- user.id: opaque ArrayBuffer, max 64 bytes, NOT PII — used as a handle, not displayed to user
- pubKeyCredParams array: ordered by preference, authenticator picks first supported algorithm
- authenticatorSelection: authenticatorAttachment, residentKey, userVerification
- The deprecated requireResidentKey boolean — use residentKey instead
- attestation conveyance: 'none' (default, recommended for consumers), 'indirect', 'direct', 'enterprise'
- hints array: 'security-key', 'client-device', 'hybrid' — UI guidance, non-binding
- excludeCredentials: preventing duplicate registration
- The registration ceremony step-by-step: user action → server challenge → browser create() → user gesture → authenticator key generation → attestation → server storage
- AuthenticatorAttestationResponse: clientDataJSON, attestationObject, getTransports(), getAuthenticatorData(), getPublicKey(), getPublicKeyAlgorithm()
- attestationObject CBOR structure: {fmt, attStmt, authData}
- Attestation formats: 'none', 'packed', 'tpm', 'android-key', 'android-safetynet', 'fido-u2f', 'apple'
- Attestation types: Basic, Self/Surrogate, AttCA, AnonCA, None
- clientDataJSON structure: type, challenge, origin, crossOrigin, topOrigin
- Server-side registration validation: 8-step checklist
- Database storage schema: credential_id VARCHAR(1023), public_key BYTEA, counter BIGINT, aaguid, device_type, backup_eligible, backup_state, transports
- Modern JSON serialization: parseCreationOptionsFromJSON(), credential.toJSON()

### Key Takeaways
- The registration ceremony is a one-way proof: the authenticator proves it can generate a key pair, but the RP stores only the public key — no secret is ever shared
- Origin must be checked with exact string equality, never substring matching
- Storing the credential_id as VARCHAR(1023) is a non-obvious but critical requirement
- The AT flag in authenticatorData must be set during registration — its absence means no credential data was returned
- parseCreationOptionsFromJSON() and toJSON() eliminate an entire class of base64url encoding bugs

### Practical Exercises
- Implement a complete registration endpoint from scratch without using a library — manually decode CBOR, parse authenticatorData binary, verify the challenge, and extract the COSE public key
- Build a registration flow that correctly handles all three attestation formats (none, packed self, packed full)
- Create a database migration that stores all required credential fields with correct column types
- Write a test that attempts to register the same credential twice and verifies excludeCredentials rejects the duplicate
- Inspect a real attestationObject using CBOR decode tools and trace every field to its spec definition

---

## Module 5: WebAuthn Authentication Ceremony — Deep Dive
**Difficulty: Intermediate**

### Topics
- navigator.credentials.get({publicKey: PublicKeyCredentialRequestOptions}) — full signature
- PublicKeyCredentialRequestOptions required and optional fields
- allowCredentials array: omit for passkey/discoverable flows
- transports values: 'ble', 'hybrid', 'internal', 'nfc', 'usb', 'smart-card'
- Discoverable credential flows vs non-discoverable flows
- AuthenticatorAssertionResponse: clientDataJSON, authenticatorData, signature, userHandle
- The signature computation: signedData = concat(authenticatorData, SHA-256(clientDataJSON))
- ECDSA signature format: ASN.1 DER encoding for ES256
- The authentication ceremony step-by-step
- Server-side authentication validation: 8-step checklist
- signCount update logic and synced passkey exception (signCount=0)
- Credential-to-user binding: CRITICAL (CVE-2025-26788 pattern)
- Algorithm confusion prevention
- Cross-ceremony attack prevention via type field validation
- Step-up authentication pattern

### Key Takeaways
- The authentication ceremony is entirely stateless on the authenticator — it only signs data; all state lives on the server
- Consuming the challenge immediately and unconditionally is essential
- The credential-to-user binding check is omitted by approximately half of custom implementations (CVE-2025-26788)
- Synced passkeys (signCount=0) require special handling
- The type field check prevents cross-ceremony attacks

### Practical Exercises
- Implement authentication verification without a library: manually verify the ECDSA signature
- Write a test suite covering all 8 validation steps with explicit failure mode test cases
- Implement a step-up authentication guard middleware
- Build a discoverable credential flow and trace how userHandle identifies the user
- Deliberately introduce CVE-2025-26788, exploit it, then fix it

---

## Module 6: Passkeys — Multi-Device Credentials and the Sync Ecosystem
**Difficulty: Intermediate**

### Topics
- Official FIDO Alliance definition: passkey as a FIDO credential that allows sign-in using the same process as device unlock
- Technical definition: WebAuthn credential with BE=1 and BS=1 flags
- Device-bound vs synced passkeys
- iCloud Keychain, Google Password Manager, 1Password sync architectures
- The attack vector: account takeover of the sync account
- Hybrid QR flow (caBLE/cross-device authentication)
- Credential Exchange Protocol (CXP) and Credential Exchange Format (CXF)
- Platform readiness (2026): iOS 100%, Android 100%, Windows 73%, macOS 92%
- Common misconceptions about passkeys
- Adoption statistics: 5 billion passkeys active globally

### Key Takeaways
- Passkeys are a specific credential type within WebAuthn, distinguished by BE and BS flags
- The sync fabric is the true innovation; the underlying cryptography is unchanged
- The attack surface is the sync account, not the cryptography
- Hybrid QR transport never copies the private key
- CXF/CXP eliminates vendor lock-in objections

### Practical Exercises
- Register a passkey on iPhone, sign in on Windows via hybrid QR flow
- Inspect BE and BS flags in real authenticatorData
- Implement different security policies based on device_type and backup_state
- Configure 1Password as CTAP2 provider on Android
- Write non-technical documentation explaining hybrid QR flow

---

## Module 7: Client-Side Implementation
**Difficulty: Intermediate**

### Topics
- Secure context requirement (HTTPS)
- Feature detection: four levels
- getClientCapabilities() (Chrome 133+, Safari 17.4+)
- base64url encoding/decoding utilities
- Level 3 JSON serialization: parseCreationOptionsFromJSON(), parseRequestOptionsFromJSON(), toJSON()
- Conditional UI implementation details
- AbortController pattern for SPAs
- Error types: NotAllowedError, AbortError, InvalidStateError, ConstraintError, SecurityError, DataError, NotSupportedError, UnknownError
- iOS/Safari user gesture requirement
- @simplewebauthn/browser and @github/webauthn-json libraries
- Permissions Policy for cross-origin iframes
- Cross-origin iframe requirements

### Key Takeaways
- The conditional get() call must be initiated on page load, not on a button click
- Never rely on localStorage/cookies to track passkey existence
- The AbortController is not optional for SPAs
- parseCreationOptionsFromJSON() and toJSON() eliminate encoding bugs
- Safari user gesture requirement breaks third-party HTTP libraries

### Practical Exercises
- Build a complete client-side passkey flow using only the native WebAuthn API
- Implement Conditional UI with full AbortController lifecycle management
- Write comprehensive error handler for every WebAuthn error type
- Compare @simplewebauthn/browser vs native API
- Test Safari user gesture requirement

---

## Module 8: Server-Side Implementation Across Seven Ecosystems
**Difficulty: Intermediate**

### Topics
- Library survey: SimpleWebAuthn (TypeScript), py_webauthn (Python), webauthn-rs (Rust), java-webauthn-server (Java), fido2-net-lib (.NET), go-webauthn (Go), webauthn-ruby (Ruby)
- Each library's API surface, storage model, and unique features
- Universal storage requirements
- Challenge persistence: server-side with TTL, never in stateless JWT
- PostgreSQL schema design
- FIDO MDS integration

### Key Takeaways
- All libraries share identical security invariants; the language changes but the requirements do not
- Counter update after every authentication is the most commonly skipped operation
- Storing challenges in JWTs is the most common architectural mistake
- The CredentialRepository pattern from java-webauthn-server is worth studying
- webauthn-rs disables state serialization by default for security

### Practical Exercises
- Implement the same flow in two different languages and compare
- Build a Redis-backed challenge store with TTL and atomic consume-and-delete
- Write integration tests for all validation steps
- Implement the CredentialRepository pattern
- Create a replay prevention test fixture

---

## Module 9: Security Analysis and Threat Modeling
**Difficulty: Advanced**

### Topics
- Phishing resistance: rpIdHash + origin binding (two layers)
- AiTM proxy attack failure
- Replay attack prevention: challenge + signCount
- DEF CON 33: UI-level prompt spoofing against synced passkeys
- Browser extension attacks: WebAuthn API hijacking
- CVE-2024-9956 (Chrome Android FIDO URI) and CVE-2025-26788 (StrongKey account takeover)
- Five most common server-side logic flaws
- Attestation security vs privacy trade-off
- Privacy by design: unique keys per site, no cross-site correlation
- Account recovery as the primary attack surface
- Post-quantum threat: ML-DSA as planned replacement
- Algorithm agility design

### Key Takeaways
- WebAuthn is phishing-resistant by cryptographic construction, but UI-level attacks exist
- CVE-2025-26788 proves credential-to-user binding is critical
- Browser extension attacks are outside the WebAuthn threat model
- Account recovery design deserves equal security rigor
- Post-quantum migration requires planning now

### Practical Exercises
- Build a STRIDE threat model for a passkey-protected application
- Reproduce CVE-2025-26788 in a test environment
- Implement a complete server-side validation checklist as a tested function
- Compare passkey, TOTP, and SMS against the AiTM attack model
- Design Permissions Policy configuration for extension attack mitigation

---

## Module 10: UX Design Patterns for Passkey Adoption
**Difficulty: Intermediate**

### Topics
- Triggered enrollment pattern: 102% higher adoption (eBay data)
- Three-phase progressive enrollment
- Conditional UI as highest-converting sign-in pattern
- Convenience framing outperforms security framing
- Four primary user confusion points
- Passkey management UI requirements
- FIDO Alliance UX guidelines: 10 UX principles, 14 design patterns
- Silent/conditional conversion (Roblox, TikTok)
- Accessibility: WCAG 3.3.8, screen reader support
- Real production results: Google 352% growth, TikTok 90%+ success rate, Uber 5x faster, DocuSign 99% success

### Key Takeaways
- UX directly determines adoption (eBay's 102% increase from prompt timing)
- OS dialog is platform-owned; bridge with microcopy before and after
- Launching enrollment without management UI is an anti-pattern
- Silent conversion is highest-leverage for adoption
- The 'not now' path must be frictionless

### Practical Exercises
- Build a triggered enrollment prompt and usability test
- Implement passkey management page with AAGUID lookup
- A/B test security vs convenience framing
- Measure Conditional UI vs password sign-in rates
- Conduct accessibility audit with NVDA and JAWS

---

## Module 11: Advanced WebAuthn Features and Extensions
**Difficulty: Advanced**

### Topics
- PRF extension: HMAC with hardware-bound secret → 32-byte deterministic output
- PRF key derivation pipeline: PRF output → HKDF → AES-GCM-256
- Envelope encryption with PRF (Bitwarden model)
- credProtect extension: three levels
- Chrome credProtect implicit escalation behavior
- largeBlob extension: read/write arbitrary binary data on authenticator
- Signal API: signalUnknownCredential(), signalAllAcceptedCredentials(), signalCurrentUserDetails()
- Related Origin Requests (ROR): single passkey across multiple domains
- getClientCapabilities() capabilities map
- JSON serialization APIs
- Secure Payment Confirmation (SPC)

### Key Takeaways
- PRF enables hardware-backed E2E encryption in web applications
- Signal API solves stale passkey entry problem
- Related Origin Requests eliminate per-domain passkey registration
- credProtect's Chrome implicit escalation breaks apps expecting Level 2
- PRF envelope encryption pattern is production-proven by Bitwarden

### Practical Exercises
- Implement PRF-based E2E encrypted note-taking app
- Deploy Signal API after every successful authentication
- Configure Related Origin Requests for multi-domain site
- Test credProtect across Chrome and Firefox
- Implement largeBlob storage on a YubiKey

---

## Module 12: Browser and Platform Support — Compatibility Matrix
**Difficulty: Intermediate**

### Topics
- WebAuthn global coverage: 94.05%; passkeys: 91.04%
- Chrome, Safari, Firefox, Edge version support
- iOS, Android, Windows, macOS platform support
- Windows 10 limitations: no Conditional UI, no PRF
- Linux: no native platform authenticator
- Android NFC limitation for CTAP2
- Safari user gesture quirks
- Firefox Android historical issues
- PRF support matrix
- Cross-origin iframe support
- Hardware security key storage limits

### Key Takeaways
- Windows 10 is the most significant platform gap
- Android's NFC limitation is non-obvious
- Safari's user gesture requirement is the most common cross-browser issue
- Firefox on Android has been the most problematic
- Linux requires hybrid QR or hardware key only

### Practical Exercises
- Build browser capability detection module
- Test passkey flow on all major platform/browser combinations
- Implement graceful degradation across support levels
- Debug Safari user gesture failure
- Build production support matrix table

---

## Module 13: Enterprise Passkey Deployment
**Difficulty: Advanced**

### Topics
- 87% of enterprises deploying or piloting FIDO2 passkeys (2026)
- IDP-mediated architecture: Okta, Microsoft Entra ID, Auth0
- Hybrid deployment model: synced + device-bound by role
- Enterprise Attestation: Vendor Facilitated and Platform Managed
- Apple MDM passkey attestation
- Zero Trust integration
- Crawl-Walk-Run migration framework
- The bootstrapping paradox and Temporary Access Pass (TAP)
- Conditional Access policy configuration
- Cross-Tenant Access Trust for B2B
- Recovery architecture: five-tier model
- Compliance: NIST SP 800-63-4, GDPR, NIS2, DORA, PCI DSS 4.0, HIPAA

### Key Takeaways
- IDP-mediated architecture is the correct enterprise pattern
- The bootstrapping paradox must be solved before enforcement
- Attestation must be applied selectively via Passkey Profiles
- Recovery design requires equal security rigor
- One FIDO2 deployment satisfies multiple regulatory frameworks

### Practical Exercises
- Design a complete Crawl-Walk-Run migration plan for 1,000 users
- Configure Entra ID conditional access without circular lockout
- Implement automated TAP issuance via Graph API
- Build AAGUID allowlist enforcement with MDS3
- Create enterprise attestation policy document

---

## Module 14: Future Trends, Emerging Standards, and the Passkeys Ecosystem
**Difficulty: Expert**

### Topics
- WebAuthn Level 3 status and key additions
- CTAP 2.2 and 2.3 new features
- Credential Exchange Protocol (CXP/CXF)
- Secure Payment Confirmation (SPC)
- Digital Credentials API (W3C) and Verifiable Credentials
- EU eIDAS 2.0 deadline: December 31, 2026
- FIDO Alliance Agentic Authentication TWG (April 2026)
- Post-quantum cryptography: ML-DSA
- Algorithm agility design principle
- Passwordless market: $24.1B (2025) → $55.7B (2030)

### Key Takeaways
- Passkeys and digital credentials converge on navigator.credentials — authentication and identity unify
- Agentic authentication for AI agents is the next major unsolved problem
- Post-quantum migration requires algorithm-agile architectures now
- EU eIDAS 2.0 will make CTAP 2.2 hybrid flow familiar to hundreds of millions
- WebAuthn/passkeys expertise is career-defining, not niche ($55.7B market by 2030)

### Practical Exercises
- Implement Secure Payment Confirmation flow
- Set up Digital Credentials API demonstration
- Design algorithm-agile passkey storage schema
- Design delegation token flow for AI agent authentication
- Build passkey portability demo using CXF specification

---

## Learning Path

Start with Module 1 (History) and Module 2 (Cryptographic Foundations) in parallel — neither depends on the other, and both provide essential context. Complete Module 3 (FIDO2 Architecture) before proceeding, as it establishes the three-party mental model that all subsequent modules assume. Modules 4 and 5 (Registration and Authentication Ceremonies) must be completed in order and form the technical core of the curriculum — do not skip ahead. Module 6 (Passkeys) can be read after Module 4 or alongside Module 5. Modules 7 and 8 (Client-Side and Server-Side Implementation) are best studied together in a practical project that implements a working passkey system end-to-end; begin Module 7 first for the browser API, then Module 8 for the server. Module 9 (Security Analysis) requires Modules 4, 5, 7, and 8 as prerequisites — security analysis without implementation knowledge is purely theoretical. Module 10 (UX Design) can be studied in parallel with Modules 7 and 8 once the basic flow is understood. Module 11 (Advanced Extensions) builds on Module 7 (client-side) and Module 8 (server-side) — PRF requires understanding of the authentication flow before the extension makes sense. Module 12 (Browser Support) is a reference module that should be consulted while building Modules 7 and 8, but read in full after Module 10. Module 13 (Enterprise Deployment) requires Modules 6, 8, 9, and 10 as prerequisites — enterprise context only makes sense after implementation and security are understood. Module 14 (Future Trends) is the capstone and can be read at any point after Module 6, but yields the most insight after completing all previous modules.

**Recommended total time: 120-160 hours** for a developer with intermediate web development experience and no prior WebAuthn knowledge, or **60-80 hours** for someone with cryptography background and prior authentication systems experience.
