/**
 * ============================================================================
 * AIR Lab (Artificial Intelligence Research Lab) — Google Sheets Sync Extension
 * ============================================================================
 *
 * This script connects your Google Spreadsheet directly to the AIR Lab website backend.
 * Operators can edit team members, research interns, publications, and projects
 * here in Google Sheets and click "⚡ AIR Lab -> Sync All to Website".
 *
 * Setup:
 * 1. Open Extensions -> Apps Script in your Google Spreadsheet.
 * 2. Delete any code in Code.gs and paste this entire file.
 * 3. Update BACKEND_URL below to your live website URL (e.g. https://airlab-website.vercel.app).
 * 4. Save and reload the Google Spreadsheet.
 * ============================================================================
 */

// Default configuration (can also be overridden in Script Properties)
const DEFAULT_CONFIG = {
  BACKEND_URL: 'https://airlab-website.vercel.app', // Or http://localhost:5000 during local dev via ngrok
  SYNC_SECRET: 'airlab-sheets-sync-secret-2026',
  PEOPLE_SHEET_NAME: 'People',
  WORKS_SHEET_NAME: 'Research & Works',
}

/**
 * Gets configured property or fallback.
 */
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
    .addItem('🚀 Sync All to Website', 'syncAll')
    .addSeparator()
    .addItem('👥 Sync People Only', 'syncPeopleOnly')
    .addItem('📚 Sync Research & Works Only', 'syncWorksOnly')
    .addSeparator()
    .addItem('🆔 Auto-Generate Missing IDs', 'generateMissingIds')
    .addItem('⚙️ Configure URL & Secret', 'configureSettings')
    .addToUi()
}

/**
 * Reads any sheet into an array of clean JSON objects mapped by column headers.
 */
function readSheetToObjects(sheet) {
  if (!sheet) return []
  const data = sheet.getDataRange().getValues()
  if (data.length < 2) return []

  const rawHeaders = data[0]
  const headers = rawHeaders.map(h => String(h).trim())
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
 * Automatically inspects empty ID cells and generates unique IDs.
 */
function generateMissingIds() {
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  const peopleSheet = ss.getSheetByName(getSetting('PEOPLE_SHEET_NAME'))
  const worksSheet = ss.getSheetByName(getSetting('WORKS_SHEET_NAME'))
  let generatedCount = 0

  // 1. Check People sheet
  if (peopleSheet) {
    const data = peopleSheet.getDataRange().getValues()
    if (data.length > 1) {
      const headers = data[0].map(h => String(h).trim())
      const idColIdx = headers.indexOf('id')
      const nameColIdx = headers.indexOf('name')

      if (idColIdx !== -1 && nameColIdx !== -1) {
        for (let r = 1; r < data.length; r++) {
          const currentId = String(data[r][idColIdx] || '').trim()
          const name = String(data[r][nameColIdx] || '').trim()
          if (!currentId && name) {
            const newId = 'P-' + Math.floor(1000 + Math.random() * 9000)
            peopleSheet.getRange(r + 1, idColIdx + 1).setValue(newId)
            generatedCount++
          }
        }
      }
    }
  }

  // 2. Check Works sheet
  if (worksSheet) {
    const data = worksSheet.getDataRange().getValues()
    if (data.length > 1) {
      const headers = data[0].map(h => String(h).trim())
      const idColIdx = headers.indexOf('id')
      const titleColIdx = headers.indexOf('title')
      const typeColIdx = headers.indexOf('entityType')

      if (idColIdx !== -1 && titleColIdx !== -1) {
        for (let r = 1; r < data.length; r++) {
          const currentId = String(data[r][idColIdx] || '').trim()
          const title = String(data[r][titleColIdx] || '').trim()
          const type = typeColIdx !== -1 ? String(data[r][typeColIdx] || '').toLowerCase() : ''

          if (!currentId && title) {
            let prefix = 'W-'
            if (type.includes('pub')) prefix = 'PUB-'
            else if (type.includes('proj')) prefix = 'PRJ-'
            else if (type.includes('grant')) prefix = 'GRT-'

            const newId = prefix + Math.floor(1000 + Math.random() * 9000)
            worksSheet.getRange(r + 1, idColIdx + 1).setValue(newId)
            generatedCount++
          }
        }
      }
    }
  }

  SpreadsheetApp.getActiveSpreadsheet().toast(
    generatedCount > 0 ? `Generated ${generatedCount} missing unique IDs!` : 'All rows already have unique IDs.',
    'Unique IDs',
    4
  )
}

/**
 * Performs HTTP POST to backend /api/sync/sheets
 */
function sendSyncRequest(payload) {
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
    SpreadsheetApp.getActiveSpreadsheet().toast('Syncing with AIR Lab backend...', 'AIR Lab Sync', 10)
    const res = UrlFetchApp.fetch(endpoint, options)
    const code = res.getResponseCode()
    const text = res.getContentText()

    if (code >= 200 && code < 300) {
      const result = JSON.parse(text)
      const pStats = result.stats?.people
      const wStats = result.stats?.works

      let summary = '✅ Website Synced Successfully!\n\n'
      if (pStats) {
        summary += `👥 People: ${pStats.updated} updated, ${pStats.created} created (${pStats.processed} total)\n`
        if (pStats.errors && pStats.errors.length) {
          summary += `   ⚠️ Skipped ${pStats.errors.length} invalid rows\n`
        }
      }
      if (wStats) {
        summary += `📚 Works: ${wStats.updated} updated, ${wStats.created} created (${wStats.processed} total)\n`
        if (wStats.errors && wStats.errors.length) {
          summary += `   ⚠️ Skipped ${wStats.errors.length} invalid rows\n`
        }
      }

      SpreadsheetApp.getUi().alert('Sync Complete', summary, SpreadsheetApp.getUi().ButtonSet.OK)
    } else {
      SpreadsheetApp.getUi().alert(
        'Sync Failed (HTTP ' + code + ')',
        text || 'Check backend logs and verify that your URL and Secret are correct.',
        SpreadsheetApp.getUi().ButtonSet.OK
      )
    }
  } catch (err) {
    SpreadsheetApp.getUi().alert(
      'Connection Error',
      'Could not reach ' + endpoint + ':\n' + err.toString(),
      SpreadsheetApp.getUi().ButtonSet.OK
    )
  }
}

