/**
 * Imports the existing website content from ../src/data/*.json into MongoDB.
 *
 *   npm run seed            → insert collections that are currently EMPTY (safe, default)
 *   npm run seed -- --force → wipe and re-import every collection (destroys admin edits!)
 *   npm run seed -- team    → limit to specific collection slugs
 */
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { collections } from '../content/registry.js'
import { contentModels } from '../models/content.js'
import { connectDB, disconnectDB } from '../db.js'

const here = path.dirname(fileURLToPath(import.meta.url))
// server/src/scripts → repo-root/src/data
const DATA_DIR = path.resolve(here, '../../../src/data')

const args = process.argv.slice(2)
const force = args.includes('--force')
const only = args.filter((a) => !a.startsWith('--'))

async function main() {
  await connectDB()
  let total = 0

  for (const def of collections) {
    if (only.length && !only.includes(def.slug)) continue
    const model = contentModels.get(def.slug)!
    const file = path.join(DATA_DIR, def.seedFile)

    const existing = await model.estimatedDocumentCount()
    if (existing > 0 && !force) {
      console.log(`⏭️  ${def.slug.padEnd(18)} skipped (${existing} docs already present – use --force to overwrite)`)
      continue
    }

    const raw = JSON.parse(await readFile(file, 'utf8')) as Record<string, unknown>[]
    if (!Array.isArray(raw)) throw new Error(`${def.seedFile} is not a JSON array`)

    // Preserve the original array order (the site currently relies on it) unless an explicit order exists.
    const docs = raw.map((item, index) => ({
      ...item,
      order: typeof item.order === 'number' ? item.order : index,
      published: true,
    }))

    if (force) await model.deleteMany({})
    await model.insertMany(docs, { ordered: true })
    total += docs.length
    console.log(`✅ ${def.slug.padEnd(18)} ${docs.length} docs imported from ${def.seedFile}`)
  }

  console.log(`\n🌱 Seed complete – ${total} documents inserted.`)
}

main()
  .catch((err) => {
    console.error('❌ Seed failed:', err)
    process.exitCode = 1
  })
  .finally(() => disconnectDB())
