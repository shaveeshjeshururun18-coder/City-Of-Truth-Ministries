import os
file_path = "App.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    text = f.read()

target = '          {currentView === ViewState.ADMIN_DASHBOARD && currentUser && ('
if target in text and '<UserDashboard' not in text:
    replacement = """          {currentView === ViewState.USER_DASHBOARD && currentUser && (
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
                    console.error('Failed to update user', err);
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
    text = text.replace(target, replacement)
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(text)
    print("UserDashboard successfully inserted into App.tsx!")
else:
    print("UserDashboard already inserted or target not found.")
