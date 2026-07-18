import { feeService } from '../services/feeService.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { successResponse } from '../utils/apiResponse.js'

export const createFeePlan = asyncHandler(async (req, res) => {
  const data = await feeService.createPlan(req.body, req.admin.school_id)
  return successResponse(res, { message: 'Fee plan created', data, statusCode: 201 })
})

export const getFeePlans = asyncHandler(async (req, res) => {
  const data = await feeService.getPlans(req.admin.school_id)
  return successResponse(res, { message: 'Fee plans fetched', data })
})

export const updateFeePlan = asyncHandler(async (req, res) => {
  const data = await feeService.updatePlan(req.params.id, req.body, req.admin.school_id)
  return successResponse(res, { message: 'Fee plan updated', data })
})

export const deleteFeePlan = asyncHandler(async (req, res) => {
  await feeService.removePlan(req.params.id, req.admin.school_id)
  return successResponse(res, { message: 'Fee plan deleted' })
})

export const assignFee = asyncHandler(async (req, res) => {
  const data = await feeService.assignFee(req.body, req.admin.school_id)
  return successResponse(res, { message: 'Fee assigned', data, statusCode: 201 })
})

export const assignFeeBatch = asyncHandler(async (req, res) => {
  const data = await feeService.assignFeeBatch(req.body, req.admin.school_id)
  return successResponse(res, { message: 'Fee assigned to students', data, statusCode: 201 })
})

export const recordPayment = asyncHandler(async (req, res) => {
  const data = await feeService.recordPayment(req.params.feeId, req.body, req.admin.school_id)
  return successResponse(res, { message: 'Payment recorded', data })
})

export const getFeePayments = asyncHandler(async (req, res) => {
  const data = await feeService.getPayments(req.params.feeId, req.admin.school_id)
  return successResponse(res, { message: 'Payments fetched', data })
})

export const getFees = asyncHandler(async (req, res) => {
  const data = await feeService.getFees(req.admin.school_id, req.query)
  return successResponse(res, { message: 'Fees fetched', data })
})

export const getFeeById = asyncHandler(async (req, res) => {
  const data = await feeService.getById(req.params.id, req.admin.school_id)
  return successResponse(res, { message: 'Fee fetched', data })
})

export const updateFee = asyncHandler(async (req, res) => {
  const data = await feeService.updateFee(req.params.id, req.body, req.admin.school_id)
  return successResponse(res, { message: 'Fee updated', data })
})

export const getPendingFees = asyncHandler(async (req, res) => {
  const data = await feeService.getPendingFees(req.admin.school_id, req.query)
  return successResponse(res, { message: 'Pending fees fetched', data })
})
