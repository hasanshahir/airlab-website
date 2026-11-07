/**
 * ============================================================================
 * AIR Lab (Artificial Intelligence Research Lab) — Google Sheets Sync Extension
 * ============================================================================
 *
 * Configured specifically for: AIR_Lab_Website_Data
 * Tabs supported:
 *   1. "Faculty & Interns"
 *   2. "Undergraduate Projects"
 *   3. "Funded Projects"
 *   4. "Vacancies"              (Dynamic Vacancy Modal Heading, Description & Status)
 *   5. "Student Applications"   (Live-Synced Student Vacancy Form Submissions)
 *
 * Instructions:
 * 1. In your Google Spreadsheet, click "Extensions" -> "Apps Script".
 * 2. Select all existing code, delete it, and paste this entire code.
 * 3. Click the Save icon (💾 or Ctrl + S).
 * 4. For LIVE instant form rows: Click "Deploy" -> "New deployment" ->
 *    Select type: "Web app" -> Execute as: "Me" -> Who has access: "Anyone" -> Deploy.
 * 5. Refresh your Google Spreadsheet, then click:
 *    - "⚡ AIR Lab" -> "📋 Setup 'Vacancies' & 'Student Applications' Tabs"
 *    - "⚡ AIR Lab" -> "🚀 Sync All to Website"
 * ============================================================================
 */

// Default Configuration
const DEFAULT_CONFIG = {
  BACKEND_URL: 'https://airlab-website-peach.vercel.app',
  SYNC_SECRET: 'airlab-sheets-sync-secret-2026',
  TAB_FACULTY_INTERNS: 'Faculty & Interns',
  TAB_UG_PROJECTS: 'Undergraduate Projects',
  TAB_FUNDED_PROJECTS: 'Funded Projects',
  TAB_VACANCIES: 'Vacancies',
  TAB_APPLICATIONS: 'Student Applications',
}

const APPLICATION_HEADERS = [
  'Submitted At',
  'Full Name',
  'NED Email',
  'Roll Number',
  'Department',
  'Degree Program',
  'Preferred Track',
  'Portfolio / GitHub / Resume',
  'Statement of Interest',
  'Application ID',
]

const DEFAULT_VACANCY_ROWS = [
  ['Setting', 'Value', 'Notes / Help'],
  ['Status', 'Open', 'Set to "Open" or "Closed" to enable/disable the student application form'],
  ['Modal Title', 'Apply for Research Vacancy', 'Main heading inside the Student Application popup modal'],
  [
    'Modal Description',
    'Department of CSIT · NED University. Work directly with faculty on LLMs, edge perception, and robotics testbeds.',
    'Subtitle / description text shown directly below the modal heading',
  ],
  ['Modal Badge', 'Student Portal', 'Small pill badge shown above the modal heading'],
  ['Top Ribbon Label', 'Applications Open:', 'Bold accent prefix in the top announcement bar'],
  [
    'Top Ribbon Text',
    'Student Research Internship & Fellowship Vacancies Open for Fall 2026 — NEDUET CSIT',
    'Announcement text displayed at the very top of the website',
  ],
  [
    'Closed Message',
    'Applications are currently closed. Please check back later for upcoming research vacancy cycles.',
    'Message shown to students when Status is set to "Closed"',
  ],
]

function getSetting(key) {
  const props = PropertiesService.getScriptProperties()
  const custom = props.getProperty(key)
  return custom || DEFAULT_CONFIG[key]
}

/**
 * Auto-detects the deployed Apps Script Web App URL (or custom WEBHOOK_URL property)
 * so the website backend knows where to push live student applications in real time.
 */
function getDetectedWebhookUrl() {
  const props = PropertiesService.getScriptProperties()
  const customWebhook = props.getProperty('WEBHOOK_URL')
  if (customWebhook && customWebhook.trim().startsWith('http')) {
    return customWebhook.trim()
  }
  try {
    const serviceUrl = ScriptApp.getService().getUrl()
    if (serviceUrl && serviceUrl.startsWith('http')) {
      return serviceUrl
    }
  } catch (e) {
    // Ignore if not deployed as web app yet
  }
  return ''
}

