## 2024-05-24 - [CRITICAL] Remove Hardcoded Passwords & Ensure Secure Fallback

**Vulnerability:** Found hardcoded fallback passwords ('steveharrington') for sensitive operations (system reboot and admin password changes) in `services/api.ts` and `components/AdminDashboard.tsx`. These hardcoded fallbacks would allow unauthorized access if environment variables are missing.
**Learning:** Hardcoded fallbacks undermine the purpose of environment variables. If an environment variable for a critical operation is missing, the application must "fail securely" by denying the operation, rather than defaulting to a known string.
**Prevention:** Always verify that critical environment variables are present and truthy before allowing sensitive operations. Remove fallback string literals for passwords and API keys. Use explicit conditional checks (e.g., `if (!PASSWORD_VAR) { return deny; }`) to ensure secure denial. Document required variables in `.env.example`.
