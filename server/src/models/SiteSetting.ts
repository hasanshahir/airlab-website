import mongoose, { Schema } from 'mongoose'

/**
 * Generic key/value store for site-wide settings managed strictly via the Admin Panel
 * (e.g. vacancy modal status and top announcement ribbon copy).
 */
const SiteSettingSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, index: true, trim: true },
    value: { type: Schema.Types.Mixed },
  },
  { timestamps: true, versionKey: false },
)

export const SiteSettingModel: mongoose.Model<any> =
  mongoose.models.SiteSetting || mongoose.model('SiteSetting', SiteSettingSchema)

