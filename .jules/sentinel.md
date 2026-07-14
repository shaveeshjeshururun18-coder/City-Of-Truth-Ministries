## 2024-05-24 - [Remove Hardcoded Admin Secrets]
**Vulnerability:** Hardcoded fallback values (`steveharrington`) used for critical operations like changing the admin password and completely rebooting the system.
**Learning:** Even fallback strings for passwords or critical secrets expose the application to unauthenticated actions if the environment variables fail to load or are forgotten. Fallbacks for secrets should never be used.
**Prevention:** Always load secrets strictly from environment variables without a default fallback, and fail securely if the environment variable is not set.
