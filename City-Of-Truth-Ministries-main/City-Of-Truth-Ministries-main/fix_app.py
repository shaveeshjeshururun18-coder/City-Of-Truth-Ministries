import sys

with open("HEAD_1_App_cmd.tsx", "r", encoding="utf-8", errors="ignore") as f:
    head_lines = f.readlines()

with open("App.tsx", "r", encoding="utf-8", errors="ignore") as f:
    app_lines = f.readlines()

start_idx_head = -1
for i, line in enumerate(head_lines):
    if "setNavigationItems(newItems);" in line:
        start_idx_head = i + 1
        break

end_idx_head = -1
for i, line in enumerate(head_lines):
    if "{currentView === ViewState.ABOUT_VALPARAI && (" in line:
        # i is line 936, index 935. We want to stop before "</div>" which is line 933, index 932.
        end_idx_head = i - 3
        break

if start_idx_head == -1 or end_idx_head == -1:
    print("Could not find boundaries in HEAD_1_App_cmd.tsx")
    sys.exit(1)

extracted = head_lines[start_idx_head:end_idx_head]

print(f"Extracted {len(extracted)} lines from HEAD_1_App_cmd.tsx")
print(f"First line: {extracted[0].strip()}")
print(f"Last line: {extracted[-1].strip()}")

start_idx_app = -1
for i, line in enumerate(app_lines):
    if "setNavigationItems(newItems);" in line:
        start_idx_app = i + 1
        break

if start_idx_app == -1:
    print("Could not find start boundary in App.tsx")
    sys.exit(1)

new_app_lines = app_lines[:start_idx_app] + extracted + app_lines[start_idx_app:]

with open("App.tsx", "w", encoding="utf-8") as f:
    f.writelines(new_app_lines)

print("Successfully injected missing lines into App.tsx")