/**
 * Robust URL resolver that strips hash fragments (#), query strings, and duplicate paths
 * so that any URL entered (even with /#/ or /admin) cleanly resolves to:
 * https://airlab-website-peach.vercel.app/api/sync/sheets
 */
function getCleanEndpoint() {
  let url = String(getSetting('BACKEND_URL') || DEFAULT_CONFIG.BACKEND_URL).trim()

  // 1. Strip hash fragments (e.g. /#/ or #/admin)
  if (url.includes('#')) {
    url = url.split('#')[0]
  }

  // 2. Strip query parameters
  if (url.includes('?')) {
    url = url.split('?')[0]
  }

  // 3. Remove trailing slashes
  url = url.replace(/\/+$/, '')

  // 4. Strip duplicate /api/sync/sheets or /api
  url = url.replace(/\/api\/sync\/sheets\/?$/i, '')
  url = url.replace(/\/api\/?$/i, '')

  // 5. Fallback if empty or invalid
  if (!url || !url.startsWith('http')) {
    url = DEFAULT_CONFIG.BACKEND_URL
  }

  return url.replace(/\/+$/, '') + '/api/sync/sheets'
}

/**
 * Creates custom menu in Google Sheets upon opening.
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi()
  ui.createMenu('⚡ AIR Lab')
    .addItem('🚀 Sync All to Website', 'syncAllTabs')
    .addItem('🔄 Fresh Sync (Wipe & Re-Upload Sheet Data)', 'freshSyncAllTabs')
    .addSeparator()
    .addItem('📢 Sync Vacancy Settings Only', 'syncVacancyOnly')
    .addItem('📥 Pull Student Applications from Website', 'pullApplicationsFromWebsite')
    .addItem('📋 Setup "Vacancies" & "Student Applications" Tabs', 'setupVacancyAndApplicationTabs')
    .addSeparator()
    .addItem('👥 Sync Faculty & Interns Only', 'syncFacultyInternsOnly')
    .addItem('🎓 Sync Undergraduate Projects Only', 'syncUndergraduateOnly')
    .addItem('💰 Sync Funded Projects Only', 'syncFundedOnly')
    .addSeparator()
    .addItem('🧹 Clean All Placeholder / Mock Data from Website', 'cleanPlaceholderData')
    .addItem('⚙️ Configure Website URL & Secret', 'configureSettings')
    .addItem('🔗 Configure Live Application Webhook URL', 'configureWebhookUrl')
    .addItem('🔄 Reset to Default Configuration', 'resetToDefaults')
    .addToUi()
}

/**
 * Finds a sheet tab flexibly (case-insensitive and typo-tolerant).
 */
function findSheetFlexible(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  let sheet = ss.getSheetByName(sheetName)
  if (sheet) return sheet

  const allSheets = ss.getSheets()
  const cleanTarget = sheetName.toLowerCase().replace(/[^a-z]/g, '')
  for (let i = 0; i < allSheets.length; i++) {
    const s = allSheets[i]
    const cleanName = s.getName().toLowerCase().replace(/[^a-z]/g, '')
    if (cleanName === cleanTarget) return s
    if (cleanTarget.includes('funded') && cleanName.includes('funded')) return s
    if (cleanTarget.includes('undergraduate') && cleanName.includes('undergraduate')) return s
    if (cleanTarget.includes('faculty') && cleanName.includes('faculty')) return s
    if (cleanTarget.includes('vacanc') && (cleanName.includes('vacanc') || cleanName.includes('setting'))) return s
    if (cleanTarget.includes('application') && cleanName.includes('application')) return s
  }
  return null
}

/**
 * Reads any sheet tab into an array of clean JSON objects using row 1 as column headers.
 */
