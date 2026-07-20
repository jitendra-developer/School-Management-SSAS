import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { HiOutlineBookOpen, HiOutlineEye, HiOutlineEyeOff, HiOutlineArrowLeft } from 'react-icons/hi'
import { useAuth } from '@/context/AuthContext'

export default function Login() {
  const { login, verifyLoginOtp } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const errorMessage = (err: unknown, fallback: string) =>
    err && typeof err === 'object' && 'response' in err
      ? (err as { response?: { data?: { message?: string } } }).response?.data?.message || fallback
      : fallback

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login({ email, password })
      setStep('otp')
      toast.success('OTP sent to your registered email')
    } catch (err: unknown) {
      toast.error(errorMessage(err, 'Login failed'))
    } finally {
      setLoading(false)
    }
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await verifyLoginOtp({ email, otp })
      navigate('/dashboard')
    } catch (err: unknown) {
      toast.error(errorMessage(err, 'Invalid or expired OTP'))
    } finally {
      setLoading(false)
    }
  }

  if (step === 'otp') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg ring-1 ring-slate-100">
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary-600">
              <HiOutlineBookOpen className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Verify OTP</h1>
            <p className="mt-1 text-sm text-slate-500">
              We&apos;ve sent a 6-digit OTP to <strong className="text-slate-700">{email}</strong>
            </p>
          </div>

          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <div>
              <label htmlFor="otp" className="mb-1 block text-sm font-medium text-slate-700">
                OTP
              </label>
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                required
                autoFocus
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-center text-lg tracking-[0.4em] focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                placeholder="000000"
                maxLength={6}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary-600 py-2.5 text-sm font-semibold text-white hover:bg-primary-500 disabled:opacity-60"
            >
              {loading ? 'Verifying...' : 'Verify & Sign In'}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={() => { setStep('credentials'); setOtp('') }}
              className="inline-flex cursor-pointer items-center gap-1.5 font-medium text-primary-600 hover:underline"
            >
              <HiOutlineArrowLeft className="h-4 w-4" />
              Back
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={handleCredentialsSubmit}
              className="cursor-pointer font-medium text-primary-600 hover:underline disabled:opacity-60"
            >
              Resend OTP
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg ring-1 ring-slate-100">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary-600">
            <HiOutlineBookOpen className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Bright Future</h1>
          <p className="mt-1 text-sm text-slate-500">Sign in to your admin account</p>
        </div>

        <form onSubmit={handleCredentialsSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              placeholder="admin@school.com"
            />
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <Link to="/forgot-password" className="text-xs font-medium text-primary-600 hover:underline">
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 pr-10 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <HiOutlineEyeOff className="h-4 w-4" /> : <HiOutlineEye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary-600 py-2.5 text-sm font-semibold text-white hover:bg-primary-500 disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          New school?{' '}
          <Link to="/register" className="font-medium text-primary-600 hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  )
}
