import { Navigate, Route, Routes } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import Login from '@/pages/auth/Login'
import TeacherAttendance from '@/pages/TeacherAttendance'
import Register from '@/pages/auth/Register'
import ForgotPassword from '@/pages/auth/ForgotPassword'
import ResetPassword from '@/pages/auth/ResetPassword'
import Dashboard from '@/pages/Dashboard'
import Classes from '@/pages/Classes'
import ClassDetail from '@/pages/ClassDetail'
import Students from '@/pages/Students'
import Teachers from '@/pages/Teachers'
import Attendance from '@/pages/Attendance'
import Fees from '@/pages/Fees'
import Reports from '@/pages/Reports'
import Profile from '@/pages/Profile'
import Settings from '@/pages/Settings'
import Examinations from '@/pages/Examinations'
import Timetable from '@/pages/Timetable'
import Transport from '@/pages/Transport'
import Library from '@/pages/Library'
import Hostel from '@/pages/Hostel'
import Notices from '@/pages/Notices'
import Messages from '@/pages/Messages'
import { ProtectedRoute } from './ProtectedRoute'
import { GuestRoute } from './GuestRoute'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route
        path="/login"
        element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        }
      />
      <Route
        path="/register"
        element={
          <GuestRoute>
            <Register />
          </GuestRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <GuestRoute>
            <ForgotPassword />
          </GuestRoute>
        }
      />
      <Route
        path="/reset-password"
        element={
          <GuestRoute>
            <ResetPassword />
          </GuestRoute>
        }
      />

      <Route path="/teacher-attendance" element={<TeacherAttendance />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/classes" element={<Classes />} />
          <Route path="/classes/:id" element={<ClassDetail />} />
          <Route path="/students" element={<Students />} />
          <Route path="/teachers" element={<Teachers />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/examinations" element={<Examinations />} />
          <Route path="/timetable" element={<Timetable />} />
          <Route path="/transport" element={<Transport />} />
          <Route path="/library" element={<Library />} />
          <Route path="/hostel" element={<Hostel />} />
          <Route path="/notices" element={<Notices />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/fees" element={<Fees />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/analytics" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>
    </Routes>
  )
}
