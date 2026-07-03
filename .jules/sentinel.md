## 2024-05-24 - [Fix Hardcoded Secret]
**Vulnerability:** A hardcoded secret (`steveharrington`) was discovered in `components/AdminDashboard.tsx`, used as a phrase to change the admin password.
**Learning:** Hardcoded credentials within frontend code represent a critical security risk because they are shipped to the client and can easily be extracted by anyone.
**Prevention:** Always use environment variables prefixed with `VITE_` (in Vite applications) for secrets that must be available to the frontend, or better yet, handle authorization/authentication on a secure backend. Ensure `.env.example` is updated to reflect necessary configurations.
