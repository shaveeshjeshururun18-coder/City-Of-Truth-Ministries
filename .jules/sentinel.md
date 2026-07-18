## 2024-05-18 - [CRITICAL] Hardcoded Admin & Reboot Passwords
**Vulnerability:** Found hardcoded fallback passwords (`steveharrington`) used for critical actions like `completeReboot` in `services/api.ts` and `handleUnlockAdminPasswordChange` in `components/AdminDashboard.tsx`.
**Learning:** Developers sometimes use `import.meta.env.VAR || 'fallback'` during local testing, which unintentionally leaks critical credentials if left in production code. Since this is a client-side bundle, anyone could inspect the code and extract the fallback password.
**Prevention:** Never use hardcoded string fallbacks for `import.meta.env` variables that represent sensitive actions. Always check if the environment variable is falsy and return an error or throw to "fail securely".

## 2026-07-18 - [CRITICAL] Fixed Hardcoded Reboot Fallback Password
**Vulnerability:** Found a hardcoded fallback string literal ('steveharrington') for the `completeReboot` function in `services/api.ts` used when `VITE_REBOOT_PASSWORD` was not set.
**Learning:** This is a recurring pattern from a previous issue (2024-05-18). Client-side bundles expose these fallbacks, allowing unauthorized access to destructive operations like a system wipe if environment variables are missing.
**Prevention:** Strictly enforce that environment variables do not use logical OR (`||`) with sensitive strings. Applications must fail securely when missing configuration, e.g., explicitly checking `if (!envVar) { return { error: ... } }`.
