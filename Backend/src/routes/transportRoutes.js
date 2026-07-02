import { Router } from 'express'
import {
  getRoutes,
  createRoute,
  updateRoute,
  deleteRoute,
  getAssignments,
  assignStudent,
  removeAssignment,
} from '../controllers/transportController.js'
import { protect } from '../middleware/auth.js'

const router = Router()

router.use(protect)

router.get('/routes', getRoutes)
router.post('/routes', createRoute)
router.put('/routes/:id', updateRoute)
router.delete('/routes/:id', deleteRoute)
router.get('/assignments', getAssignments)
router.post('/assign', assignStudent)
router.delete('/assignments/:id', removeAssignment)

export default router
