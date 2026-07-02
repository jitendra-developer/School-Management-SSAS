import { Router } from 'express'
import {
  createEntry,
  getAllEntries,
  getEntryById,
  updateEntry,
  deleteEntry,
} from '../controllers/timetableController.js'
import { protect } from '../middleware/auth.js'

const router = Router()

router.use(protect)

router.route('/').post(createEntry).get(getAllEntries)
router.route('/:id').get(getEntryById).put(updateEntry).delete(deleteEntry)

export default router