/**
 * Sync both People and Research & Works sheets.
 */
function syncAll() {
  generateMissingIds()
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  const peopleSheet = ss.getSheetByName(getSetting('PEOPLE_SHEET_NAME'))
  const worksSheet = ss.getSheetByName(getSetting('WORKS_SHEET_NAME'))

  if (!peopleSheet && !worksSheet) {
    SpreadsheetApp.getUi().alert(
      'Sheets Missing',
      'Could not find sheets named "' + getSetting('PEOPLE_SHEET_NAME') + '" or "' + getSetting('WORKS_SHEET_NAME') + '".',
      SpreadsheetApp.getUi().ButtonSet.OK
    )
    return
  }

  const peopleRows = readSheetToObjects(peopleSheet)
  const worksRows = readSheetToObjects(worksSheet)

  sendSyncRequest({
    people: peopleRows,
    works: worksRows,
  })
}

/**
 * Sync People only.
 */
function syncPeopleOnly() {
  generateMissingIds()
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  const peopleSheet = ss.getSheetByName(getSetting('PEOPLE_SHEET_NAME'))
  if (!peopleSheet) {
    SpreadsheetApp.getUi().alert('Missing Sheet: ' + getSetting('PEOPLE_SHEET_NAME'))
    return
  }
  const peopleRows = readSheetToObjects(peopleSheet)
  sendSyncRequest({ people: peopleRows })
}

/**
 * Sync Works only.
 */
function syncWorksOnly() {
  generateMissingIds()
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  const worksSheet = ss.getSheetByName(getSetting('WORKS_SHEET_NAME'))
  if (!worksSheet) {
    SpreadsheetApp.getUi().alert('Missing Sheet: ' + getSetting('WORKS_SHEET_NAME'))
    return
  }
  const worksRows = readSheetToObjects(worksSheet)
  sendSyncRequest({ works: worksRows })
}

/**
 * Modal to configure custom Backend URL or Secret without touching the code.
 */
function configureSettings() {
  const ui = SpreadsheetApp.getUi()
  const props = PropertiesService.getScriptProperties()

  const currentUrl = getSetting('BACKEND_URL')
  const urlPrompt = ui.prompt('Configure Backend URL', 'Enter website URL:\nCurrent: ' + currentUrl, ui.ButtonSet.OK_CANCEL)
  if (urlPrompt.getSelectedButton() === ui.Button.OK) {
    const val = urlPrompt.getResponseText().trim()
    if (val) props.setProperty('BACKEND_URL', val)
  }

  const currentSecret = getSetting('SYNC_SECRET')
  const secretPrompt = ui.prompt('Configure Sync Secret', 'Enter secret key:\nCurrent: ' + currentSecret, ui.ButtonSet.OK_CANCEL)
  if (secretPrompt.getSelectedButton() === ui.Button.OK) {
    const val = secretPrompt.getResponseText().trim()
    if (val) props.setProperty('SYNC_SECRET', val)
  }

  ui.alert('Settings Saved', 'Backend URL and Secret have been updated.', ui.ButtonSet.OK)
}

