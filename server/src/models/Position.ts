import mongoose, { Schema, type InferSchemaType } from 'mongoose'

/** A vacancy posted by an admin that interns can apply to. */
const PositionSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    track: { type: String, trim: true }, // e.g. "Foundational LLMs & Urdu NLP"
    type: { type: String, enum: ['Internship', 'Research Assistant', 'Fellowship', 'Other'], default: 'Internship' },
    description: { type: String, required: true },
    requirements: { type: [String], default: [] },
    location: { type: String, default: 'NED University, Karachi' },
    seats: { type: Number, min: 1 },
    deadline: { type: Date },
    isOpen: { type: Boolean, default: true, index: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true, versionKey: false },
)

export type Position = InferSchemaType<typeof PositionSchema>
export const PositionModel: mongoose.Model<any> = mongoose.models.Position || mongoose.model('Position', PositionSchema)
