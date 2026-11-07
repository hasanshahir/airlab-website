import { env } from '../config/env.js'
import { getSheetsWebhookUrl } from './siteSettings.js'

export interface SheetApplicationRow {
  applicationId: string
  submittedAt: string
  name: string
  email: string
  phone: string
  rollNo?: string
  department?: string
  program?: string
  track?: string
  university?: string
  degreeYear?: string
  statement?: string
  portfolio?: string
  linkedin?: string
  vacancyTitle?: string
  status: string
  cv?: { fileName: string; mimeType: string; base64: string }
}

/**
 * Pushes a single application to the Google Sheets Apps Script web app (doPost),
 * which appends it to the "Student Applications" tab in real time.
 *
 * Never throws – a Sheets outage must not block the applicant's submission.
 */
export async function pushApplicationToSheets(row: SheetApplicationRow): Promise<boolean> {
  const url = await getSheetsWebhookUrl()
  if (!url) {
    console.warn('ℹ️ Sheets live sync skipped: no webhook URL configured yet (run a sync from the sheet once).')
    return false
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 12_000)
  try {
    // Apps Script responds with a 302 to script.googleusercontent.com; the row is
    // already written by then, and fetch follows the redirect to read the JSON result.
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'appendApplication', secret: env.SHEETS_SYNC_SECRET, application: row }),
      redirect: 'follow',
      signal: controller.signal,
    })
    const text = await res.text()
    if (!res.ok || /"success"\s*:\s*false/.test(text)) {
      console.error('⚠️ Sheets live sync failed:', res.status, text.slice(0, 300))
      return false
    }
    return true
  } catch (err) {
    console.error('⚠️ Sheets live sync error:', err)
    return false
  } finally {
    clearTimeout(timer)
  }
}

