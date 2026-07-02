import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { HiOutlineBookOpen, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi'
import { useAuth } from '@/context/AuthContext'

/** Register school + admin — foundation for onboarding flow */
export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    school_name: '',
    school_email: '',
    phone: '',
    name: '',
    email: '',
    password: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await register(form)
      navigate('/dashboard')
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : 'Registration failed'
      toast.error(message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-4 py-10">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-lg ring-1 ring-slate-100">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-accent-500">
            <HiOutlineBookOpen className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Create your school</h1>
          <p className="mt-1 text-sm text-slate-500">Register school and admin account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="School Name" name="school_name" value={form.school_name} onChange={handleChange} />
            <Field label="School Email" name="school_email" type="email" value={form.school_email} onChange={handleChange} />
          </div>
          <Field label="Phone" name="phone" value={form.phone} onChange={handleChange} required={false} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Admin Name" name="name" value={form.name} onChange={handleChange} />
            <Field label="Admin Email" name="email" type="email" value={form.email} onChange={handleChange} />
          </div>
          <Field label="Password" name="password" type="password" value={form.password} onChange={handleChange} />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-accent-500 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
          >
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

function Field({
  label,
  name,
  value,
  onChange,
  type = 'text',
  required = true,
}: {
  label: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  type?: string
  required?: boolean
}) {
  const [show, setShow] = useState(false)
  const isPassword = type === 'password'

  return (
    <div>
      <label htmlFor={name} className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="relative">
        <input
          id={name}
          name={name}
          type={isPassword && show ? 'text' : type}
          required={required}
          value={value}
          onChange={onChange}
          className={`w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 ${isPassword ? 'pr-10' : ''}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-slate-400 hover:text-slate-600"
          >
            {show ? <HiOutlineEyeOff className="h-4 w-4" /> : <HiOutlineEye className="h-4 w-4" />}
          </button>
        )}
      </div>
    </div>
  )
}
