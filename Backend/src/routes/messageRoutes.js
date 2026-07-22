<<<<<<< Updated upstream
import { Router } from 'express'
import {
  getMessages,
  getMessageById,
  sendMessage,
  markRead,
  deleteMessage,
} from '../controllers/messageController.js'
import { protect } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { sendMessageSchema } from '../validations/messageValidation.js'

const router = Router()

router.use(protect)

router.get('/', getMessages)
router.get('/:id', getMessageById)
router.post('/send', validate(sendMessageSchema), sendMessage)
router.put('/:id/read', markRead)
router.delete('/:id', deleteMessage)

export default router
=======
import { Router } from 'express'
import {
  getMessages,
  getMessageById,
  sendMessage,
  markRead,
  deleteMessage,
} from '../controllers/messageController.js'
import { protect } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { sendMessageSchema } from '../validations/messageValidation.js'

const router = Router()

router.use(protect)

router.get('/', getMessages)
router.get('/:id', getMessageById)
router.post('/send', validate(sendMessageSchema), sendMessage)
router.put('/:id/read', markRead)
router.delete('/:id', deleteMessage)

export default router
>>>>>>> Stashed changes
