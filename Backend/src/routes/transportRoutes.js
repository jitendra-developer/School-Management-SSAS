<<<<<<< Updated upstream
import { Router } from 'express'
import {
  getRoutes,
  createRoute,
  updateRoute,
  deleteRoute,
  getAssignments,
  assignStudent,
  removeAssignment,
  updateAssignment,
} from '../controllers/transportController.js'
import { protect } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import {
  createRouteSchema,
  updateRouteSchema,
  assignStudentSchema,
  updateAssignmentSchema,
} from '../validations/transportValidation.js'

const router = Router()

router.use(protect)

router.get('/routes', getRoutes)
router.post('/routes', validate(createRouteSchema), createRoute)
router.put('/routes/:id', validate(updateRouteSchema), updateRoute)
router.delete('/routes/:id', deleteRoute)
router.get('/assignments', getAssignments)
router.post('/assign', validate(assignStudentSchema), assignStudent)
router.put('/assignments/:id', validate(updateAssignmentSchema), updateAssignment)
router.delete('/assignments/:id', removeAssignment)

export default router
=======
import { Router } from 'express'
import {
  getRoutes,
  createRoute,
  updateRoute,
  deleteRoute,
  getAssignments,
  assignStudent,
  removeAssignment,
  updateAssignment,
} from '../controllers/transportController.js'
import { protect } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import {
  createRouteSchema,
  updateRouteSchema,
  assignStudentSchema,
  updateAssignmentSchema,
} from '../validations/transportValidation.js'

const router = Router()

router.use(protect)

router.get('/routes', getRoutes)
router.post('/routes', validate(createRouteSchema), createRoute)
router.put('/routes/:id', validate(updateRouteSchema), updateRoute)
router.delete('/routes/:id', deleteRoute)
router.get('/assignments', getAssignments)
router.post('/assign', validate(assignStudentSchema), assignStudent)
router.put('/assignments/:id', validate(updateAssignmentSchema), updateAssignment)
router.delete('/assignments/:id', removeAssignment)

export default router
>>>>>>> Stashed changes
