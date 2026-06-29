import { Router } from 'express'
import {
  createFeePlan,
  getFeePlans,
  assignFee,
  assignFeeBatch,
  recordPayment,
  getFees,
  getFeeById,
  getPendingFees,
} from '../controllers/feeController.js'
import { protect } from '../middleware/auth.js'

const router = Router()

router.use(protect)

router.get('/plans', getFeePlans)
router.post('/plans', createFeePlan)
router.post('/assign', assignFee)
router.post('/assign-batch', assignFeeBatch)
router.post('/pay/:feeId', recordPayment)
router.get('/', getFees)
router.get('/pending', getPendingFees)
router.get('/:id', getFeeById)

export default router