function readSheetToObjects(sheetName) {
  const sheet = findSheetFlexible(sheetName)
  if (!sheet) return null

  const data = sheet.getDataRange().getValues()
  if (data.length < 2) return []

  const rawHeaders = data[0]
  const headers = rawHeaders.map(h => String(h || '').trim())
  const rows = []

  for (let r = 1; r < data.length; r++) {
    const rowData = data[r]
    const hasData = rowData.some(c => c !== null && c !== undefined && String(c).trim() !== '')
    if (!hasData) continue

    const obj = {}
    for (let c = 0; c < headers.length; c++) {
      const key = headers[c]
      if (!key) continue
      const val = rowData[c]
      obj[key] = val !== null && val !== undefined ? String(val).trim() : ''
    }
    rows.push(obj)
  }

  return rows
}

/**
 * Reads the "Vacancies" sheet tab. Supports both:
 *   1. Two-column Key/Value format (Setting | Value)
 *   2. Horizontal Header/Row format (Status | Modal Title | Modal Description | ...)
 */
function readVacancySettings() {
  const sheetName = getSetting('TAB_VACANCIES')
  const sheet = findSheetFlexible(sheetName)
  if (!sheet) return null

  const rows = readSheetToObjects(sheetName)
  if (!rows || rows.length === 0) return null

  // If the user left row 1 without "Setting | Value" headers and started directly with key-value pairs,
  // also parse raw cells so no rows are missed.
  const raw = sheet.getDataRange().getValues()
  if (raw.length >= 1 && raw[0].length >= 2) {
    const firstColHeader = String(raw[0][0] || '').trim().toLowerCase()
    const isStandardKeyValueHeader = ['setting', 'field', 'key', 'property', 'name'].indexOf(firstColHeader) !== -1
    if (isStandardKeyValueHeader) {
      return rows
    }
    // Check if first column looks like setting names directly without a header row
    const directPairs = []
    for (let r = 0; r < raw.length; r++) {
      const k = String(raw[r][0] || '').trim()
      const v = String(raw[r][1] || '').trim()
      if (k) {
        directPairs.push({ Setting: k, Value: v })
      }
    }
    if (directPairs.length > 1) {
      return directPairs
    }
  }

  return rows
}

/**
 * Ensures the "Student Applications" sheet exists and has styled headers.
 */
function ensureApplicationsSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  const tabName = getSetting('TAB_APPLICATIONS')
  let sheet = findSheetFlexible(tabName)

  if (!sheet) {
    sheet = ss.insertSheet(tabName)
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(APPLICATION_HEADERS)
    const headerRange = sheet.getRange(1, 1, 1, APPLICATION_HEADERS.length)
    headerRange
      .setFontWeight('bold')
      .setBackground('#0f172a')
      .setFontColor('#ffffff')
    sheet.setFrozenRows(1)
    sheet.setColumnWidth(1, 165) // Submitted At
    sheet.setColumnWidth(2, 160) // Full Name
    sheet.setColumnWidth(3, 210) // NED Email
    sheet.setColumnWidth(4, 120) // Roll Number
    sheet.setColumnWidth(5, 190) // Department
    sheet.setColumnWidth(6, 170) // Degree Program
    sheet.setColumnWidth(7, 230) // Preferred Track
    sheet.setColumnWidth(8, 220) // Portfolio / GitHub / Resume
    sheet.setColumnWidth(9, 320) // Statement of Interest
    sheet.setColumnWidth(10, 180) // Application ID
  }

  return sheet
}

/**
 * Ensures the "Vacancies" sheet exists and is pre-populated with default settings.
 */
function ensureVacanciesSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  const tabName = getSetting('TAB_VACANCIES')
  let sheet = findSheetFlexible(tabName)
  let createdNew = false

  if (!sheet) {
    sheet = ss.insertSheet(tabName)
    createdNew = true
  }

  if (sheet.getLastRow() === 0) {
    createdNew = true
    sheet.getRange(1, 1, DEFAULT_VACANCY_ROWS.length, 3).setValues(DEFAULT_VACANCY_ROWS)

    // Style header row
    sheet
      .getRange(1, 1, 1, 3)
      .setFontWeight('bold')
      .setBackground('#0f172a')
      .setFontColor('#ffffff')

    // Style setting key column
    sheet.getRange(2, 1, DEFAULT_VACANCY_ROWS.length - 1, 1).setFontWeight('bold').setBackground('#f8fafc')

    // Style notes column
    sheet.getRange(2, 3, DEFAULT_VACANCY_ROWS.length - 1, 1).setFontColor('#64748b').setFontStyle('italic')

    // Add Open/Closed dropdown validation on Status value cell (B2)
    const statusRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['Open', 'Closed'], true)
      .setAllowInvalid(false)
      .build()
    sheet.getRange('B2').setDataValidation(statusRule)

    sheet.setFrozenRows(1)
    sheet.setColumnWidth(1, 180)
    sheet.setColumnWidth(2, 460)
    sheet.setColumnWidth(3, 380)
  }

  return { sheet: sheet, createdNew: createdNew }
}

