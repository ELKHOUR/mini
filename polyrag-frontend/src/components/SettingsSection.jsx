import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { updateProject } from '../api/project'
import { setProject } from '../store/projectSlice'

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'French' },
  { value: 'ar', label: 'Arabic' },
  { value: 'ru', label: 'Russian' },
]

export default function SettingsSection() {
  const dispatch = useDispatch()
  const { projectName, projectLang } = useSelector((state) => state.project)
  const [form, setForm] = useState({
    project_name: projectName || '',
    project_lang: projectLang || 'en',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)
    setError('')
    try {
      const res = await updateProject(form)
      dispatch(setProject({
        ...useSelector,
        project_name: res.data.project_name,
        project_lang: res.data.project_lang,
      }))
      setSuccess(true)
    } catch (err) {
      setError('Failed to update project. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg">

      <div className="mb-6">
        <h3 className="text-base font-semibold text-gray-900">Project Settings</h3>
        <p className="text-sm text-gray-400 mt-0.5">Update your project name and language.</p>
      </div>

      <div className="border border-gray-200 rounded-xl p-6">
        <form onSubmit={handleSubmit} className="space-y-5">

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
              className="w-full border border-gray-300 text-gray-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
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

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-3 py-2">
              ✓ Project updated successfully.
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-gray-900 hover:bg-gray-700 disabled:opacity-50 text-white font-medium rounded-lg px-5 py-2 text-sm transition"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>

        </form>
      </div>

    </div>
  )
}