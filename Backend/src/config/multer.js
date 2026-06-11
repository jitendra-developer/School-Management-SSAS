import multer from 'multer'

/**
 * Multer memory storage — ready for Cloudinary upload pipelines.
 * Use in future modules (student photos, documents, etc.)
 */
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    if (allowed.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type'), false)
    }
  },
})
