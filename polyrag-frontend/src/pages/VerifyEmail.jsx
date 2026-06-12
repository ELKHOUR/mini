import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { verifyEmail } from '../api/auth'

export default function VerifyEmail() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('pending')

  useEffect(() => {
    if (token) {
      handleVerify()
    } else {
      setStatus('waiting')
    }
  }, [token])

  const handleVerify = async () => {
    try {
      await verifyEmail(token)
      setStatus('success')
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      setStatus('error')
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        <div className="flex flex-col items-center mb-8">
          <img src="/logo.png" alt="PolyRAG" className="w-16 h-16 mb-3 object-contain" />
          <h1 className="text-2xl font-bold text-gray-900">PolyRAG</h1>
        </div>

        <div className="border border-gray-200 rounded-xl p-8 shadow-sm text-center">

          {status === 'waiting' && (
            <>
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Check your email</h2>
              <p className="text-sm text-gray-500 mb-6">
                We sent a verification link to your email. Click it to activate your account.
              </p>
              <Link to="/login"
                className="block w-full bg-gray-900 hover:bg-gray-700 text-white font-medium rounded-lg py-2 text-sm transition text-center">
                Back to Sign in
              </Link>
            </>
          )}

          {status === 'pending' && (
            <>
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Verifying...</h2>
              <p className="text-sm text-gray-500">Please wait while we verify your email.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Email verified!</h2>
              <p className="text-sm text-gray-500 mb-6">
                Your account is now active. Redirecting to login...
              </p>
              <Link to="/login"
                className="block w-full bg-gray-900 hover:bg-gray-700 text-white font-medium rounded-lg py-2 text-sm transition text-center">
                Go to Sign in
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Verification failed</h2>
              <p className="text-sm text-gray-500 mb-6">
                The link is invalid or has expired.
              </p>
              <Link to="/register"
                className="block w-full bg-gray-900 hover:bg-gray-700 text-white font-medium rounded-lg py-2 text-sm transition text-center">
                Register again
              </Link>
            </>
          )}

        </div>
      </div>
    </div>
  )
}