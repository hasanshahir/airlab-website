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
 * 4. Refresh your Google Spreadsheet, then click:
 *    - "⚡ AIR Lab" -> "📥 Pull Student Applications from Website" (or "🚀 Sync All to Website")
 *    (This also activates automatic live background sync every minute + on every sheet refresh!)
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
  ['Modal Badge', 'FELLOWSHIP & INTERNSHIP ADMISSIONS', 'Small pill badge shown above the modal heading'],
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
    .addItem('🌱 Seed Official NED AIR Lab Data (All Tabs)', 'seedOfficialNedAirlabData')
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
 * Automatically installs background triggers (1-minute timer + onOpen refresh trigger)
 * so new student applications appear in "Student Applications" automatically!
 */
function ensureAutoPullTriggers() {
  try {
    const triggers = ScriptApp.getProjectTriggers()
    let hasTimeTrigger = false
    let hasOpenTrigger = false

    for (let i = 0; i < triggers.length; i++) {
      const fn = triggers[i].getHandlerFunction()
      if (fn === 'autoPullApplicationsSilent') {
        const type = triggers[i].getEventType()
        if (type === ScriptApp.EventType.CLOCK) hasTimeTrigger = true
        if (type === ScriptApp.EventType.ON_OPEN) hasOpenTrigger = true
      }
    }

    if (!hasTimeTrigger) {
      ScriptApp.newTrigger('autoPullApplicationsSilent').timeBased().everyMinutes(1).create()
    }
    if (!hasOpenTrigger) {
      const ss = SpreadsheetApp.getActiveSpreadsheet()
      if (ss) {
        ScriptApp.newTrigger('autoPullApplicationsSilent').forSpreadsheet(ss).onOpen().create()
      }
    }
  } catch (e) {
    // Ignore trigger creation errors if already at limit
  }
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

  const raw = sheet.getDataRange().getValues()
  if (raw.length >= 1 && raw[0].length >= 2) {
    const firstColHeader = String(raw[0][0] || '').trim().toLowerCase()
    const isStandardKeyValueHeader = ['setting', 'field', 'key', 'property', 'name'].indexOf(firstColHeader) !== -1
    if (isStandardKeyValueHeader) {
      return rows
    }
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
 * Also pulls all submitted applications from the website & activates auto-sync triggers!
 */
function setupVacancyAndApplicationTabs() {
  const vacResult = ensureVacanciesSheet()
  const appSheet = ensureApplicationsSheet()
  ensureAutoPullTriggers()
  const pulled = fetchAndAppendApplicationsSilent()

  const msg =
    '✅ Both tabs are ready and synced!\n\n' +
    '1. "' +
    vacResult.sheet.getName() +
    '" — Edit the "Value" column (Column B) anytime to change the Vacancy Modal Title, Description, Top Ribbon, or Open/Closed status, then click "🚀 Sync All to Website" (or "📢 Sync Vacancy Settings Only").\n\n' +
    '2. "' +
    appSheet.getName() +
    '" — Checked ' +
    pulled.total +
    ' website application(s), added ' +
    pulled.added +
    ' new row(s).\n\n' +
    '⚡ Live Auto-Sync is now ACTIVE: New student applications will automatically appear here every minute and whenever you refresh or open this sheet!'

  SpreadsheetApp.getUi().alert('Tabs Ready & Live Sync Active', msg, SpreadsheetApp.getUi().ButtonSet.OK)
}

/**
 * Appends a single student application object to "Student Applications" if not already present.
 * Handles both structured fields and combined degreeYear / statement strings.
 * Returns true if appended, false if skipped as duplicate.
 */
function appendApplicationRowIfNew(sheet, app) {
  if (!app) return false

  const appId = String(app.applicationId || app._id || '').trim()
  const fullName = String(app.fullName || app.name || '').trim()
  const email = String(app.email || '').trim().toLowerCase()
  const submittedAt = String(app.submittedAt || app.createdAt || new Date().toISOString()).trim()
  const formattedDate = submittedAt.replace('T', ' ').replace(/\.\d+Z$/, ' UTC')

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
      if (email && rowEmail === email && (rowSubmittedAt === formattedDate || rowSubmittedAt === submittedAt)) {
        return false
      }
    }
  }

  // Extract Roll No, Department, and Program (from explicit fields or from combined degreeYear string)
  let rollNo = String(app.rollNo || '').trim()
  let department = String(app.department || '').trim()
  let program = String(app.program || '').trim()
  const degStr = String(app.degreeYear || '').trim()
  if ((!rollNo || !department || !program) && degStr) {
    const rollMatch = degStr.match(/-\s*Roll:\s*(.+)$/i)
    if (!rollNo && rollMatch) rollNo = rollMatch[1].trim()
    const withoutRoll = degStr.replace(/\s*-\s*Roll:\s*.+$/i, '').trim()
    const deptMatch = withoutRoll.match(/^(.*)\(([^()]+)\)\s*$/)
    if (deptMatch) {
      if (!program) program = deptMatch[1].trim()
      if (!department) department = deptMatch[2].trim()
    } else if (!program) {
      program = withoutRoll
    }
  }

  // Extract Track and Statement (from explicit fields or from "[Track: ...] statement")
  let track = String(app.track || '').trim()
  let statement = String(app.statement || app.coverNote || '').trim()
  if (statement) {
    const trackMatch = statement.match(/^\[Track:\s*([^\]]+)\]\s*([\s\S]*)$/i)
    if (trackMatch) {
      if (!track) track = trackMatch[1].trim()
      statement = trackMatch[2].trim()
    }
  }

  const portfolioUrl = String(app.portfolioUrl || app.portfolio || app.github || '').trim()
  const resumeFile = String(
    app.resumeFileName || app.cvFileName || (app.cv && app.cv.fileName) || ''
  ).trim()

  const portfolioParts = []
  if (portfolioUrl) portfolioParts.push(portfolioUrl)
  if (resumeFile && appId) {
    const cleanBase = getCleanEndpoint().replace(/\/api\/sync\/sheets\/?$/, '')
    const syncSecret = encodeURIComponent(String(getSetting('SYNC_SECRET') || DEFAULT_CONFIG.SYNC_SECRET).trim())
    const cvUrl = cleanBase + '/api/sync/applications/' + encodeURIComponent(appId) + '/cv?secret=' + syncSecret
    portfolioParts.push(cvUrl)
  } else if (resumeFile) {
    portfolioParts.push('PDF: ' + resumeFile)
  }
  const portfolioCell = portfolioParts.join(' | ') || '—'

  sheet.appendRow([
    formattedDate,
    fullName,
    String(app.email || ''),
    rollNo || '—',
    department || '—',
    program || '—',
    track || '—',
    portfolioCell,
    statement || '—',
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
 * Silent background pull of student applications (used by onOpen & 1-minute timer triggers).
 */
function fetchAndAppendApplicationsSilent() {
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
    const res = UrlFetchApp.fetch(endpoint, options)
    const code = res.getResponseCode()
    if (code >= 200 && code < 300) {
      const parsed = JSON.parse(res.getContentText())
      const apps = (parsed && (parsed.applications || parsed.data)) || []
      const sheet = ensureApplicationsSheet()

      let addedCount = 0
      for (let i = 0; i < apps.length; i++) {
        if (appendApplicationRowIfNew(sheet, apps[i])) {
          addedCount++
        }
      }
      if (addedCount > 0) {
        SpreadsheetApp.flush()
      }
      return { ok: true, total: apps.length, added: addedCount, sheetName: sheet.getName() }
    }
    return { ok: false, total: 0, added: 0, error: 'HTTP ' + code }
  } catch (err) {
    return { ok: false, total: 0, added: 0, error: err.toString() }
  }
}

/**
 * Handler invoked automatically by the installable onOpen & 1-minute clock triggers.
 */
function autoPullApplicationsSilent() {
  fetchAndAppendApplicationsSilent()
}

/**
 * 📥 Pulls all student applications from MongoDB (`/api/sync/applications`)
 * and appends any missing entries into the "Student Applications" sheet tab.
 */
function pullApplicationsFromWebsite() {
  const ui = SpreadsheetApp.getUi()
  SpreadsheetApp.getActiveSpreadsheet().toast('Fetching student applications from website...', 'AIR Lab Sync', 5)
  ensureAutoPullTriggers()

  const result = fetchAndAppendApplicationsSilent()
  if (result.ok) {
    ui.alert(
      'Applications Synced',
      '📥 Checked ' +
        result.total +
        ' total application(s) from the website database.\n' +
        '✨ Added ' +
        result.added +
        ' new row(s) to "' +
        result.sheetName +
        '".\n\n' +
        '⚡ Auto-Sync is active (new submissions will automatically appear every minute and on sheet refresh).',
      ui.ButtonSet.OK
    )
  } else {
    ui.alert('Failed to Pull Applications', result.error || 'Check URL or Secret Key', ui.ButtonSet.OK)
  }
}

/**
 * Sends sync request to the AIR Lab backend API.
 */
function sendSyncPayload(payload) {
  const endpoint = getCleanEndpoint()
  const syncSecret = String(getSetting('SYNC_SECRET') || DEFAULT_CONFIG.SYNC_SECRET).trim()

  ensureAutoPullTriggers()

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

    // Also pull any new student applications into "Student Applications" tab during sync
    const appPull = fetchAndAppendApplicationsSilent()

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
        const vs = result.vacancy || result.vacancySettings || {}
        summary += `📢 Vacancy Form Settings: Updated (Status: ${vs.status || 'Open'}, Heading: "${vs.title || 'Apply for Research Vacancy'}")\n`
      }
      if (appPull && appPull.ok) {
        summary += `📥 Student Applications: ${appPull.added} new added (${appPull.total} total in sheet)\n`
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

/**
 * 🌱 Seeds all official AIR Lab data extracted from NED University's official records into the spreadsheet:
 *   1. "Faculty & Interns" (16 members: 6 Faculty Leads & Members + 10 Official Research Interns)
 *   2. "Undergraduate Projects" (8 FYDP projects with full student names & NED roll numbers)
 *   3. "Funded Projects" (2 Sindh HEC Grants: Connected Identity & Integrated Discovery)
 *   4. "Vacancies" (Fall 2026 admissions configuration)
 */
function seedOfficialNedAirlabData() {
  const ui = SpreadsheetApp.getUi()
  const response = ui.alert(
    '🌱 Seed Official NED AIR Lab Data',
    'This will populate your spreadsheet tabs ("Faculty & Interns", "Undergraduate Projects", "Funded Projects", and "Vacancies") with the complete official data extracted from NED University CSIT AIR Lab records.\n\nExisting sheets will be updated and formatted with official records.\n\nDo you want to proceed?',
    ui.ButtonSet.YES_NO
  )
  if (response !== ui.Button.YES) return

  const ss = SpreadsheetApp.getActiveSpreadsheet()

  // 1. Seed Faculty & Interns
  const facultyRows = [
    ['Name', 'Role', 'Email', 'Linkedin', 'Specialty', 'Resume'],
    ['Dr. Murk Marvi', 'Faculty Coordinator & PI', 'marvi@cloud.neduet.edu.pk', 'https://www.linkedin.com/in/murk-marvi/', 'NLP & LLMs, Distributed Systems & HPC, Digital Identity', 'https://cct.neduet.edu.pk/sites/default/files/csit/CV_new/Marvi25.pdf'],
    ['Prof. Dr. Muhammad Mubashir Khan', 'Principal Investigator & Professor', 'mmkhan@neduet.edu.pk', 'https://www.linkedin.com/in/muhammad-mubashir-khan-phd-smieee-facp-728b1424/', 'Digital Investigation, Information Discovery, Cybersecurity', 'https://cct.neduet.edu.pk/faculty/dr-muhammad-mubashir-khan'],
    ['Ms. Saadia Arshad', 'Faculty Member', 'saadia@cloud.neduet.edu.pk', 'https://www.linkedin.com/in/saadiaaarshad', 'Information Security, Cybersecurity, Network Security', 'https://cct.neduet.edu.pk/faculty/saadia-arshad'],
    ['Mr. Muhammad Arsalan', 'Faculty Member', 'arsalansaleem@neduet.edu.pk', 'https://www.linkedin.com/in/arsalansaleem', 'Wireless Security, Software-Defined Radio, RF Intelligence', 'https://cct.neduet.edu.pk/faculty/muhammad-arsalan'],
    ['Ms. Maham Ashraf', 'Faculty Member', 'mahamashraf820@gmail.com', 'https://www.linkedin.com/in/maham-ashraf-74600b1a1', 'Computer Vision, NLP & LLMs, Multimodal AI, RAG', 'https://cct.neduet.edu.pk/faculty/maham-ashraf'],
    ['Ms. Shiza Hassan', 'Faculty Member', 'shizahassan@cloud.neduet.edu.pk', 'https://pk.linkedin.com/in/shiza-hassan-5057b9216', 'Artificial Intelligence, Machine Learning, Generative AI, Data Science & RAG', 'https://cct.neduet.edu.pk/faculty/shiza-hassan'],
    ['Muhammad Shaheer Khan', 'Research Intern', 'khan4731403@cloud.neduet.edu.pk', 'https://www.linkedin.com/in/muhammad-shaheer-86043359/', 'Computer Vision, RAG Systems, Embedding Models, AI Automation', ''],
    ['Kashaf Zia', 'Research Intern', 'zia4630038@cloud.neduet.edu.pk', 'https://www.linkedin.com/in/kashaf-zia-24774a2ba/', 'Web & Mobile Dev, Machine Learning, Generative AI', ''],
    ['Haseeb Yaqoob', 'Research Intern', 'yaqoob4705143@cloud.neduet.edu.pk', 'https://www.linkedin.com/in/haseeb-yaqoob-864360287/', 'NLP & LLMs, Computer Vision', ''],
    ['Muhammad Umer Safee', 'Research Intern', 'safee4600033@cloud.neduet.edu.pk', 'https://www.linkedin.com/in/muhammad-umer-safee-b48256296', 'AI Agents, Autonomous Systems, Machine Learning', ''],
    ['Syed Omer Ahmed Shamsi', 'Research Intern', 'shamsi4601801@cloud.neduet.edu.pk', 'https://www.linkedin.com/in/syed-omer-ahmed-shamsi-b3aa6a251', 'Machine Learning, Deep Learning, Pipelines', ''],
    ['Syed Shujauddin Hashmi', 'Research Intern', 'hashmi4630439@cloud.neduet.edu.pk', 'https://www.linkedin.com/in/syed-shujauddin-hashmi-612050291/', 'Malware Analysis, Reverse Engineering, Multi-Agent Frameworks, Cyberthreat Intelligence', ''],
    ['Syed Muhammed Ahmed', 'Research Intern', 'ahmed4605214@cloud.neduet.edu.pk', 'https://www.linkedin.com/in/syedmuhammedahmed/', 'Data Science, Machine Learning, RAG Systems, Generative AI', ''],
    ['Roshaan Tahir', 'Research Intern', 'tahir4600051@cloud.neduet.edu.pk', 'https://www.linkedin.com/in/roshaantahir/', 'Deep Learning, Multi-Agent Systems, Distributed Systems, Data Engineering', ''],
    ['Muhammad Hammad Khan', 'Research Intern', 'khan4600572@cloud.neduet.edu.pk', 'https://www.linkedin.com/in/hammad-khan-308395286/', 'Data Science, RAG Systems, Agentic AI, AI Engineering', ''],
    ['Areeba Zehra Jafri', 'Research Intern', 'jafrri4603155@cloud.neduet.edu.pk', 'https://www.linkedin.com/in/areeba-zehra-jafri', 'Cybersecurity, Adversarial ML, Machine Learning, Network Security', ''],
  ]
  seedTabRows(ss, DEFAULT_CONFIG.TAB_FACULTY_INTERNS, facultyRows)

  // 2. Seed Undergraduate Projects
  const ugRows = [
    ['Title', 'Status', 'Team Members', 'Grant Supplier', 'Grant Amount', 'Time Taken', 'Pictures', 'Project Details'],
    [
      'AutoGradeHub – Automated Assignment Grading and Feedback System',
      'Finished',
      'Duaa Salman (CT-22009)\nMaryam Shaikh (CT-22012)\nMuhammad Ali (CT-22044)\nZaid Rahman (CT-22047)',
      'Undergraduate FYDP',
      'NA',
      'Aug 25 - May 26',
      'https://i.ibb.co/hx2y1jNQ/project-01.jpg',
      'AutoGradeHub is an AI-powered system that automatically grades programming assignments by running code in a secure environment against predefined test cases. It gives students detailed feedback, flags plagiarism, and gives teachers analytics on class performance. This saves teachers grading time and helps students learn from consistent, timely feedback.'
    ],
    [
      'Development of Voice Based Agent for Collecting Post-Ambulance Service Feedback',
      'Finished',
      'Hasan Mohi Uddin (CT-22024)\nKumel Ahmed (CT-22034)\nMuhammad Azlan Asim (CT-22036)\nShahzaib Ahmed (CT-22042)',
      'Undergraduate FYDP (in collaboration with SIEHS)',
      'NA',
      'Aug 25 - May 26',
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80',
      'This project develops a voice agent that calls patients after they use an ambulance service, speaks to them in Urdu or English, and gathers feedback on the care they received. By automating these calls, ambulance services can consistently hear from more patients without increasing call-centre workloads. The system converts speech to text, understands spoken responses, and summarises the results for service quality managers.'
    ],
    [
      'Strategic Agent – Real-Time Market Intelligence System for Smart Insights',
      'Finished',
      'Aisha Siddiqa (CT-22001)\nSyed Muhammad Daniyal (CT-22014)\nAbdul Ahad (CT-22019)\nMuhammad Daniyal (CT-22031)',
      'Undergraduate FYDP',
      'NA',
      'Aug 25 - May 26',
      'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80',
      'Strategic Agent is an AI platform that continuously collects market news, earnings reports, regulatory updates and social discussion, and turns them into concise, actionable summaries for business decision-makers. It extracts key trends, tracks competitors and flags sudden market shifts, replacing hours of manual searching with a single automated dashboard.'
    ],
    [
      'An Agentic AI-Powered Tour Guide for Safer and Smarter Travel in Pakistan',
      'Finished',
      'Syed Muhammad Danial (DT-22009)\nMuhammad Asjad (DT-22020)\nMuhammad Anas (DT-22026)\nSyeda Maria Zaidi (DT-22032)',
      'NEDAASC Funded',
      'NA',
      'Aug 25 - May 26',
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80',
      'This project builds an autonomous AI travel assistant that creates custom travel itineraries for Pakistan and monitors trips in real time. It factors in safety, weather, road conditions and personal preferences, and can adjust plans on the fly if routes close or conditions change. The system uses multiple specialized AI agents working together to give travelers a safer, more predictable journey.'
    ],
    [
      'Familiar: Quality-Aware Face Recognition System for Pakistani Subjects',
      'Ongoing',
      'Muhammad Ayan (CT-23010)\nHamza Masood (CT-23016)\nMuhammad Anas (CT-23035)\nBilal Ahmed (CT-23048)',
      'Indigenous Dataset Collection & Research Project',
      'NA',
      'Aug 26 - May 27',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
      'Familiar is a face recognition system evaluated on a newly collected, regionally diverse Pakistani dataset. It checks image quality before attempting recognition and adapts to local variations in lighting, glasses and facial hair, while remaining efficient on large databases. The prototype is intended for authorized uses such as searching campus camera footage, with humans making the final decision.'
    ],
    [
      'ScholarX: Locally Hosted SLM-Powered Platform for End-to-End Academic Research',
      'Ongoing',
      'Muhammad Ahmed Hasan (DT-23014)\nMuhammad Raahim Rizwan (DT-23015)\nMuhammad Huzaifa Baig (DT-23018)\nMuhammad Uzaim Naseem (DT-23047)',
      'On-Premises SLM Infrastructure',
      'NA',
      'Aug 26 - May 27',
      'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80',
      'This project proposes a locally hosted, web-based research assistant for NED UET that uses small language models to summarize papers, compare them thematically and methodologically, and help draft new papers with LaTeX support. Because everything runs on campus hardware, unpublished research never leaves the institution, which avoids the privacy and IP risks of cloud LLMs while still delivering competitive quality.'
    ],
    [
      'MemTrace: Lifecycle-Aware Provenance for Detecting and Mitigating Memory Poisoning Attacks in LLM Agents',
      'Ongoing',
      'Rameen (CT-23004)\nTooba Rehman (CT-23011)\nFatima (CT-23012)\nHuda Imran (CT-23015)',
      'LLM Security & Agent Provenance Research',
      'NA',
      'Aug 26 - May 27',
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80',
      'MemTrace is a security framework that protects LLM agents’ persistent memory from poisoning, where false or malicious information gets stored and later influences the agent across sessions. Instead of checking memory at only one stage, it tracks each entry’s origin, trust level and history through six lifecycle stages (write, store, retrieve, use, propagate, forget/rollback) and uses that provenance to flag, isolate, delete or roll back suspicious memories.'
    ],
    [
      'Naqshkaar: A Multimodal AI System for Constraint-Aware 3D Interior Design Generation',
      'Ongoing',
      'Mureed Hussain (Team Lead - CT-23036)\nMuhammad Sami (CT-23027)\nFaiq Ahmed (CT-23030)\nMuhammad Sameed (CT-23046)',
      'Multimodal Generative 3D Platform',
      'NA',
      'Aug 26 - May 27',
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80',
      'Naqshkaar is an AI interior design platform for Pakistan that generates 3D room designs from a real catalogue of purchasable local products, scaled to true room dimensions and checked against space and budget limits. Unlike tools such as Planner 5D or RoomGPT, it uses PKR prices, accounts for local needs like ceiling-fan clearance, AC and UPS placement, and prayer space, and lets users pick each item from AI-shortlisted options. The result is a design they can visualize and buy, with an itemised cost estimate and direct purchase links.'
    ],
  ]
  seedTabRows(ss, DEFAULT_CONFIG.TAB_UG_PROJECTS, ugRows)

  // 3. Seed Funded Projects
  const fundedRows = [
    ['Program Title', 'Project Title', 'Status', 'Grant Supplier', 'Time Taken', 'Project Details', 'Name of PI', 'Grant Amount', 'Funder Website'],
    [
      'Sindh Research Support Program',
      'Connected Identity Intelligence Platform for Digital Investigation',
      'Ongoing',
      'Government of Sindh — Sindh Higher Education Commission (Sindh HEC)',
      'June 26 - Present',
      'This project addresses three under-studied identity resolution problems in Pakistan by building three independent AI services: multilingual entity resolution with Urdu/English NER and CNIC-aware matching, LLM-driven generation of Urdu and English name variants (such as Mubashir, Mubashar and Mubasher) with confidence scores, and face matching with demographic-fairness auditing on a regionally representative test set. Each service is evaluated on curated benchmarks and backed by a peer-reviewed publication. Deliverables include trained models, annotated benchmark datasets released for reuse, model cards, and a published API specification so any compliant application can integrate the services.',
      'Dr. Murk Marvi',
      'Rs. 5 million',
      'https://sindhhec.gov.pk/'
    ],
    [
      'Sindh Research Support Program',
      'Integrated Information Discovery System for Digital Investigation',
      'Ongoing',
      'Government of Sindh — Sindh Higher Education Commission (Sindh HEC)',
      'June 26 - Present',
      'This project builds an on-premises investigation workspace for regulatory, compliance, audit, and journalistic work. Investigators usually start with little information about a subject and spend hours gathering and cross-checking public data from disconnected sites and tools. The platform cuts that work to minutes while keeping every result traceable to its source and a human in control.',
      'Prof. Dr. Muhammad Mubashir Khan',
      'Rs. 5 million',
      'https://sindhhec.gov.pk/'
    ],
  ]
  seedTabRows(ss, DEFAULT_CONFIG.TAB_FUNDED_PROJECTS, fundedRows)

  // 4. Seed Vacancies
  ensureVacanciesSheet()

  // 5. Ensure Student Applications header
  ensureApplicationsSheet()

  ui.alert(
    '🎉 Official NED AIR Lab Data Seeded!',
    'All tabs have been populated with official NED University AIR Lab data:\n\n' +
      '• "Faculty & Interns": 16 members (6 Faculty Leads + 10 Official Research Interns)\n' +
      '• "Undergraduate Projects": 8 FYDP projects with full team roll numbers & details\n' +
      '• "Funded Projects": 2 Sindh HEC Grants (Rs. 5M each)\n' +
      '• "Vacancies": Active Fall 2026 admissions configuration\n\n' +
      '👉 Click "⚡ AIR Lab" -> "🚀 Sync All to Website" whenever you want to update the live website from this sheet.',
    ui.ButtonSet.OK
  )
}

function seedTabRows(ss, sheetName, rows) {
  let sheet = findSheetFlexible(sheetName)
  if (!sheet) {
    sheet = ss.insertSheet(sheetName)
  }
  sheet.clear()

  const numRows = rows.length
  const numCols = rows[0].length
  const range = sheet.getRange(1, 1, numRows, numCols)
  range.setValues(rows)

  // Header styling
  const header = sheet.getRange(1, 1, 1, numCols)
  header.setBackground('#111827')
  header.setFontColor('#ffffff')
  header.setFontWeight('bold')
  header.setFontSize(10)
  sheet.setFrozenRows(1)

  // Data rows wrap & padding
  sheet.getRange(2, 1, numRows - 1, numCols).setWrap(true).setFontSize(10)
  sheet.autoResizeColumns(1, numCols)
}
