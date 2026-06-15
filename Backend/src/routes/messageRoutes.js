import { Router } from 'express'
import {
  getMessages,
  getMessageById,
  sendMessage,
  markRead,
} from '../controllers/messageController.js'
import { protect } from '../middleware/auth.js'

const router = Router()

router.use(protect)

router.get('/', getMessages)
router.get('/:id', getMessageById)
router.post('/send', sendMessage)
router.put('/:id/read', markRead)

export default router