/**
 * 📋 One-click setup for "Vacancies" and "Student Applications" tabs
 */
function setupVacancyAndApplicationTabs() {
  const vacResult = ensureVacanciesSheet()
  const appSheet = ensureApplicationsSheet()
  const webhookUrl = getDetectedWebhookUrl()

  let msg =
    '✅ Both tabs are ready!\n\n' +
    '1. "' +
    vacResult.sheet.getName() +
    '" — Edit the "Value" column (Column B) anytime to change the Vacancy Modal Title, Description, Top Ribbon, or Open/Closed status, then click "🚀 Sync All to Website" (or "📢 Sync Vacancy Settings Only").\n\n' +
    '2. "' +
    appSheet.getName() +
    '" — Stores all student vacancy form submissions.\n\n'

  if (webhookUrl) {
    msg += '🔗 Live Webhook Detected:\n' + webhookUrl + '\n(Click "🚀 Sync All to Website" once to register it with the website.)'
  } else {
    msg +=
      '💡 For instant real-time row insertion when a student submits the form:\n' +
      'In Apps Script, click "Deploy" -> "New deployment" -> Type: "Web app" -> Execute as: "Me" -> Who has access: "Anyone" -> Deploy, then run "🚀 Sync All to Website".\n' +
      '(You can also click "📥 Pull Student Applications from Website" anytime!)'
  }

  SpreadsheetApp.getUi().alert('Tabs Ready', msg, SpreadsheetApp.getUi().ButtonSet.OK)
}

/**
 * Appends a single student application object to "Student Applications" if not already present.
 * Returns true if appended, false if skipped as duplicate.
 */
function appendApplicationRowIfNew(sheet, app) {
  if (!app) return false

  const appId = String(app.applicationId || app._id || '').trim()
  const email = String(app.email || '').trim().toLowerCase()
  const submittedAt = String(app.submittedAt || app.createdAt || new Date().toISOString()).trim()

  const lastRow = sheet.getLastRow()
  if (lastRow >= 2) {
    const existingData = sheet.getRange(2, 1, lastRow - 1, APPLICATION_HEADERS.length).getValues()
    for (let i = 0; i < existingData.length; i++) {
      const rowAppId = String(existingData[i][9] || '').trim()
      const rowSubmittedAt = String(existingData[i][0] || '').trim()
      const rowEmail = String(existingData[i][2] || '').trim().toLowerCase()

      if (appId && rowAppId && rowAppId === appId) {
        return false
      }
      if (!appId && email && rowEmail === email && rowSubmittedAt === submittedAt) {
        return false
      }
    }
  }

  const portfolioParts = []
  if (app.portfolioUrl) portfolioParts.push(String(app.portfolioUrl).trim())
  if (app.resumeFileName) portfolioParts.push('Resume: ' + String(app.resumeFileName).trim())
  const portfolioCell = portfolioParts.join(' | ') || '—'

  const formattedDate = submittedAt.replace('T', ' ').replace(/\.\d+Z$/, ' UTC')

  sheet.appendRow([
    formattedDate,
    String(app.fullName || ''),
    String(app.email || ''),
    String(app.rollNo || ''),
    String(app.department || ''),
    String(app.program || ''),
    String(app.track || ''),
    portfolioCell,
    String(app.statement || ''),
    appId || '—',
  ])

  return true
}

