# Google Sheets Sync for AIR Lab Website

This extension connects a Google Spreadsheet directly to the AIR Lab backend (`/api/sync/sheets`).

---

## 🚀 Quick Setup (Under 3 Minutes)

### Step 1: Create the Google Spreadsheet
1. Go to [Google Sheets](https://sheets.new) and create a new blank spreadsheet.
2. Name it: **`AIR Lab Website CMS`**

---

### Step 2: Import the 2 Pre-filled CSV Templates
We have already exported your entire current website database into two formatted CSV files inside the repo at `sheets-templates/`:

1. **Sheet Tab 1 (`People`)**:
   - In Google Sheets, click **File &rarr; Import &rarr; Upload**.
   - Upload [`sheets-templates/People_Template.csv`](../sheets-templates/People_Template.csv).
   - Choose: **"Replace current sheet"**.
   - Rename this bottom tab to: **`People`**

2. **Sheet Tab 2 (`Research & Works`)**:
   - Click the **`+`** (Add Sheet) button at the bottom to add a second tab.
   - Click **File &rarr; Import &rarr; Upload**.
   - Upload [`sheets-templates/Research_and_Works_Template.csv`](../sheets-templates/Research_and_Works_Template.csv).
   - Choose: **"Insert new sheet(s)"** or replace the new tab.
   - Rename this bottom tab to: **`Research & Works`**

---

### Step 3: Install the Apps Script Extension
1. In your Google Spreadsheet, click **Extensions &rarr; Apps Script** in the top navigation bar.
2. Delete any existing code inside `Code.gs`.
3. Copy all the code from [`sheets-extension/Code.gs`](./Code.gs) and paste it into the editor.
4. (Optional) In line 21 of `Code.gs`, update `BACKEND_URL` if you want it to point to your custom domain, or keep the default Vercel domain.
5. Click the **Save** (💾) icon at the top, or press `Ctrl + S`.
6. Close the Apps Script tab and **refresh your Google Sheet**.

---

### Step 4: Syncing Data!
Once you refresh the Google Sheet, a new menu will appear at the top toolbar:
### **`⚡ AIR Lab`**

- **`🚀 Sync All to Website`**: Reads both tabs, auto-assigns any missing IDs, and updates the website database immediately.
- **`👥 Sync People Only`**: Syncs only the `People` tab.
- **`📚 Sync Research & Works Only`**: Syncs only the `Research & Works` tab.
- **`🆔 Auto-Generate Missing IDs`**: Automatically creates IDs (e.g., `P-142`, `PUB-102`) for any newly added rows.
- **`⚙️ Configure URL & Secret`**: Easily update your live website URL or API secret from a popup window anytime without editing code.

*(Note: The very first time you click Sync, Google will ask for permission to run the script. Click **Continue** &rarr; select your account &rarr; click **Advanced** &rarr; **Go to Untitled script (unsafe)** &rarr; **Allow**).*

---

## 📋 Column Guidelines for Operators

### Tab 1: `People`
- **`id`**: Unique ID (e.g. `P-101`, `murk-marvi`). Leave blank if adding a new person; the sync button will automatically assign one!
- **`name`**: Full Name (Required).
- **`category`**: Allowed values:
  - `Faculty`
  - `Research Interns`
  - `Alumni`
  - `Previous Interns`
  - `Postgraduate`
  - `Undergraduate`
- **`tags`**: Comma-separated (e.g. `Computer Vision, PyTorch, Edge AI`).
- **`isLead`**: `TRUE` for Lab Director/Lead, otherwise `FALSE`.
- **`published`**: Set to `FALSE` if you want to temporarily hide someone from the public website without deleting their row.

### Tab 2: `Research & Works`
- **`id`**: Unique ID (e.g. `PUB-1`, `PRJ-1`, `GRT-1`). Auto-generated if left blank!
- **`entityType`**: Determines which section of the website it goes to:
  - `Publication` (Academic papers, conferences, journal articles)
  - `Project` (Lab projects, funded prototypes, student projects)
  - `Grant` (Research grants, funding awards)
- **`status`**: `Published`, `Ongoing`, `Finished`, `Active`.
- **`tags`**: Comma-separated topics.
- **`published`**: `TRUE` / `FALSE`.

