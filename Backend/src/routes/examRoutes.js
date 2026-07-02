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

const router = Router()

router.use(protect)

router.route('/').post(createExam).get(getAllExams)
router.route('/:id').get(getExamById).put(updateExam).delete(deleteExam)
router.route('/:id/results').post(recordResult).get(getResults)

export default router
