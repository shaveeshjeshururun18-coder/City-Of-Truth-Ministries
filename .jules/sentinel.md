## 2024-05-31 - Hardcoded Secrets Removed
**Vulnerability:** Found hardcoded string literals used for high privilege actions (`REBOOT_PASSWORD` in `services/api.ts` and `ADMIN_PASSWORD_CHANGE_PHRASE` in `components/AdminDashboard.tsx`).
**Learning:** Hardcoded passphrases bypassing environment variables expose significant risks, specially for irreversible actions like `completeReboot`. Defaulting to static fallback credentials bypasses intended access controls.
**Prevention:** Never provide fallback passwords in the code when relying on `.env` files. Ensure `VITE_` prepended variables exist.
