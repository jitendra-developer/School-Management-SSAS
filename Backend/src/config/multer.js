import multer from 'multer'

/**
 * Multer memory storage — ready for Cloudinary upload pipelines.
 * Use in future modules (student photos, documents, etc.)
 */

const spreadsheetMimes = [
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    const allowed = [
      'image/jpeg', 'image/png', 'image/webp', 'application/pdf',
      ...spreadsheetMimes,
    ]
    if (allowed.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type'), false)
    }
  },
})

export const uploadSpreadsheet = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (spreadsheetMimes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Only CSV and Excel files are allowed'), false)
    }
  },
})
