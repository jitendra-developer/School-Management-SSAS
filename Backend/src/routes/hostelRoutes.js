<<<<<<< Updated upstream
import { Router } from 'express'
import {
  getHostels,
  createHostel,
  updateHostel,
  deleteHostel,
  getRooms,
  createRoom,
  updateRoom,
  deleteRoom,
  getAssignments,
  assignStudent,
  removeAssignment,
  updateAssignment,
} from '../controllers/hostelController.js'
import { protect } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import {
  createHostelSchema,
  updateHostelSchema,
  createRoomSchema,
  updateRoomSchema,
  assignStudentSchema,
  updateAssignmentSchema,
} from '../validations/hostelValidation.js'

const router = Router()

router.use(protect)

router.route('/').get(getHostels).post(validate(createHostelSchema), createHostel)
router.route('/:id').put(validate(updateHostelSchema), updateHostel).delete(deleteHostel)
router.get('/:hostelId/rooms', getRooms)
router.post('/rooms', validate(createRoomSchema), createRoom)
router.put('/rooms/:id', validate(updateRoomSchema), updateRoom)
router.delete('/rooms/:id', deleteRoom)
router.get('/assignments/all', getAssignments)
router.post('/assign', validate(assignStudentSchema), assignStudent)
router.put('/assignments/:id', validate(updateAssignmentSchema), updateAssignment)
router.delete('/assignments/:id', removeAssignment)

export default router
=======
import { Router } from 'express'
import {
  getHostels,
  createHostel,
  updateHostel,
  deleteHostel,
  getRooms,
  createRoom,
  updateRoom,
  deleteRoom,
  getAssignments,
  assignStudent,
  removeAssignment,
  updateAssignment,
} from '../controllers/hostelController.js'
import { protect } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import {
  createHostelSchema,
  updateHostelSchema,
  createRoomSchema,
  updateRoomSchema,
  assignStudentSchema,
  updateAssignmentSchema,
} from '../validations/hostelValidation.js'

const router = Router()

router.use(protect)

router.route('/').get(getHostels).post(validate(createHostelSchema), createHostel)
router.route('/:id').put(validate(updateHostelSchema), updateHostel).delete(deleteHostel)
router.get('/:hostelId/rooms', getRooms)
router.post('/rooms', validate(createRoomSchema), createRoom)
router.put('/rooms/:id', validate(updateRoomSchema), updateRoom)
router.delete('/rooms/:id', deleteRoom)
router.get('/assignments/all', getAssignments)
router.post('/assign', validate(assignStudentSchema), assignStudent)
router.put('/assignments/:id', validate(updateAssignmentSchema), updateAssignment)
router.delete('/assignments/:id', removeAssignment)

export default router
>>>>>>> Stashed changes
