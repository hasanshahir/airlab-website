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
 *
 * Instructions:
 * 1. In your Google Spreadsheet, click "Extensions" -> "Apps Script".
 * 2. Delete any existing code and replace with this entire file.
 * 3. Save (Ctrl + S) and refresh your Google Spreadsheet.
 * 4. A new "⚡ AIR Lab" menu will appear in the top toolbar!
 * ============================================================================
 */

// Default Configuration (Can be changed from menu ⚡ AIR Lab -> ⚙️ Configure Website URL & Secret)
const DEFAULT_CONFIG = {
  BACKEND_URL: 'https://airlab-website.vercel.app', // Or your custom domain / localhost ngrok tunnel
  SYNC_SECRET: 'airlab-sheets-sync-secret-2026',
  TAB_FACULTY_INTERNS: 'Faculty & Interns',
  TAB_UG_PROJECTS: 'Undergraduate Projects',
  TAB_FUNDED_PROJECTS: 'Funded Projects',
}

function getSetting(key) {
  const props = PropertiesService.getScriptProperties()
  const custom = props.getProperty(key)
  return custom || DEFAULT_CONFIG[key]
}

/**
 * Creates custom menu in Google Sheets upon opening.
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi()
  ui.createMenu('⚡ AIR Lab')
    .addItem('🚀 Sync All to Website', 'syncAllTabs')
    .addSeparator()
    .addItem('👥 Sync Faculty & Interns Only', 'syncFacultyInternsOnly')
    .addItem('🎓 Sync Undergraduate Projects Only', 'syncUndergraduateOnly')
    .addItem('💰 Sync Funded Projects Only', 'syncFundedOnly')
    .addSeparator()
    .addItem('⚙️ Configure Website URL & Secret', 'configureSettings')
    .addToUi()
}

/**
 * Reads any sheet tab into an array of clean JSON objects using row 1 as column headers.
 */
function readSheetToObjects(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  const sheet = ss.getSheetByName(sheetName)
  if (!sheet) return null

  const data = sheet.getDataRange().getValues()
  if (data.length < 2) return []

  const rawHeaders = data[0]
  const headers = rawHeaders.map(h => String(h || '').trim())
  const rows = []

  for (let r = 1; r < data.length; r++) {
    const rowData = data[r]
    // Check if the row has any non-empty cell
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
 * Sends sync request to the AIR Lab backend API.
 */
function sendSyncPayload(payload) {
  const backendUrl = getSetting('BACKEND_URL').replace(/\/+$/, '')
  const syncSecret = getSetting('SYNC_SECRET')
  const endpoint = backendUrl + '/api/sync/sheets'

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
    SpreadsheetApp.getActiveSpreadsheet().toast('Syncing with AIR Lab database...', 'AIR Lab Sync', 10)
    const res = UrlFetchApp.fetch(endpoint, options)
    const code = res.getResponseCode()
    const text = res.getContentText()

    if (code >= 200 && code < 300) {
      const result = JSON.parse(text)
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

      SpreadsheetApp.getUi().alert('Sync Complete', summary, SpreadsheetApp.getUi().ButtonSet.OK)
    } else {
      SpreadsheetApp.getUi().alert(
        'Sync Failed (HTTP ' + code + ')',
        text || 'Please check that the backend URL and secret key are configured correctly.',
        SpreadsheetApp.getUi().ButtonSet.OK
      )
    }
  } catch (err) {
    SpreadsheetApp.getUi().alert(
      'Connection Error',
      'Could not connect to backend endpoint:\n' + endpoint + '\n\n' + err.toString(),
      SpreadsheetApp.getUi().ButtonSet.OK
    )
  }
}

/**
 * 🚀 Sync All 3 Tabs to Website
 */
function syncAllTabs() {
  const facRows = readSheetToObjects(getSetting('TAB_FACULTY_INTERNS'))
  const ugRows = readSheetToObjects(getSetting('TAB_UG_PROJECTS'))
  const fundedRows = readSheetToObjects(getSetting('TAB_FUNDED_PROJECTS'))

  if (!facRows && !ugRows && !fundedRows) {
    SpreadsheetApp.getUi().alert(
      'Tabs Not Found',
      'Could not find the expected sheets:\n- ' +
        getSetting('TAB_FACULTY_INTERNS') +
        '\n- ' +
        getSetting('TAB_UG_PROJECTS') +
        '\n- ' +
        getSetting('TAB_FUNDED_PROJECTS') +
        '\n\nPlease verify that your bottom sheet tab names match.',
      SpreadsheetApp.getUi().ButtonSet.OK
    )
    return
  }

  sendSyncPayload({
    facultyAndInterns: facRows || [],
    undergraduateProjects: ugRows || [],
    fundedProjects: fundedRows || [],
  })
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
  sendSyncPayload({ facultyAndInterns: rows })
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
  sendSyncPayload({ undergraduateProjects: rows })
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
  sendSyncPayload({ fundedProjects: rows })
}

/**
 * Modal to configure custom Backend URL or Secret without touching the code.
 */
function configureSettings() {
  const ui = SpreadsheetApp.getUi()
  const props = PropertiesService.getScriptProperties()

  const currentUrl = getSetting('BACKEND_URL')
  const urlPrompt = ui.prompt(
    'Configure Website URL',
    'Enter your live website URL:\nCurrent: ' + currentUrl,
    ui.ButtonSet.OK_CANCEL
  )
  if (urlPrompt.getSelectedButton() === ui.Button.OK) {
    const val = urlPrompt.getResponseText().trim()
    if (val) props.setProperty('BACKEND_URL', val)
  }

  const currentSecret = getSetting('SYNC_SECRET')
  const secretPrompt = ui.prompt(
    'Configure Sync Secret',
    'Enter secret key:\nCurrent: ' + currentSecret,
    ui.ButtonSet.OK_CANCEL
  )
  if (secretPrompt.getSelectedButton() === ui.Button.OK) {
    const val = secretPrompt.getResponseText().trim()
    if (val) props.setProperty('SYNC_SECRET', val)
  }

  ui.alert('Settings Saved', 'Backend URL and Secret have been updated.', ui.ButtonSet.OK)
}
