import { Router } from 'express'
import {
  createNotice,
  getAllNotices,
  getNoticeById,
  updateNotice,
  deleteNotice,
} from '../controllers/noticeController.js'
import { protect } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { createNoticeSchema, updateNoticeSchema } from '../validations/noticeValidation.js'

const router = Router()

router.use(protect)

router.route('/').post(validate(createNoticeSchema), createNotice).get(getAllNotices)
router.route('/:id').get(getNoticeById).put(validate(updateNoticeSchema), updateNotice).delete(deleteNotice)

export default router
