import { Router } from 'express'
import {
  createNotice,
  getAllNotices,
  getNoticeById,
  updateNotice,
  deleteNotice,
} from '../controllers/noticeController.js'
import { protect } from '../middleware/auth.js'

const router = Router()

router.use(protect)

router.route('/').post(createNotice).get(getAllNotices)
router.route('/:id').get(getNoticeById).put(updateNotice).delete(deleteNotice)

export default router
