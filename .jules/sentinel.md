## 2026-07-04 - [Remove Hardcoded Password 'steveharrington']
**Vulnerability:** A hardcoded password string ('steveharrington') is used as the default value for `REBOOT_PASSWORD` in `services/api.ts` and as `ADMIN_PASSWORD_CHANGE_PHRASE` in `components/AdminDashboard.tsx`. This allows unauthorized rebooting of the system or unlocking the admin password change functionality without environment variable configuration.
**Learning:** Hardcoded default passwords should never be used, especially for sensitive operations like system reboot or admin password changes.
**Prevention:** Rely entirely on environment variables for sensitive secrets without falling back to a hardcoded string. Require proper configuration before these operations can proceed, and fail securely if secrets are not set.
