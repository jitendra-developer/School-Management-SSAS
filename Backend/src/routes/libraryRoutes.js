import { Router } from 'express'
import {
  getBooks,
  createBook,
  updateBook,
  deleteBook,
  getIssues,
  issueBook,
  returnBook,
} from '../controllers/libraryController.js'
import { protect } from '../middleware/auth.js'

const router = Router()

router.use(protect)

router.get('/books', getBooks)
router.post('/books', createBook)
router.put('/books/:id', updateBook)
router.delete('/books/:id', deleteBook)
router.get('/issues', getIssues)
router.post('/issue', issueBook)
router.post('/return/:id', returnBook)

export default router
