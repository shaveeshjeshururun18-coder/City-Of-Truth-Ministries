# 🔐 API Key Security Guide - COT AI

## ⚠️ CRITICAL: Current Situation

The OpenRouter API key you shared (`sk-or-v1-7953d7c...`) is **NOW EXPOSED** and must be rotated immediately.

---

## ✅ How to Safely Use API Keys

### Step 1: Create a New API Key

1. Go to: https://openrouter.ai/keys
2. Create a new API key
3. **COPY IT IMMEDIATELY** (you won't see it again!)
4. **DO NOT SHARE IT WITH ANYONE** (including in conversations, Discord, Slack, etc.)

### Step 2: Update Your Local Environment

1. Open `d:\New folder\.env.local`
2. Replace the old key with your new key:
   ```
   VITE_OPENROUTER_API_KEY=your-new-key-here
   ```
3. Save the file
4. Restart your dev server

### Step 3: Verify Security

✅ **Already Secure:**
- `.env.local` is in `.gitignore` (line 13: `*.local`)
- The file is NOT tracked by git
- It will NOT be committed to your repository

🚨 **Things to NEVER Do:**
- ❌ Never commit `.env.local` to git
- ❌ Never share API keys in chat/email/messages
- ❌ Never hardcode API keys in your source code
- ❌ Never push `.env` files to public repositories

---

## 🛡️ Best Practices

### For Development (Local)
Use `.env.local` file (current setup) ✅

### For Production (Vercel/Netlify/etc.)
1. Go to your hosting platform's dashboard
2. Find "Environment Variables" or "Secrets" section
3. Add your API key there:
   - Key: `VITE_OPENROUTER_API_KEY`
   - Value: Your OpenRouter API key
4. **NEVER** commit production keys to git

---

## 🔍 How to Check if API Keys Are Exposed

### Check Git History
```bash
git log --all --full-history -- .env.local
```
If this shows anything, your key was previously committed!

### Check Remote Repository
1. Go to your GitHub repository
2. Search for "sk-or-v1" or "OPENROUTER"
3. If found, rotate the key immediately

### Use Git Secrets Scanner
```bash
# Install git-secrets (optional)
git secrets --scan
```

---

## 🚨 If Your Key Gets Exposed

1. **Immediately disable the key** at https://openrouter.ai/keys
2. **Create a new key**
3. **Update all applications** using the old key
4. **Remove the exposed key from git history** (if committed):
   ```bash
   # This is advanced - be careful!
   git filter-branch --force --index-filter \
   "git rm --cached --ignore-unmatch .env.local" \
   --prune-empty --tag-name-filter cat -- --all
   ```

---

## ✅ Your Current Setup Status

| Item | Status |
|------|--------|
| `.env.local` in `.gitignore` | ✅ YES |
| `.env.local` tracked by git | ✅ NO (Safe) |
| API key in source code | ✅ NO (Safe) |
| Current API key security | ❌ EXPOSED (Rotate now!) |

---

## 📝 Next Steps

1. ✅ Your `.env.local` is properly ignored
2. ❌ **Rotate your current API key NOW** (it's exposed in our conversation)
3. ✅ Follow the steps above to create a new key
4. ✅ Never share API keys in conversations again

---

## 🆘 Questions?

- OpenRouter API Keys: https://openrouter.ai/keys
- OpenRouter Docs: https://openrouter.ai/docs
- .gitignore guide: https://git-scm.com/docs/gitignore

**Remember:** API keys are like passwords - treat them with the same level of security! 🔐
