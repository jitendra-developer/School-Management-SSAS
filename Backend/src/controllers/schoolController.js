import { schoolService } from '../services/schoolService.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { successResponse } from '../utils/apiResponse.js'

export const updateSchool = asyncHandler(async (req, res) => {
  const { school_name, email, phone, address } = req.body
  const schoolId = req.admin.school_id

  const school = await schoolService.updateSchool(req.admin.id, schoolId, {
    school_name,
    email,
    phone,
    address,
  })

  return successResponse(res, {
    message: 'School updated successfully',
    data: school,
  })
})
