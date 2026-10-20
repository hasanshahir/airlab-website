import mongoose, { Schema, type InferSchemaType } from 'mongoose'

export const APPLICATION_STATUSES = ['New', 'Shortlisted', 'Rejected', 'Accepted'] as const

/** An intern application submitted through the website form. */
const ApplicationSchema = new Schema(
  {
    position: { type: Schema.Types.ObjectId, ref: 'Position', required: false, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    university: { type: String, required: true, trim: true },
    degreeYear: { type: String, required: true, trim: true },
    coverNote: { type: String, trim: true, maxlength: 3000 },
    github: { type: String, trim: true },
    linkedin: { type: String, trim: true },
    /** Storage key/path of the uploaded CV (PDF). Never exposed publicly. */
    cv: {
      key: { type: String, required: true },
      originalName: { type: String },
      size: { type: Number },
    },
    status: { type: String, enum: APPLICATION_STATUSES, default: 'New', index: true },
    adminNotes: { type: String, trim: true },
    emailSent: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false },
)

export type Application = InferSchemaType<typeof ApplicationSchema>
export const ApplicationModel: mongoose.Model<any> = mongoose.models.Application || mongoose.model('Application', ApplicationSchema)
