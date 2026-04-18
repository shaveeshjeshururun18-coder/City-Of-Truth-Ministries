import os
file_path = "App.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

found = False
for i, line in enumerate(lines):
    if "currentView === ViewState.ADMIN_DASHBOARD && currentUser && (" in line:
        found = True
        # Insert UserDashboard before this line!
        block = """          {currentView === ViewState.USER_DASHBOARD && currentUser && (
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

"""
        lines.insert(i, block)
        break

if found:
    with open(file_path, "w", encoding="utf-8") as f:
        f.write("".join(lines))
    print("Successfully inserted UserDashboard!")
else:
    print("Could not find ADMIN_DASHBOARD check!")
