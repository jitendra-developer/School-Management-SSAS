import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  HiOutlineCamera,
  HiOutlineUser,
  HiOutlineEnvelope,
  HiOutlineShieldCheck,
  HiOutlineBuildingOffice2,
  HiOutlinePhone,
  HiOutlineCalendarDays,
  HiOutlinePencilSquare,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineLockClosed,
  HiOutlineEye,
  HiOutlineEyeSlash,
} from 'react-icons/hi2'
import { useAuth } from '@/context/AuthContext'
import { profileService } from '@/services/profileService'
import { authService } from '@/services/authService'
import { storage } from '@/utils/storage'
import type { UpdateProfilePayload } from '@/types/auth'

const DEMO_IMAGE = 'https://api.dicebear.com/9.x/avataaars/svg?seed=school-admin'

export default function Profile() {
  const { admin, setAdmin } = useAuth()
  const fileRef = useRef<HTMLInputElement>(null)
  const [editing, setEditing] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState<UpdateProfilePayload>(() => ({
    name: admin?.name || '',
    email: admin?.email || '',
    phone: admin?.school?.phone || '',
  }))

  const [imageSrc, setImageSrc] = useState(() => admin?.profile_image || DEMO_IMAGE)

  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [changingPassword, setChangingPassword] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const { data } = await profileService.uploadImage(file)
      if (data.success && data.data?.admin) {
        const updated = data.data.admin
        storage.setAdmin(updated)
        setAdmin(updated)
        setImageSrc(updated.profile_image || DEMO_IMAGE)
        toast.success('Profile image updated')
      }
    } catch {
      toast.error('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const { data } = await profileService.updateProfile(form)
      if (data.success && data.data?.admin) {
        const updated = data.data.admin
        storage.setAdmin(updated)
        setAdmin(updated)
        toast.success('Profile updated')
        setEditing(false)
      }
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (admin) {
      setForm({ name: admin.name, email: admin.email, phone: admin.school?.phone || '' })
    }
    setEditing(false)
  }

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters')
      return
    }
    setSavingPassword(true)
    try {
      await authService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })
      toast.success('Password changed successfully')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setChangingPassword(false)
    } catch {
      toast.error('Failed to change password. Check your current password.')
    } finally {
      setSavingPassword(false)
    }
  }

  const initials = admin?.name
    ? admin.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'A'

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-800">Profile</h1>
        <p className="mt-1 text-sm text-slate-500">Manage your personal information</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-xl p-6"
      >
        <div className="flex flex-col items-center gap-6 sm:flex-row">
          <div className="relative">
            <div className="h-28 w-28 overflow-hidden rounded-full bg-gradient-to-br from-primary-500 to-violet-600 shadow-lg shadow-primary-600/20">
              {imageSrc ? (
                <img
                  src={imageSrc}
                  alt={admin?.name || 'Admin'}
                  className="h-full w-full object-cover"
                  onError={() => setImageSrc(DEMO_IMAGE)}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-white">
                  {initials}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="absolute -bottom-1 -right-1 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white shadow-md ring-2 ring-slate-100 transition-all hover:bg-primary-50 hover:ring-primary-200 disabled:opacity-50"
            >
              <HiOutlineCamera className={`h-4 w-4 text-slate-500 ${uploading ? 'animate-pulse' : ''}`} />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>

          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-xl font-bold text-slate-800">{admin?.name || 'Admin'}</h2>
            <p className="text-sm text-slate-500 capitalize">{admin?.role?.replace('_', ' ') || 'Super Admin'}</p>
            <p className="mt-1 text-sm text-slate-400">{admin?.email}</p>
          </div>

          <button
            type="button"
            onClick={() => setEditing(!editing)}
            className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200/60 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 shadow-sm transition-all hover:border-primary-200 hover:text-primary-600 hover:shadow-md"
          >
            <HiOutlinePencilSquare className="h-4 w-4" />
            {editing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card rounded-xl p-6"
      >
        <h3 className="mb-5 font-semibold text-slate-800">Personal Information</h3>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
              <HiOutlineUser className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium text-slate-400">Full Name</label>
              {editing ? (
                <input
                  type="text"
                  value={form.name || ''}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-200/60 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                />
              ) : (
                <p className="mt-0.5 text-sm font-medium text-slate-700">{admin?.name || '—'}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
              <HiOutlineEnvelope className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium text-slate-400">Email</label>
              {editing ? (
                <input
                  type="email"
                  value={form.email || ''}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-200/60 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                />
              ) : (
                <p className="mt-0.5 text-sm font-medium text-slate-700">{admin?.email || '—'}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <HiOutlinePhone className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium text-slate-400">Phone</label>
              {editing ? (
                <input
                  type="tel"
                  value={form.phone || ''}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-200/60 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                />
              ) : (
                <p className="mt-0.5 text-sm font-medium text-slate-700">{admin?.school?.phone || '—'}</p>
              )}
            </div>
          </div>
        </div>

        {editing && (
          <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-violet-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-primary-600/20 transition-all hover:shadow-primary-600/30 disabled:opacity-50"
            >
              <HiOutlineCheckCircle className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200/60 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 shadow-sm transition-all hover:bg-slate-50"
            >
              <HiOutlineXCircle className="h-4 w-4" />
              Cancel
            </button>
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="glass-card rounded-xl p-6"
      >
        <h3 className="mb-5 font-semibold text-slate-800">Account Details</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <HiOutlineShieldCheck className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium text-slate-400">Role</label>
              <p className="mt-0.5 text-sm font-medium text-slate-700 capitalize">
                {admin?.role?.replace('_', ' ') || 'Super Admin'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <HiOutlineBuildingOffice2 className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium text-slate-400">School</label>
              <p className="mt-0.5 text-sm font-medium text-slate-700">
                {admin?.school?.school_name || '—'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
              <HiOutlineCalendarDays className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium text-slate-400">Member Since</label>
              <p className="mt-0.5 text-sm font-medium text-slate-700">
                {admin?.created_at
                  ? new Date(admin.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })
                  : '—'}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card rounded-xl p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-800">Password</h3>
            <p className="mt-0.5 text-sm text-slate-500">Change your account password</p>
          </div>
          <button
            type="button"
            onClick={() => setChangingPassword(!changingPassword)}
            className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200/60 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 shadow-sm transition-all hover:border-primary-200 hover:text-primary-600 hover:shadow-md"
          >
            <HiOutlineLockClosed className="h-4 w-4" />
            {changingPassword ? 'Cancel' : 'Change Password'}
          </button>
        </div>

        {changingPassword && (
          <div className="mt-5 space-y-4 border-t border-slate-100 pt-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Current Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200/60 bg-white px-4 py-2.5 pr-10 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <HiOutlineEyeSlash className="h-4 w-4" /> : <HiOutlineEye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">New Password</label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200/60 bg-white px-4 py-2.5 pr-10 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                  placeholder="Min. 6 characters"
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-slate-400 hover:text-slate-600"
                >
                  {showNewPassword ? <HiOutlineEyeSlash className="h-4 w-4" /> : <HiOutlineEye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200/60 bg-white px-4 py-2.5 pr-10 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                  placeholder="Repeat new password"
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? <HiOutlineEyeSlash className="h-4 w-4" /> : <HiOutlineEye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleChangePassword}
                disabled={savingPassword || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                className="flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-violet-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-primary-600/20 transition-all hover:shadow-primary-600/30 disabled:opacity-50"
              >
                <HiOutlineCheckCircle className="h-4 w-4" />
                {savingPassword ? 'Updating...' : 'Update Password'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setChangingPassword(false)
                  setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
                }}
                className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200/60 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 shadow-sm transition-all hover:bg-slate-50"
              >
                <HiOutlineXCircle className="h-4 w-4" />
                Cancel
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
