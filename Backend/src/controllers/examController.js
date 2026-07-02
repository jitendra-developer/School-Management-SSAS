import { examService } from '../services/examService.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { successResponse } from '../utils/apiResponse.js'

export const createExam = asyncHandler(async (req, res) => {
  const data = await examService.create(req.body, req.admin.school_id)
  return successResponse(res, { message: 'Exam created', data, statusCode: 201 })
})

export const getAllExams = asyncHandler(async (req, res) => {
  const data = await examService.getAll(req.admin.school_id, req.query)
  return successResponse(res, { message: 'Exams fetched', data })
})

export const getExamById = asyncHandler(async (req, res) => {
  const data = await examService.getById(req.params.id, req.admin.school_id)
  return successResponse(res, { message: 'Exam fetched', data })
})

export const updateExam = asyncHandler(async (req, res) => {
  const data = await examService.update(req.params.id, req.body, req.admin.school_id)
  return successResponse(res, { message: 'Exam updated', data })
})

export const deleteExam = asyncHandler(async (req, res) => {
  await examService.remove(req.params.id, req.admin.school_id)
  return successResponse(res, { message: 'Exam deleted' })
})

export const recordResult = asyncHandler(async (req, res) => {
  const { marks_obtained, grade } = req.body
  const data = await examService.recordResult(req.params.id, req.body.student_id, marks_obtained, grade)
  return successResponse(res, { message: 'Result recorded', data, statusCode: 201 })
})

export const getResults = asyncHandler(async (req, res) => {
  const data = await examService.getResults(req.params.id)
  return successResponse(res, { message: 'Results fetched', data })
})
