import os
file_path = "App.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

found = False
for i, line in enumerate(lines):
    if "<AnimatePresence mode=\"wait\">" in line:
        found = True
        block = """          {currentView === ViewState.AUTH && (
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
          )}

"""
        lines.insert(i + 1, block)
        break

if found:
    with open(file_path, "w", encoding="utf-8") as f:
        f.write("".join(lines))
    print("Successfully inserted AuthPage into Router!")
else:
    print("Could not find AnimatePresence!")
