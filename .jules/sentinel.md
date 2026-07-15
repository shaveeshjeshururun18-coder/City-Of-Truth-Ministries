## 2024-05-18 - [CRITICAL] Hardcoded Admin & Reboot Passwords
**Vulnerability:** Found hardcoded fallback passwords (`steveharrington`) used for critical actions like `completeReboot` in `services/api.ts` and `handleUnlockAdminPasswordChange` in `components/AdminDashboard.tsx`.
**Learning:** Developers sometimes use `import.meta.env.VAR || 'fallback'` during local testing, which unintentionally leaks critical credentials if left in production code. Since this is a client-side bundle, anyone could inspect the code and extract the fallback password.
**Prevention:** Never use hardcoded string fallbacks for `import.meta.env` variables that represent sensitive actions. Always check if the environment variable is falsy and return an error or throw to "fail securely".
## 2026-07-15 - [HIGH] Hardcoded Weak Default Password
**Vulnerability:** Found a hardcoded weak default password ('password') being assigned to new user accounts in `App.tsx` during registration if no password was provided.
**Learning:** Developers may use weak defaults to bypass validation checks during local development, but leaving this in production allows for easy account takeover of accounts registered without a secure password.
**Prevention:** Ensure required credentials are explicitly provided and validated during account creation. Abort the registration process with a secure error message instead of defaulting to a weak credential.
