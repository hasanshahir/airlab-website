import mongoose, { Schema } from 'mongoose'

/**
 * Generic key/value store for site-wide settings that are edited from
 * Google Sheets (e.g. the vacancy modal copy) or captured during sync
 * (e.g. the Apps Script webhook URL used for live application sync).
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

