## 2024-05-18 - [CRITICAL] Hardcoded Admin & Reboot Passwords
**Vulnerability:** Found hardcoded fallback passwords (`steveharrington`) used for critical actions like `completeReboot` in `services/api.ts` and `handleUnlockAdminPasswordChange` in `components/AdminDashboard.tsx`.
**Learning:** Developers sometimes use `import.meta.env.VAR || 'fallback'` during local testing, which unintentionally leaks critical credentials if left in production code. Since this is a client-side bundle, anyone could inspect the code and extract the fallback password.
**Prevention:** Never use hardcoded string fallbacks for `import.meta.env` variables that represent sensitive actions. Always check if the environment variable is falsy and return an error or throw to "fail securely".

## 2024-07-19 - [CRITICAL] Fixed Hardcoded Reboot Password Fallback
**Vulnerability:** Found a hardcoded fallback password (`steveharrington`) used for the critical `completeReboot` action in `services/api.ts` (which deletes all application data).
**Learning:** Hardcoded fallbacks in client-side code completely bypass authentication. Anyone inspecting the code could extract this password.
**Prevention:** Replaced fallback with a strict check for the `VITE_REBOOT_PASSWORD` environment variable, ensuring the application "fails securely" if the variable is missing.
