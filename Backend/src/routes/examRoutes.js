import { Router } from 'express'
import {
  createExam,
  getAllExams,
  getExamById,
  updateExam,
  deleteExam,
  recordResult,
  getResults,
} from '../controllers/examController.js'
import { protect } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { createExamSchema, updateExamSchema, recordResultSchema } from '../validations/examValidation.js'

const router = Router()

router.use(protect)

router.route('/').post(validate(createExamSchema), createExam).get(getAllExams)
router.route('/:id').get(getExamById).put(validate(updateExamSchema), updateExam).delete(deleteExam)
router.route('/:id/results').post(validate(recordResultSchema), recordResult).get(getResults)

export default router
