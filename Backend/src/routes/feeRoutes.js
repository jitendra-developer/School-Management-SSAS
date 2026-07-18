import { Router } from 'express'
import {
  createFeePlan,
  getFeePlans,
  updateFeePlan,
  deleteFeePlan,
  assignFee,
  assignFeeBatch,
  recordPayment,
  getFees,
  getFeeById,
  getPendingFees,
  getFeePayments,
  updateFee,
} from '../controllers/feeController.js'
import { protect } from '../middleware/auth.js'

const router = Router()

router.use(protect)

router.get('/plans', getFeePlans)
router.post('/plans', createFeePlan)
router.put('/plans/:id', updateFeePlan)
router.delete('/plans/:id', deleteFeePlan)
router.post('/assign', assignFee)
router.post('/assign-batch', assignFeeBatch)
router.post('/pay/:feeId', recordPayment)
router.get('/', getFees)
router.get('/pending', getPendingFees)
router.get('/:feeId/payments', getFeePayments)
router.get('/:id', getFeeById)
router.put('/:id', updateFee)

export default router
