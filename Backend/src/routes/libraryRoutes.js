import { Router } from 'express'
import {
  getBooks,
  createBook,
  updateBook,
  deleteBook,
  getIssues,
  issueBook,
  returnBook,
  updateIssue,
  deleteIssue,
} from '../controllers/libraryController.js'
import { protect } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import {
  createBookSchema,
  updateBookSchema,
  issueBookSchema,
  updateIssueSchema,
} from '../validations/libraryValidation.js'

const router = Router()

router.use(protect)

router.get('/books', getBooks)
router.post('/books', validate(createBookSchema), createBook)
router.put('/books/:id', validate(updateBookSchema), updateBook)
router.delete('/books/:id', deleteBook)
router.get('/issues', getIssues)
router.post('/issue', validate(issueBookSchema), issueBook)
router.post('/return/:id', returnBook)
router.put('/issues/:id', validate(updateIssueSchema), updateIssue)
router.delete('/issues/:id', deleteIssue)

export default router
