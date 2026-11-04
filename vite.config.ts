import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'node:fs'
import path from 'node:path'

function syncCarouselImagesPlugin() {
  return {
    name: 'sync-carousel-images',
    buildStart() {
      const srcDir = path.resolve(import.meta.dirname, 'carousel images')
      const destDir = path.resolve(import.meta.dirname, 'public/carousel-images')
      if (fs.existsSync(srcDir)) {
        if (!fs.existsSync(destDir)) {
          fs.mkdirSync(destDir, { recursive: true })
        }
        const files = fs.readdirSync(srcDir)
        for (const file of files) {
          const srcFile = path.join(srcDir, file)
          const destFile = path.join(destDir, file)
          if (fs.statSync(srcFile).isFile()) {
            fs.copyFileSync(srcFile, destFile)
          }
        }
      }
    },
  }
}

export default defineConfig({
  base: '/',
  plugins: [syncCarouselImagesPlugin(), tailwindcss(), react()],
  server: {
    // Forward API + uploaded files to the Express server during development.
    proxy: {
      '/api': 'http://localhost:5000',
      '/uploads': 'http://localhost:5000',
    },
  },
})
