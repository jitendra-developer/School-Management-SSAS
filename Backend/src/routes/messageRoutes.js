import { Router } from 'express'
import {
  getMessages,
  getMessageById,
  sendMessage,
  markRead,
  deleteMessage,
} from '../controllers/messageController.js'
import { protect } from '../middleware/auth.js'

const router = Router()

router.use(protect)

router.get('/', getMessages)
router.get('/:id', getMessageById)
router.post('/send', sendMessage)
router.put('/:id/read', markRead)
router.delete('/:id', deleteMessage)

export default router
