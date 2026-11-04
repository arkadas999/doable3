# 🛡️ Security & Authentication Specification

Doable prioritizes user privacy and data security through modern encryption and passwordless authentication standards.

---

## 🔒 Security Architecture Highlights

### 1. **WebAuthn & Passkeys Support**
- Native implementation of WebAuthn credentials using `@simplewebauthn/browser` and `@simplewebauthn/server`.
- Users can register biometric authenticators (TouchID, FaceID, Windows Hello, YubiKeys).
- Supports passwordless login and step-up identity re-authentication.

### 2. **AES-256 GCM Payload Encryption**
- Personal user content (Task titles, descriptions, Habit names) is encrypted at rest before storing in SQLite.
- Utilizes AES-256 in Galois/Counter Mode (GCM) for authenticated encryption.
- Encryption key derived from the master secret (`APP_KEY`).

### 3. **Smart Security Auto-Lock**
- The Security management area requires identity confirmation.
- Once unlocked, a 15-second timer monitors user navigation. Leaving the Security tab automatically relocks the view to prevent unauthorized access on shared devices.

### 4. **Session & Cookie Hardening**
- Authentication state maintained via standard HttpOnly cookies with `SameSite=Lax` protection.
- Session tokens are checked on every authenticated request context.

### 5. **Password Security**
- User passwords are cryptographically hashed using Bun's native password hashing engine.
- Client-side real-time entropy evaluation checks password strength during account registration.

---

## 🔐 Key Generation Utility

Doable includes a CLI script to create cryptographically secure 32-byte keys for application payload encryption:

```bash
bun run key:generate
```

This updates or generates `APP_KEY` formatted as: `base64:32_byte_random_string_in_base64`.
