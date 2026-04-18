import subprocess
import os

os.chdir(r"d:\City-Of-Truth-Ministries\City-Of-Truth-Ministries-main\City-Of-Truth-Ministries-main")

res = subprocess.run(["git", "rev-parse", "--show-toplevel"], capture_output=True, text=True)
git_root = res.stdout.strip()
print("Git root is", git_root)

if git_root:
    os.chdir(git_root)
    subprocess.run(["git", "add", "-A"])
    subprocess.run(["git", "commit", "-m", "Fix white screen crash and restore proper routing for AuthPage"])

    # Disable credential helpers
    subprocess.run(["git", "config", "credential.helper", ""])
    
    url = "https://shaveeshjeshururun18-coder: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@github.com/shaveeshjeshururun18-coder/City-Of-Truth-Ministries.git"
    print("Pushing...")
    push = subprocess.run(["git", "push", "-u", url, "main"], capture_output=True, text=True)
    if push.returncode == 0:
        print("Successfully pushed to GitHub!")
        print(push.stdout)
    else:
        print("Push failed:", push.stderr)
