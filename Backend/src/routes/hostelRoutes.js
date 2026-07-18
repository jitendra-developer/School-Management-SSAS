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

const router = Router()

router.use(protect)

router.route('/').get(getHostels).post(createHostel)
router.route('/:id').put(updateHostel).delete(deleteHostel)
router.get('/:hostelId/rooms', getRooms)
router.post('/rooms', createRoom)
router.put('/rooms/:id', updateRoom)
router.delete('/rooms/:id', deleteRoom)
router.get('/assignments/all', getAssignments)
router.post('/assign', assignStudent)
router.put('/assignments/:id', updateAssignment)
router.delete('/assignments/:id', removeAssignment)

export default router
