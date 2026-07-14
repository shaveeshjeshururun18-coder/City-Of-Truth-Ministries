1. **Fix hardcoded reboot password in `services/api.ts`:**
   - Modify `completeReboot` function to remove the fallback hardcoded password.
   - Use `import.meta.env.VITE_REBOOT_PASSWORD` without a fallback string.
   - Example: `const REBOOT_PASSWORD = import.meta.env.VITE_REBOOT_PASSWORD;`
   - Handle the case where the environment variable is not set (fail securely).

2. **Fix hardcoded admin password change phrase in `components/AdminDashboard.tsx`:**
   - Remove the `const ADMIN_PASSWORD_CHANGE_PHRASE = 'steveharrington';` constant.
   - Replace it with an environment variable: `const ADMIN_PASSWORD_CHANGE_PHRASE = import.meta.env.VITE_ADMIN_PASSWORD_CHANGE_PHRASE;`
   - Handle the case where the environment variable is not set (fail securely in `handleUnlockAdminPasswordChange`).

3. **Ensure no other hardcoded secrets exist:**
   - Check if there are other occurrences of `steveharrington` or similar fallback passwords.
   - Verified that `ADMIN_PASSWORD` in `components/AdminPasswordModal.tsx` does not have a hardcoded fallback.

4. **Complete pre-commit checks:**
   - Run necessary linting, type-checking, and tests.
   - Follow instructions from `pre_commit_instructions`.

5. **Submit changes:**
   - Commit and push to a new branch with a description of the security fixes.