/**
 * 🌐 Live Webhook Receiver (`doPost`)
 * Triggered automatically in real time by the AIR Lab backend whenever a student
 * submits the "Apply for Research Vacancy" form on the website.
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(JSON.stringify({ ok: false, error: 'Empty payload' })).setMimeType(
        ContentService.MimeType.JSON
      )
    }

    const body = JSON.parse(e.postData.contents)
    const expectedSecret = String(getSetting('SYNC_SECRET') || DEFAULT_CONFIG.SYNC_SECRET).trim()

    if (!body || body.secret !== expectedSecret) {
      return ContentService.createTextOutput(JSON.stringify({ ok: false, error: 'Unauthorized secret' })).setMimeType(
        ContentService.MimeType.JSON
      )
    }

    if (body.action === 'appendApplication' && body.application) {
      const lock = LockService.getScriptLock()
      lock.waitLock(10000)
      try {
        const sheet = ensureApplicationsSheet()
        const added = appendApplicationRowIfNew(sheet, body.application)
        SpreadsheetApp.flush()
        return ContentService.createTextOutput(
          JSON.stringify({ ok: true, added: added, sheet: sheet.getName() })
        ).setMimeType(ContentService.MimeType.JSON)
      } finally {
        lock.releaseLock()
      }
    }

    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: 'Unknown action' })).setMimeType(
      ContentService.MimeType.JSON
    )
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ ok: false, error: err && err.message ? err.message : String(err) })
    ).setMimeType(ContentService.MimeType.JSON)
  }
}

/**
 * 📥 Pulls all student applications from MongoDB (`/api/sync/applications`)
 * and appends any missing entries into the "Student Applications" sheet tab.
 */
function pullApplicationsFromWebsite() {
  const ui = SpreadsheetApp.getUi()
  const cleanBase = getCleanEndpoint().replace(/\/api\/sync\/sheets\/?$/, '')
  const endpoint = cleanBase + '/api/sync/applications'
  const syncSecret = String(getSetting('SYNC_SECRET') || DEFAULT_CONFIG.SYNC_SECRET).trim()

  const options = {
    method: 'get',
    headers: {
      'x-sync-secret': syncSecret,
    },
    muteHttpExceptions: true,
  }

  try {
    SpreadsheetApp.getActiveSpreadsheet().toast('Fetching student applications from website...', 'AIR Lab Sync', 10)
    const res = UrlFetchApp.fetch(endpoint, options)
    const code = res.getResponseCode()
    const text = res.getContentText()

    if (code >= 200 && code < 300) {
      const parsed = JSON.parse(text)
      const apps = (parsed && parsed.data) || []
      const sheet = ensureApplicationsSheet()

      // Append in chronological order (oldest first so newest is at bottom)
      const chronological = apps.slice().reverse()
      let addedCount = 0
      for (let i = 0; i < chronological.length; i++) {
        if (appendApplicationRowIfNew(sheet, chronological[i])) {
          addedCount++
        }
      }

      ui.alert(
        'Applications Synced',
        '📥 Checked ' +
          apps.length +
          ' total application(s) from the website database.\n' +
          '✨ Added ' +
          addedCount +
          ' new row(s) to "' +
          sheet.getName() +
          '".',
        ui.ButtonSet.OK
      )
    } else {
      ui.alert('Failed to Pull Applications (HTTP ' + code + ')', text || 'Check URL or Secret Key', ui.ButtonSet.OK)
    }
  } catch (err) {
    ui.alert('Connection Error', err.toString(), ui.ButtonSet.OK)
  }
}

/**
 * Sends sync request to the AIR Lab backend API.
 */
