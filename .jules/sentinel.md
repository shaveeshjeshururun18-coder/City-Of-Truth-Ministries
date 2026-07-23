## 2024-05-18 - [CRITICAL] Hardcoded Admin & Reboot Passwords
**Vulnerability:** Found hardcoded fallback passwords (`steveharrington`) used for critical actions like `completeReboot` in `services/api.ts` and `handleUnlockAdminPasswordChange` in `components/AdminDashboard.tsx`.
**Learning:** Developers sometimes use `import.meta.env.VAR || 'fallback'` during local testing, which unintentionally leaks critical credentials if left in production code. Since this is a client-side bundle, anyone could inspect the code and extract the fallback password.
**Prevention:** Never use hardcoded string fallbacks for `import.meta.env` variables that represent sensitive actions. Always check if the environment variable is falsy and return an error or throw to "fail securely".

## 2026-07-23 - [CRITICAL] Insecure fallback for VITE_REBOOT_PASSWORD
**Vulnerability:** A hardcoded fallback password ('steveharrington') was used for complete system reboot operations in services/api.ts.
**Learning:** The pattern of using logical OR (||) with a string literal for environment variables that control sensitive features or credentials breaks the 'fail securely' principle and exposes the literal string to anyone inspecting the client-side bundle.
**Prevention:** Implement explicit existence checks for sensitive environment variables. If they are absent, explicitly log an error and block the operation rather than defaulting to an insecure state.
