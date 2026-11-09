# AIR Lab — Official NED University Data Seeding Guide

This directory contains the authentic data extracted directly from the official Department of CSIT, NED University of Engineering & Technology records for the Artificial Intelligence Research Lab (AIR Lab).

---

## 📁 Pre-Formatted CSV Files for Google Sheets

You can directly import these 4 CSV files into your Google Spreadsheet (`File` → `Import` → `Upload` → `Insert new sheet(s)`):

1. **[`1_Faculty_and_Interns.csv`](file:///c:/vibes/Air%20Lab/sheets-extension/seed-data/1_Faculty_and_Interns.csv)**
   - **Tab Name in Google Sheets**: `Faculty & Interns`
   - **Records**: 16 members (6 Faculty Leads & Members + 10 Official Research Interns)
   - **Fields**: `Name`, `Role`, `Email`, `Linkedin`, `Specialty`, `Resume`
   - **Highlights**: Real `@cloud.neduet.edu.pk` emails, official NED faculty CV links, and researched focus areas.

2. **[`2_Undergraduate_Projects.csv`](file:///c:/vibes/Air%20Lab/sheets-extension/seed-data/2_Undergraduate_Projects.csv)**
   - **Tab Name in Google Sheets**: `Undergraduate Projects`
   - **Records**: 8 FYDP Capstone Projects
   - **Fields**: `Title`, `Status`, `Team Members`, `Grant Supplier`, `Grant Amount`, `Time Taken`, `Pictures`, `Project Details`
   - **Highlights**: Full team member rosters with NED roll numbers (e.g. `CT-22009`, `DT-23014`), SIEHS ambulance feedback agent, NEDAASC smart travel guide, MemTrace, Naqshkaar 3D, and AutoGradeHub.

3. **[`3_Funded_Projects.csv`](file:///c:/vibes/Air%20Lab/sheets-extension/seed-data/3_Funded_Projects.csv)**
   - **Tab Name in Google Sheets**: `Funded Projects`
   - **Records**: 2 Major Government Grants
   - **Fields**: `Program Title`, `Project Title`, `Status`, `Grant Supplier`, `Time Taken`, `Project Details`, `Name of PI`, `Grant Amount`, `Funder Website`
   - **Highlights**: Sindh Research Support Program (Sindh HEC) grants (Rs. 5M each) led by Dr. Murk Marvi and Prof. Dr. Muhammad Mubashir Khan.

4. **[`4_Vacancies.csv`](file:///c:/vibes/Air%20Lab/sheets-extension/seed-data/4_Vacancies.csv)**
   - **Tab Name in Google Sheets**: `Vacancies`
   - **Records**: 7 Configuration Settings
   - **Fields**: `Setting`, `Value`, `Notes / Help`
   - **Highlights**: Form status `Open`, Fall 2026 admissions titles, descriptions, and top announcement ribbon copy.

---

## ⚡ Option A: 1-Click Auto-Seed in Google Sheets (Recommended)

We updated [`sheets-extension/Code.gs`](file:///c:/vibes/Air%20Lab/sheets-extension/Code.gs) with a built-in one-click seeding script:

1. Open your Google Spreadsheet.
2. In Google Sheets, click **`Extensions`** → **`Apps Script`**.
3. Replace the code with the contents of [`sheets-extension/Code.gs`](file:///c:/vibes/Air%20Lab/sheets-extension/Code.gs) and click **Save** (💾).
4. Refresh your Google Spreadsheet tab.
5. In the top toolbar, click **`⚡ AIR Lab`** → **`🌱 Seed Official NED AIR Lab Data (All Tabs)`**.
6. That's it! All 4 tabs will be created, styled with dark headers, and populated with all official data in seconds.
7. Click **`⚡ AIR Lab`** → **`🚀 Sync All to Website`** anytime to publish sheet edits to the live website.

---

## 🌐 Option B: Live Database Status
The shared MongoDB Atlas database (`cluster0.xbk6omj.mongodb.net/airlab`) has **already been synced** with this official data. Both live URLs:
- `https://airlab-website-peach.vercel.app` (Production Main)
- `https://airlab-studio.vercel.app` (New Studio UI)
are currently serving this verified data to visitors and clients.
