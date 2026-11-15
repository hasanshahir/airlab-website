import sharp from 'sharp'
import mongoose from 'mongoose'

const uri = 'mongodb+srv://hkh034553_db_user:qEK9FSUGeyRSOTwN@cluster0.xbk6omj.mongodb.net/airlab?retryWrites=true&w=majority'

async function compressBase64(dataUri, maxDim = 800, quality = 75) {
  if (!dataUri || !dataUri.startsWith('data:image')) return dataUri
  try {
    const base64Data = dataUri.replace(/^data:image\/\w+;base64,/, '')
    const buffer = Buffer.from(base64Data, 'base64')
    const compressed = await sharp(buffer)
      .resize({ width: maxDim, height: maxDim, fit: 'inside', withoutEnlargement: true })
      .webp({ quality })
      .toBuffer()
    const newUri = 'data:image/webp;base64,' + compressed.toString('base64')
    return newUri.length < dataUri.length ? newUri : dataUri
  } catch (err) {
    console.warn('Could not compress image:', err.message)
    return dataUri
  }
}

async function run() {
  console.log('Connecting to MongoDB Atlas...')
  await mongoose.connect(uri)
  console.log('Connected.')

  // 1. Projects
  const projs = await mongoose.connection.db.collection('projects').find({}).toArray()
  let origProjSize = JSON.stringify(projs).length
  console.log(`Original projects JSON size: ${Math.round(origProjSize / 1024)} KB across ${projs.length} items`)

  for (const p of projs) {
    let changed = false
    const updates = {}
    if (p.coverImage && p.coverImage.startsWith('data:image')) {
      const compressed = await compressBase64(p.coverImage, 800, 72)
      if (compressed !== p.coverImage) {
        updates.coverImage = compressed
        changed = true
      }
    }
    if (Array.isArray(p.images)) {
      const newImages = []
      for (const img of p.images) {
        if (typeof img === 'string' && img.startsWith('data:image')) {
          const comp = await compressBase64(img, 800, 72)
          newImages.push(comp)
          if (comp !== img) changed = true
        } else {
          newImages.push(img)
        }
      }
      if (changed) updates.images = newImages
    }

    if (changed) {
      await mongoose.connection.db.collection('projects').updateOne({ _id: p._id }, { $set: updates })
    }
  }

  const updatedProjs = await mongoose.connection.db.collection('projects').find({}).toArray()
  let newProjSize = JSON.stringify(updatedProjs).length
  console.log(`New projects JSON size: ${Math.round(newProjSize / 1024)} KB (${Math.round((1 - newProjSize / origProjSize) * 100)}% reduction!)`)

  // 2. Blogs
  const blogs = await mongoose.connection.db.collection('blogs').find({}).toArray()
  let origBlogSize = JSON.stringify(blogs).length
  console.log(`Original blogs JSON size: ${Math.round(origBlogSize / 1024)} KB across ${blogs.length} items`)

  for (const b of blogs) {
    let changed = false
    const updates = {}
    if (b.image && b.image.startsWith('data:image')) {
      const comp = await compressBase64(b.image, 800, 72)
      if (comp !== b.image) {
        updates.image = comp
        changed = true
      }
    }
    if (b.coverImage && b.coverImage.startsWith('data:image')) {
      const comp = await compressBase64(b.coverImage, 800, 72)
      if (comp !== b.coverImage) {
        updates.coverImage = comp
        changed = true
      }
    }
    if (changed) {
      await mongoose.connection.db.collection('blogs').updateOne({ _id: b._id }, { $set: updates })
    }
  }

  const updatedBlogs = await mongoose.connection.db.collection('blogs').find({}).toArray()
  let newBlogSize = JSON.stringify(updatedBlogs).length
  console.log(`New blogs JSON size: ${Math.round(newBlogSize / 1024)} KB (${Math.round((1 - newBlogSize / origBlogSize) * 100)}% reduction!)`)

  process.exit(0)
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
