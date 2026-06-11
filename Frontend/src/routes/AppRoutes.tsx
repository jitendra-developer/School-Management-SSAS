import { Navigate, Route, Routes } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import Login from '@/pages/auth/Login'
import Register from '@/pages/auth/Register'
import Dashboard from '@/pages/Dashboard'
import Students from '@/pages/Students'
import Teachers from '@/pages/Teachers'
import Attendance from '@/pages/Attendance'
import Fees from '@/pages/Fees'
import Reports from '@/pages/Reports'
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

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/students" element={<Students />} />
          <Route path="/teachers" element={<Teachers />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/fees" element={<Fees />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/analytics" element={<Reports />} />
          <Route path="/settings" element={<div className="glass-card rounded-xl p-6 text-center text-slate-400"><p className="text-lg font-medium text-slate-600">Settings</p><p className="mt-1 text-sm">Coming soon</p></div>} />
          <Route path="/profile" element={<div className="glass-card rounded-xl p-6 text-center text-slate-400"><p className="text-lg font-medium text-slate-600">Profile</p><p className="mt-1 text-sm">Coming soon</p></div>} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>
    </Routes>
  )
}