function sendSyncPayload(payload) {
  const endpoint = getCleanEndpoint()
  const syncSecret = String(getSetting('SYNC_SECRET') || DEFAULT_CONFIG.SYNC_SECRET).trim()

  // Automatically attach deployed Web App URL if available so live application sync works automatically
  const webhookUrl = getDetectedWebhookUrl()
  if (webhookUrl && !payload.webhookUrl) {
    payload.webhookUrl = webhookUrl
  }

  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'x-sync-secret': syncSecret,
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  }

  try {
    SpreadsheetApp.getActiveSpreadsheet().toast('Connecting to ' + endpoint + '...', 'AIR Lab Sync', 10)
    const res = UrlFetchApp.fetch(endpoint, options)
    const code = res.getResponseCode()
    const text = res.getContentText()

    if (code >= 200 && code < 300) {
      let result = {}
      try {
        result = JSON.parse(text)
      } catch (e) {
        result = {}
      }
      const st = result.stats || {}

      let summary = '✅ Website Database Synced Successfully!\n\n'

      if (st.facultyAndInterns && st.facultyAndInterns.processed > 0) {
        summary += `👥 Faculty & Interns: ${st.facultyAndInterns.updated} updated, ${st.facultyAndInterns.created} added (${st.facultyAndInterns.processed} total)\n`
      }
      if (st.undergraduateProjects && st.undergraduateProjects.processed > 0) {
        summary += `🎓 Undergraduate Projects: ${st.undergraduateProjects.updated} updated, ${st.undergraduateProjects.created} added (${st.undergraduateProjects.processed} total)\n`
      }
      if (st.fundedProjects && st.fundedProjects.processed > 0) {
        summary += `💰 Funded Projects: ${st.fundedProjects.updated} updated, ${st.fundedProjects.created} added (${st.fundedProjects.processed} total)\n`
      }
      if (st.vacancySettings && st.vacancySettings.updated) {
        const vs = result.vacancySettings || {}
        summary += `📢 Vacancy Form Settings: Updated (Status: ${vs.status || 'Open'}, Heading: "${vs.title || 'Apply for Research Vacancy'}")\n`
      }
      if (webhookUrl) {
        summary += `🔗 Live Applications Webhook: Active\n`
      }

      SpreadsheetApp.getUi().alert('Sync Complete', summary, SpreadsheetApp.getUi().ButtonSet.OK)
    } else {
      SpreadsheetApp.getUi().alert(
        'Sync Failed (HTTP ' + code + ')',
        'Target Endpoint:\n' + endpoint + '\n\nServer Response:\n' + (text ? text.slice(0, 300) : 'Check URL or Secret Key'),
        SpreadsheetApp.getUi().ButtonSet.OK
      )
    }
  } catch (err) {
    SpreadsheetApp.getUi().alert(
      'Connection Error',
      'Could not connect to:\n' + endpoint + '\n\nError: ' + err.toString(),
      SpreadsheetApp.getUi().ButtonSet.OK
    )
  }
}

/**
 * 🚀 Sync All Tabs to Website (Faculty, UG Projects, Funded Projects, and Vacancies)
 */
function syncAllTabs() {
  const facRows = readSheetToObjects(getSetting('TAB_FACULTY_INTERNS'))
  const ugRows = readSheetToObjects(getSetting('TAB_UG_PROJECTS'))
  const fundedRows = readSheetToObjects(getSetting('TAB_FUNDED_PROJECTS'))
  const vacancyRows = readVacancySettings()

  if (!facRows && !ugRows && !fundedRows && !vacancyRows) {
    SpreadsheetApp.getUi().alert(
      'Tabs Not Found',
      'Could not find the expected sheets:\n- ' +
        getSetting('TAB_FACULTY_INTERNS') +
        '\n- ' +
        getSetting('TAB_UG_PROJECTS') +
        '\n- ' +
        getSetting('TAB_FUNDED_PROJECTS') +
        '\n- ' +
        getSetting('TAB_VACANCIES') +
        '\n\nPlease verify that your bottom sheet tab names match.',
      SpreadsheetApp.getUi().ButtonSet.OK
    )
    return
  }

  const payload = {
    facultyAndInterns: facRows || [],
    undergraduateProjects: ugRows || [],
    fundedProjects: fundedRows || [],
    removePlaceholders: true,
  }
  if (vacancyRows && vacancyRows.length > 0) {
    payload.vacancySettings = vacancyRows
  }

  sendSyncPayload(payload)
}

/**
 * 🔄 Fresh Sync (Wipes old records and repopulates strictly from spreadsheet)
 */
