## 2024-05-18 - [CRITICAL] Hardcoded Admin & Reboot Passwords
**Vulnerability:** Found hardcoded fallback passwords (`steveharrington`) used for critical actions like `completeReboot` in `services/api.ts` and `handleUnlockAdminPasswordChange` in `components/AdminDashboard.tsx`.
**Learning:** Developers sometimes use `import.meta.env.VAR || 'fallback'` during local testing, which unintentionally leaks critical credentials if left in production code. Since this is a client-side bundle, anyone could inspect the code and extract the fallback password.
**Prevention:** Never use hardcoded string fallbacks for `import.meta.env` variables that represent sensitive actions. Always check if the environment variable is falsy and return an error or throw to "fail securely".

## 2026-07-21 - [CRITICAL] Hardcoded System Reboot Password Removed
**Vulnerability:** A hardcoded fallback password (`steveharrington`) was exposed in `services/api.ts` for the highly destructive `completeReboot` function.
**Learning:** Hardcoded fallbacks in `import.meta.env.VAR || 'fallback'` leak directly into the Vite client bundle. Furthermore, since Vite injects `VITE_` prefixed variables into the frontend bundle at build time, client-side validation of highly sensitive operations remains architecturally flawed, though removing the universal default password is a necessary first step.
**Prevention:** Never use fallback literals for secrets. Ensure code fails securely when secrets are omitted, and ultimately migrate sensitive validations to a secure backend.
