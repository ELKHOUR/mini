import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { login } from '../api/auth'
import { loginSuccess } from '../store/authSlice'

export default function Login() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await login(form)
      dispatch(loginSuccess(res.data.access_token))
      navigate('/dashboard')
    } catch (err) {
      const signal = err.response?.data?.signal
      if (signal === 'email_not_verified') {
        setError('Please verify your email before logging in.')
      } else if (signal === 'invalid_email_or_password') {
        setError('Invalid email or password.')
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo + Title */}
        <div className="flex flex-col items-center mb-8">
          <img src="/logo.png" alt="PolyRAG" className="w-16 h-16 mb-3 object-contain" />
          <h1 className="text-2xl font-bold text-gray-900">PolyRAG</h1>
          <p className="text-gray-500 mt-1 text-sm">Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="border border-gray-200 rounded-xl p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                className="w-full border border-gray-300 text-gray-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="w-full border border-gray-300 text-gray-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition placeholder-gray-400"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 hover:bg-gray-700 disabled:opacity-50 text-white font-medium rounded-lg py-2 text-sm transition"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>

          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Don't have an account?{' '}
            <Link to="/register" className="text-gray-900 font-medium hover:underline">
              Create one
            </Link>
          </p>
        </div>

      </div>
    </div>
  )
}