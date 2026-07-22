<<<<<<< Updated upstream
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
import { validate } from '../middleware/validate.js'
import {
  createFeePlanSchema,
  updateFeePlanSchema,
  assignFeeSchema,
  assignFeeBatchSchema,
  recordPaymentSchema,
  updateFeeSchema,
} from '../validations/feeValidation.js'

const router = Router()

router.use(protect)

router.get('/plans', getFeePlans)
router.post('/plans', validate(createFeePlanSchema), createFeePlan)
router.put('/plans/:id', validate(updateFeePlanSchema), updateFeePlan)
router.delete('/plans/:id', deleteFeePlan)
router.post('/assign', validate(assignFeeSchema), assignFee)
router.post('/assign-batch', validate(assignFeeBatchSchema), assignFeeBatch)
router.post('/pay/:feeId', validate(recordPaymentSchema), recordPayment)
router.get('/', getFees)
router.get('/pending', getPendingFees)
router.get('/:feeId/payments', getFeePayments)
router.get('/:id', getFeeById)
router.put('/:id', validate(updateFeeSchema), updateFee)

export default router
=======
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
import { validate } from '../middleware/validate.js'
import {
  createFeePlanSchema,
  updateFeePlanSchema,
  assignFeeSchema,
  assignFeeBatchSchema,
  recordPaymentSchema,
  updateFeeSchema,
} from '../validations/feeValidation.js'

const router = Router()

router.use(protect)

router.get('/plans', getFeePlans)
router.post('/plans', validate(createFeePlanSchema), createFeePlan)
router.put('/plans/:id', validate(updateFeePlanSchema), updateFeePlan)
router.delete('/plans/:id', deleteFeePlan)
router.post('/assign', validate(assignFeeSchema), assignFee)
router.post('/assign-batch', validate(assignFeeBatchSchema), assignFeeBatch)
router.post('/pay/:feeId', validate(recordPaymentSchema), recordPayment)
router.get('/', getFees)
router.get('/pending', getPendingFees)
router.get('/:feeId/payments', getFeePayments)
router.get('/:id', getFeeById)
router.put('/:id', validate(updateFeeSchema), updateFee)

export default router
>>>>>>> Stashed changes
