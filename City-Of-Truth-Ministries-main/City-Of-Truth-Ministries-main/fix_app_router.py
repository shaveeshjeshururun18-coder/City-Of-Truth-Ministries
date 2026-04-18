import os
file_path = "App.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    text = f.read()

# 1. Remove the entire if (isAuthOpen) block
authopen_start = """  if (isAuthOpen) {"""
authopen_end = """    );
  }"""

if authopen_start in text and authopen_end in text:
    s = text.find(authopen_start)
    e = text.find(authopen_end, s) + len(authopen_end)
    text = text[:s] + text[e:]
    print("Removed if (isAuthOpen) block.")
else:
    print("Could not cleanly remove isAuthOpen block.")

# 2. Update Navbar onLoginClick
old_navbar = """onLoginClick={() => setIsAuthOpen(true)}"""
new_navbar = """onLoginClick={() => { setAuthInitialView('login'); setCurrentView(ViewState.AUTH); }}"""
if old_navbar in text:
    text = text.replace(old_navbar, new_navbar)
    print("Updated Navbar onLoginClick.")
else:
    print("Could not update Navbar onLoginClick.")

# 3. Add AuthPage to AnimatePresence
target_router = """        <AnimatePresence mode="wait">"""
auth_route = """        <AnimatePresence mode="wait">
          {currentView === ViewState.AUTH && (
            <motion.div key="auth" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <AuthPage
                onLogin={handleLogin}
                onNavigateToRegister={() => setCurrentView(ViewState.ID_CARD)}
                onAdminClick={() => navigate('/admin')}
                onBack={() => setCurrentView(ViewState.HOME)}
                initialView={authInitialView as any || 'choice'}
                users={users}
              />
            </motion.div>
          )}"""

if target_router in text and "currentView === ViewState.AUTH" not in text:
    text = text.replace(target_router, auth_route)
    print("Added AuthPage to AnimatePresence routes.")
else:
    print("AuthPage already in routes or target not found.")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(text)

print("Done.")
