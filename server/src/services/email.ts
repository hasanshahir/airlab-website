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

  // Also send candidate confirmation receipt directly to the applicant's email address
  if (data.applicantEmail && data.applicantEmail.includes('@')) {
    try {
      const applicantSubject = `Application Received: AIR Lab Fellowship & Research Vacancy`
      const applicantHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
          <div style="margin-bottom: 20px; border-bottom: 2px solid #ff5500; padding-bottom: 12px;">
            <h2 style="color: #0b0c0e; margin: 0; font-size: 20px; letter-spacing: -0.02em;">AIR LAB — NED UNIVERSITY</h2>
            <p style="color: #555760; font-size: 13px; margin: 4px 0 0 0;">Department of Computer Science &amp; IT</p>
          </div>
          <p style="color: #0b0c0e; font-size: 15px; line-height: 1.6;">Dear <strong>${data.applicantName}</strong>,</p>
          <p style="color: #334155; font-size: 14px; line-height: 1.6;">
            Thank you for applying to the <strong>Artificial Intelligence Research Lab (AIR Lab)</strong> at NED University. We have successfully received your application for the <strong>${data.positionTitle || 'Research Vacancy'}</strong>.
          </p>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin: 20px 0;">
            <h4 style="margin: 0 0 10px 0; color: #0b0c0e; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">Application Summary</h4>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <tr>
                <td style="padding: 4px 0; color: #64748b; width: 130px;">Applicant:</td>
                <td style="padding: 4px 0; color: #0b0c0e; font-weight: 600;">${data.applicantName}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #64748b;">University / Dept:</td>
                <td style="padding: 4px 0; color: #0b0c0e;">${data.university} (${data.degreeYear})</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #64748b;">Contact Email:</td>
                <td style="padding: 4px 0; color: #0b0c0e;">${data.applicantEmail}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #64748b;">Phone / WhatsApp:</td>
                <td style="padding: 4px 0; color: #0b0c0e;">${data.applicantPhone}</td>
              </tr>
            </table>
          </div>
          <p style="color: #334155; font-size: 14px; line-height: 1.6;">
            Our faculty review committee, led by Dr. Murk Marvi, reviews candidate applications on a rolling basis. Shortlisted candidates will be contacted directly for track interviews and technical testbed orientations.
          </p>
          <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 12px; line-height: 1.5;">
            <p style="margin: 0;"><strong>Artificial Intelligence Research Lab (AIR Lab)</strong><br />Department of CSIT, NED University of Engineering &amp; Technology<br />University Road, Karachi 75270, Pakistan</p>
          </div>
        </div>
      `

      await mailer.sendMail({
        from: `"AIR Lab Admissions" <${env.SMTP_USER || process.env.SMTP_USER}>`,
        to: data.applicantEmail,
        subject: applicantSubject,
        html: applicantHtml,
      })
      console.log(`📧 Candidate confirmation email sent to applicant: ${data.applicantEmail}`)
    } catch (candErr) {
      console.warn('⚠️ Could not send candidate confirmation email:', candErr)
    }
  }

  return { sent: true, messageId: info.messageId }
}
