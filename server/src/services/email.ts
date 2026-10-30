import nodemailer, { type Transporter } from 'nodemailer'
import { env } from '../config/env.js'

let transporter: Transporter | null = null

function getTransporter(): Transporter | null {
  if (transporter) return transporter

  const user = env.SMTP_USER || process.env.SMTP_USER
  const pass = env.SMTP_PASS || process.env.SMTP_PASS

  if (!user || !pass) {
    return null
  }

  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST || process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(env.SMTP_PORT || process.env.SMTP_PORT || 465),
    secure: Number(env.SMTP_PORT || process.env.SMTP_PORT || 465) === 465,
    auth: {
      user,
      pass,
    },
  })

  return transporter
}

export interface ApplicationEmailPayload {
  applicantName: string
  applicantEmail: string
  applicantPhone: string
  university: string
  degreeYear: string
  positionTitle?: string
  coverNote?: string
  github?: string
  linkedin?: string
  cvFile?: {
    originalName: string
    buffer: Buffer
    contentType?: string
  }
}

export async function sendApplicationNotification(data: ApplicationEmailPayload) {
  const mailer = getTransporter()
  const recipient = env.ADMIN_NOTIFICATION_EMAIL || process.env.ADMIN_NOTIFICATION_EMAIL || 'hf.alihasan0@gmail.com'

  if (!mailer) {
    console.warn('⚠️ SMTP_USER / SMTP_PASS not set. Skipping email dispatch, application saved to database.')
    return { sent: false, reason: 'smtp_not_configured' }
  }

  const subject = `[AIR Lab] New Internship Application: ${data.applicantName} (${data.positionTitle || 'General'})`

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
      <div style="margin-bottom: 20px; border-bottom: 2px solid #3b82f6; padding-bottom: 12px;">
        <h2 style="color: #0f172a; margin: 0; font-size: 20px;">AIR Lab – New Candidate Application</h2>
        <p style="color: #64748b; font-size: 14px; margin: 4px 0 0 0;">Received on ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Karachi' })} (PKT)</p>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
        <tr>
          <td style="padding: 8px 0; color: #64748b; width: 140px; font-weight: 600;">Position:</td>
          <td style="padding: 8px 0; color: #0f172a; font-weight: 700;">${data.positionTitle || 'Internship Position'}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Full Name:</td>
          <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${data.applicantName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Email:</td>
          <td style="padding: 8px 0;"><a href="mailto:${data.applicantEmail}" style="color: #2563eb; text-decoration: none;">${data.applicantEmail}</a></td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Phone:</td>
          <td style="padding: 8px 0; color: #0f172a;">${data.applicantPhone}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b; font-weight: 600;">University:</td>
          <td style="padding: 8px 0; color: #0f172a;">${data.university}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Year / Degree:</td>
          <td style="padding: 8px 0; color: #0f172a;">${data.degreeYear}</td>
        </tr>
        ${data.github ? `
        <tr>
          <td style="padding: 8px 0; color: #64748b; font-weight: 600;">GitHub:</td>
          <td style="padding: 8px 0;"><a href="${data.github}" style="color: #2563eb;">${data.github}</a></td>
        </tr>` : ''}
        ${data.linkedin ? `
        <tr>
          <td style="padding: 8px 0; color: #64748b; font-weight: 600;">LinkedIn:</td>
          <td style="padding: 8px 0;"><a href="${data.linkedin}" style="color: #2563eb;">${data.linkedin}</a></td>
        </tr>` : ''}
      </table>

      ${data.coverNote ? `
      <div style="background: #f8fafc; border-radius: 8px; padding: 14px; margin-bottom: 20px;">
        <h4 style="margin: 0 0 8px 0; color: #334155; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">Cover Note / Statement:</h4>
        <p style="margin: 0; color: #475569; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${data.coverNote}</p>
      </div>` : ''}

      <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 16px; font-size: 13px; color: #64748b;">
        <p style="margin: 0 0 8px 0;">📎 <strong>Resume/CV:</strong> ${data.cvFile ? `Attached (${data.cvFile.originalName})` : 'None uploaded'}</p>
        <p style="margin: 0;">View, shortlist, or manage this application in the <a href="https://airlab-website.vercel.app/admin" style="color: #2563eb; font-weight: 600;">AIR Lab Admin Portal</a>.</p>
      </div>
    </div>
  `

  const attachments = data.cvFile
    ? [
        {
          filename: data.cvFile.originalName,
          content: data.cvFile.buffer,
          contentType: data.cvFile.contentType || 'application/pdf',
        },
      ]
    : []

  const info = await mailer.sendMail({
    from: `"AIR Lab Admissions" <${env.SMTP_USER || process.env.SMTP_USER}>`,
    to: recipient,
    replyTo: data.applicantEmail,
    subject,
    html,
    attachments,
  })

  console.log(`📧 Notification email sent to ${recipient}: ${info.messageId}`)
  return { sent: true, messageId: info.messageId }
}
