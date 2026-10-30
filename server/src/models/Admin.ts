import mongoose, { Schema, type InferSchemaType } from 'mongoose'

/** An admin-panel user. All admins have full access (no roles, by design). */
const AdminSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    /** bcrypt hash – never the plain password. Excluded from queries by default. */
    passwordHash: { type: String, required: true, select: false },
    lastLoginAt: { type: Date },
  },
  { timestamps: true, versionKey: false },
)

export type Admin = InferSchemaType<typeof AdminSchema>
export const AdminModel: mongoose.Model<any> = mongoose.models.Admin || mongoose.model('Admin', AdminSchema)
