import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { createProject } from '../api/project'
import { setProject } from '../store/projectSlice'

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'French' },
  { value: 'ar', label: 'Arabic' },
  { value: 'ru', label: 'Russian' },
]

export default function CreateProject() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [form, setForm] = useState({ project_name: '', project_lang: 'en' })
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
      const res = await createProject(form)
      dispatch(setProject({
        project_id: res.data.project_id,
        project_name: res.data.project_name,
        project_lang: res.data.project_lang,
        api_key: res.data.api_key,
      }))
      navigate('/dashboard')
    } catch (err) {
      const signal = err.response?.data?.signal
      if (signal === 'project_already_exists') {
        navigate('/dashboard')
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
          <p className="text-gray-500 mt-1 text-sm">Set up your project</p>
        </div>

        {/* Card */}
        <div className="border border-gray-200 rounded-xl p-8 shadow-sm">

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Welcome! 👋</h2>
            <p className="text-sm text-gray-500 mt-1">
              Create your project to get started with PolyRAG.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Name
              </label>
              <input
                type="text"
                name="project_name"
                value={form.project_name}
                onChange={handleChange}
                required
                placeholder="My RAG Project"
                className="w-full border border-gray-300 text-gray-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Language
              </label>
              <select
                name="project_lang"
                value={form.project_lang}
                onChange={handleChange}
                className="w-full border border-gray-300 text-gray-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition bg-white"
              >
                {LANGUAGES.map(lang => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
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
              {loading ? 'Creating...' : 'Create Project'}
            </button>

          </form>
        </div>

      </div>
    </div>
  )
}