function freshSyncAllTabs() {
  const ui = SpreadsheetApp.getUi()
  const confirm = ui.alert(
    'Fresh Sync Confirmation',
    'This will wipe all existing website projects & team records and re-populate them strictly from the current spreadsheet tabs.\n\nProceed?',
    ui.ButtonSet.YES_NO
  )
  if (confirm !== ui.Button.YES) return

  const facRows = readSheetToObjects(getSetting('TAB_FACULTY_INTERNS'))
  const ugRows = readSheetToObjects(getSetting('TAB_UG_PROJECTS'))
  const fundedRows = readSheetToObjects(getSetting('TAB_FUNDED_PROJECTS'))
  const vacancyRows = readVacancySettings()

  const payload = {
    facultyAndInterns: facRows || [],
    undergraduateProjects: ugRows || [],
    fundedProjects: fundedRows || [],
    clearBeforeSync: true,
    removePlaceholders: true,
  }
  if (vacancyRows && vacancyRows.length > 0) {
    payload.vacancySettings = vacancyRows
  }

  sendSyncPayload(payload)
}

/**
 * 📢 Sync Vacancy Settings tab only
 */
function syncVacancyOnly() {
  let vacancyRows = readVacancySettings()
  if (!vacancyRows || vacancyRows.length === 0) {
    const ui = SpreadsheetApp.getUi()
    const confirm = ui.alert(
      'Vacancies Tab Not Found',
      'Tab "' +
        getSetting('TAB_VACANCIES') +
        '" was not found or is empty.\n\nWould you like to create it now with the default heading & description?',
      ui.ButtonSet.YES_NO
    )
    if (confirm === ui.Button.YES) {
      ensureVacanciesSheet()
      vacancyRows = readVacancySettings()
    } else {
      return
    }
  }
  sendSyncPayload({ vacancySettings: vacancyRows })
}

/**
 * 🧹 Clean All Placeholder / Mock Records from Website Database
 */
function cleanPlaceholderData() {
  const ui = SpreadsheetApp.getUi()
  const confirm = ui.alert(
    'Clean Placeholder Data',
    'This will remove all generated mock projects, fake interns, and stock photos from the website database, leaving only real content created by you.\n\nProceed?',
    ui.ButtonSet.YES_NO
  )
  if (confirm !== ui.Button.YES) return

  const cleanBase = getCleanEndpoint().replace(/\/api\/sync\/sheets\/?$/, '')
  const endpoint = cleanBase + '/api/sync/cleanup'
  const syncSecret = String(getSetting('SYNC_SECRET') || DEFAULT_CONFIG.SYNC_SECRET).trim()

  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: { 'x-sync-secret': syncSecret },
    payload: JSON.stringify({ wipeAll: false }),
    muteHttpExceptions: true,
  }

  try {
    SpreadsheetApp.getActiveSpreadsheet().toast('Cleaning placeholder data...', 'AIR Lab Sync', 10)
    const res = UrlFetchApp.fetch(endpoint, options)
    const code = res.getResponseCode()
    const text = res.getContentText()

    if (code >= 200 && code < 300) {
      ui.alert('Cleanup Complete', 'All artificial placeholders and mock data have been removed from the website database!', ui.ButtonSet.OK)
    } else {
      ui.alert('Cleanup Failed (HTTP ' + code + ')', text || 'Could not clean placeholders.', ui.ButtonSet.OK)
    }
  } catch (err) {
    ui.alert('Connection Error', err.toString(), ui.ButtonSet.OK)
  }
}

/**
 * Sync Faculty & Interns tab only
 */
function syncFacultyInternsOnly() {
  const rows = readSheetToObjects(getSetting('TAB_FACULTY_INTERNS'))
  if (!rows) {
    SpreadsheetApp.getUi().alert('Tab "' + getSetting('TAB_FACULTY_INTERNS') + '" not found.')
    return
  }
  sendSyncPayload({ facultyAndInterns: rows, removePlaceholders: true })
}

/**
 * Sync Undergraduate Projects tab only
 */
function syncUndergraduateOnly() {
  const rows = readSheetToObjects(getSetting('TAB_UG_PROJECTS'))
  if (!rows) {
    SpreadsheetApp.getUi().alert('Tab "' + getSetting('TAB_UG_PROJECTS') + '" not found.')
    return
  }
  sendSyncPayload({ undergraduateProjects: rows, removePlaceholders: true })
}

