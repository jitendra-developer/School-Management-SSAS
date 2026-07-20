import { Router } from 'express'
import {
  createEntry,
  getAllEntries,
  getEntryById,
  updateEntry,
  deleteEntry,
} from '../controllers/timetableController.js'
import { protect } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { createTimetableEntrySchema, updateTimetableEntrySchema } from '../validations/timetableValidation.js'

const router = Router()

router.use(protect)

router.route('/').post(validate(createTimetableEntrySchema), createEntry).get(getAllEntries)
router.route('/:id').get(getEntryById).put(validate(updateTimetableEntrySchema), updateEntry).delete(deleteEntry)

export default router
