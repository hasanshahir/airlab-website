import { Router } from 'express'
import multer from 'multer'
import mongoose from 'mongoose'
import { ApplicationModel } from '../models/Application.js'
import { PositionModel } from '../models/Position.js'
import { HttpError } from '../middleware/errors.js'
import { requireAdmin } from '../middleware/auth.js'
import { sendApplicationNotification } from '../services/email.js'

export const applicationsRouter = Router()

// Memory storage keeps file buffers accessible for serverless / cloud deployment
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.originalname.endsWith('.pdf')) {
      cb(null, true)
    } else {
      cb(new HttpError(400, 'Only PDF resumes/CVs are accepted'))
    }
  },
})

// Public endpoint for submitting applications
applicationsRouter.post('/', upload.single('cv'), async (req, res, next) => {
  try {
    const { positionId, name, email, phone, university, degreeYear, coverNote, github, linkedin } = req.body

    if (!name || !email || !phone || !university || !degreeYear) {
      throw new HttpError(400, 'Missing required applicant fields')
    }

    // Verify position or select default
    let assignedPosition = positionId
    try {
      if (!assignedPosition && mongoose.connection.readyState === 1) {
        const defaultPos = await PositionModel.findOne({ isOpen: true }).maxTimeMS(2000)
        if (defaultPos) assignedPosition = defaultPos._id
      }
    } catch {
      // Ignore position lookup error
    }

    // Convert file to base64 data URI storage key if uploaded
    let cvData = {
      key: req.body.resumeUrl || 'attached',
      originalName: req.file ? req.file.originalname : 'resume.pdf',
      size: req.file ? req.file.size : 0,
    }

    if (req.file) {
      const base64 = req.file.buffer.toString('base64')
      cvData.key = `data:application/pdf;base64,${base64}`
    }

    let applicationId = 'temp-' + Date.now()
    try {
      if (mongoose.connection.readyState === 1) {
        const application = await ApplicationModel.create({
          position: assignedPosition,
          name,
          email,
          phone,
          university,
          degreeYear,
          coverNote,
          github,
          linkedin,
          cv: cvData,
          status: 'New',
        })
        applicationId = application._id
      }
    } catch (dbErr) {
      console.warn('⚠️ Could not save to DB (Atlas IP whitelist / connection timeout), proceeding with email delivery:', dbErr)
    }

    console.log(`📩 Application received from ${name} (${email})`)

    // Dispatch instant notification email with attached CV
    try {
      let positionTitle: string | undefined
      if (assignedPosition) {
        const posDoc = await PositionModel.findById(assignedPosition).lean()
        if (posDoc) positionTitle = posDoc.title
      }

      await sendApplicationNotification({
        applicantName: name,
        applicantEmail: email,
        applicantPhone: phone,
        university,
        degreeYear,
        positionTitle,
        coverNote,
        github,
        linkedin,
        cvFile: req.file
          ? {
              originalName: req.file.originalname,
              buffer: req.file.buffer,
              contentType: req.file.mimetype,
            }
          : undefined,
      })
    } catch (mailErr) {
      console.error('⚠️ Failed to dispatch application notification email:', mailErr)
    }

    res.status(201).json({
      success: true,
      message: 'Application successfully received by the AIR Lab committee!',
      id: applicationId,
    })
  } catch (err) {
    next(err)
  }
})

// Protected Admin endpoints
applicationsRouter.get('/admin', requireAdmin, async (_req, res, next) => {
  try {
    const applications = await ApplicationModel.find()
      .populate('position', 'title track')
      .sort({ createdAt: -1 })
      .lean()
    res.json(applications)
  } catch (err) {
    next(err)
  }
})

applicationsRouter.patch('/admin/:id/status', requireAdmin, async (req, res, next) => {
  try {
    const { status, adminNotes } = req.body
    const app = await ApplicationModel.findByIdAndUpdate(
      req.params.id,
      { ...(status && { status }), ...(adminNotes !== undefined && { adminNotes }) },
      { new: true }
    )
    if (!app) throw new HttpError(404, 'Application not found')
    res.json(app)
  } catch (err) {
    next(err)
  }
})

applicationsRouter.delete('/admin/:id', requireAdmin, async (req, res, next) => {
  try {
    const deleted = await ApplicationModel.findByIdAndDelete(req.params.id)
    if (!deleted) throw new HttpError(404, 'Application not found')
    res.json({ success: true, message: 'Application deleted' })
  } catch (err) {
    next(err)
  }
})