/**
 * Sync Funded Projects tab only
 */
function syncFundedOnly() {
  const rows = readSheetToObjects(getSetting('TAB_FUNDED_PROJECTS'))
  if (!rows) {
    SpreadsheetApp.getUi().alert('Tab "' + getSetting('TAB_FUNDED_PROJECTS') + '" not found.')
    return
  }
  sendSyncPayload({ fundedProjects: rows, removePlaceholders: true })
}

/**
 * Modal to configure custom Backend URL or Secret.
 */
function configureSettings() {
  const ui = SpreadsheetApp.getUi()
  const props = PropertiesService.getScriptProperties()

  const currentUrl = getSetting('BACKEND_URL')
  const urlPrompt = ui.prompt(
    'Configure Website URL',
    'Enter your live website URL (e.g. https://airlab-website-peach.vercel.app):\n\nCurrent: ' + currentUrl,
    ui.ButtonSet.OK_CANCEL
  )
  if (urlPrompt.getSelectedButton() === ui.Button.OK) {
    let val = urlPrompt.getResponseText().trim()
    if (val) {
      val = val.split('#')[0].split('?')[0].replace(/\/+$/, '').replace(/\/api\/sync\/sheets\/?$/i, '').replace(/\/api\/?$/i, '')
      props.setProperty('BACKEND_URL', val)
    }
  }

  const currentSecret = getSetting('SYNC_SECRET')
  const secretPrompt = ui.prompt(
    'Configure Sync Secret',
    'Enter your secret key:\nDefault: ' + DEFAULT_CONFIG.SYNC_SECRET + '\n\nCurrent: ' + currentSecret,
    ui.ButtonSet.OK_CANCEL
  )
  if (secretPrompt.getSelectedButton() === ui.Button.OK) {
    const val = secretPrompt.getResponseText().trim()
    if (val) props.setProperty('SYNC_SECRET', val)
  }

  ui.alert(
    'Settings Saved',
    'Configured Target Endpoint:\n' + getCleanEndpoint() + '\n\nYou can now run "🚀 Sync All to Website"!',
    ui.ButtonSet.OK
  )
}

/**
 * 🔗 Configure or Verify Live Application Webhook URL
 */
function configureWebhookUrl() {
  const ui = SpreadsheetApp.getUi()
  const props = PropertiesService.getScriptProperties()
  const current = getDetectedWebhookUrl()

  const prompt = ui.prompt(
    'Live Student Applications Webhook URL',
    'When you deploy this Apps Script as a Web App (Deploy -> New deployment -> Web app -> Anyone), paste the Web App URL here (or leave blank to auto-detect):\n\nCurrent: ' +
      (current || '(Not set yet)'),
    ui.ButtonSet.OK_CANCEL
  )
  if (prompt.getSelectedButton() === ui.Button.OK) {
    const val = prompt.getResponseText().trim()
    if (val) {
      props.setProperty('WEBHOOK_URL', val)
      sendSyncPayload({ webhookUrl: val })
    } else {
      props.deleteProperty('WEBHOOK_URL')
      ui.alert('Webhook Cleared', 'Will use automatic ScriptApp Web App URL detection.', ui.ButtonSet.OK)
    }
  }
}

/**
 * 🔄 Reset Configuration to Default
 */
function resetToDefaults() {
  const ui = SpreadsheetApp.getUi()
  const confirm = ui.alert(
    'Reset Configuration',
    'Reset Website URL and Secret to defaults?\n\nURL: ' + DEFAULT_CONFIG.BACKEND_URL + '\nSecret: ' + DEFAULT_CONFIG.SYNC_SECRET,
    ui.ButtonSet.YES_NO
  )
  if (confirm === ui.Button.YES) {
    const props = PropertiesService.getScriptProperties()
    props.deleteProperty('BACKEND_URL')
    props.deleteProperty('SYNC_SECRET')
    props.deleteProperty('WEBHOOK_URL')
    ui.alert('Reset Complete', 'Configuration restored to defaults.\nTarget Endpoint:\n' + getCleanEndpoint(), ui.ButtonSet.OK)
  }
}
