import mongoose, { Schema, type Model, type SchemaDefinition } from 'mongoose'
import { collections, type CollectionDef, type FieldDef } from '../content/registry.js'

function toSchemaType(field: FieldDef): SchemaDefinition[string] {
  const base = { required: field.required ?? false }
  switch (field.type) {
    case 'number':
      return { ...base, type: Number }
    case 'boolean':
      return { ...base, type: Boolean, default: false }
    case 'stringList':
      return { type: [String], default: [] }
    case 'enum':
      return { ...base, type: String, enum: field.options }
    default:
      // string, text, url, image, file, date
      return { ...base, type: String, trim: true }
  }
}

function buildSchema(def: CollectionDef): Schema {
  const definition: SchemaDefinition = {
    /**
     * Public identifier the frontend already uses (e.g. "murk-marvi", 3).
     * Kept separate from Mongo's _id so existing cross-references
     * (project.memberIds, project.grantId, …) keep working.
     */
    id: { type: Schema.Types.Mixed, index: { unique: true, sparse: true } },
    /** Manual sort position set from the admin panel (lower = first). */
    order: { type: Number, default: 0, index: true },
    /** Unpublished items are hidden from the public site but kept in the DB. */
    published: { type: Boolean, default: true, index: true },
  }

  for (const [name, field] of Object.entries(def.fields)) {
    definition[name] = toSchemaType(field)
  }

  const schema = new Schema(definition, {
    collection: def.slug.replace(/-/g, '_'),
    timestamps: true,
    // Existing data contains a few ad-hoc fields (e.g. `metrics`, `placeholder`);
    // keep them instead of silently dropping them.
    strict: false,
    // We store our own `id`; disable Mongoose's virtual `id` getter that would shadow it.
    id: false,
    versionKey: false,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        ret._id = String(ret._id)
        return ret
      },
    },
  })

  // Items created in the admin panel get a stable public id automatically.
  schema.pre('validate', function () {
    if (this.get('id') === undefined || this.get('id') === null || this.get('id') === '') {
      this.set('id', String(this._id))
    }
  })

  return schema
}

/** Mongoose models keyed by collection slug. */
export const contentModels: ReadonlyMap<string, Model<Record<string, unknown>>> = new Map(
  collections.map((def) => {
    const modelName = `Content_${def.slug}`
    const model =
      (mongoose.models[modelName] as Model<Record<string, unknown>> | undefined) ??
      mongoose.model<Record<string, unknown>>(modelName, buildSchema(def))
    return [def.slug, model] as const
  }),
)
