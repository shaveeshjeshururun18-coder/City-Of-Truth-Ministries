import os

file_path = "App.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    text = f.read()

# 1. Add if (isAuthOpen) block
insert_target = """  // If on verify route (QR code scan)
  if (isVerifyRoute && verifyUserId) {
    return <QRVerifyPage userId={verifyUserId} onBack={() => navigate('/')} />;
  }

  return ("""

insert_replacement = """  // If on verify route (QR code scan)
  if (isVerifyRoute && verifyUserId) {
    return <QRVerifyPage userId={verifyUserId} onBack={() => navigate('/')} />;
  }

  if (isAuthOpen) {
    return (
      <AuthPage
        onLogin={handleLogin}
        onNavigateToRegister={() => {
          setIsAuthOpen(false);
          setCurrentView(ViewState.ID_CARD);
        }}
        onAdminClick={() => {
          setIsAuthOpen(false);
          navigate('/admin');
        }}
        onBack={() => setIsAuthOpen(false)}
        initialView={(authInitialView as any) || 'choice'}
        users={users}
      />
    );
  }

  return ("""

if insert_target in text:
    text = text.replace(insert_target, insert_replacement)
    print("Inserted AuthPage conditionally.")
else:
    print("WARNING: Could not find insert target for AuthPage!")

# 2. Remove AuthModal
auth_modal_start = "<AuthModal"
auth_modal_end = "initialView={authInitialView}\n      />"
if auth_modal_start in text and auth_modal_end in text:
    start_idx = text.find(auth_modal_start)
    end_idx = text.find(auth_modal_end) + len(auth_modal_end)
    # also remove whitespace before/after
    text = text[:start_idx].rstrip() + "\n" + text[end_idx:].lstrip("\r\n")
    print("Removed AuthModal from JSX.")
else:
    print("WARNING: Could not find AuthModal to remove!")

# 3. Insert UserDashboard
dashboard_target = """          {currentView === ViewState.ADMIN_DASHBOARD && currentUser && ("""
dashboard_replacement = """          {currentView === ViewState.USER_DASHBOARD && currentUser && (
            <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <UserDashboard
                user={currentUser}
                onEdit={() => { }}
                onLogout={handleLogout}
                onUpdate={async (updatedUser) => {
                  try {
                    await api.updateUser(updatedUser);
                    const freshData = await api.getUsers();
                    const me = freshData.find(u => u.id === currentUser.id);
                    if (me) setCurrentUser(me);
                  } catch (err) {
                    console.error(err);
                  }
                }}
                setShowLeaderMessage={setShowLeaderMessage}
                setCurrentView={setCurrentView}
                activeProfileId={activeProfileId || currentUser.id}
                onProfileSwitch={setActiveProfileId}
              />
            </motion.div>
          )}

          {currentView === ViewState.ADMIN_DASHBOARD && currentUser && ("""

if dashboard_target in text and "ViewState.USER_DASHBOARD" not in text:
    text = text.replace(dashboard_target, dashboard_replacement)
    print("Inserted UserDashboard.")
elif "ViewState.USER_DASHBOARD" in text:
    print("UserDashboard already exists, skipping.")
else:
    print("WARNING: Could not find insert target for UserDashboard!")


with open(file_path, "w", encoding="utf-8") as f:
    f.write(text)

print("Done.")
