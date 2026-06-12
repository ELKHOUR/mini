import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { getDashboard } from '../api/project'
import { setProject } from '../store/projectSlice'
import { logout } from '../store/authSlice'
import Sidebar from '../components/Sidebar'
import FilesSection from '../components/FilesSection'
import ApiKeysSection from '../components/ApiKeysSection'
import IntegrationSection from '../components/IntegrationSection'
import SettingsSection from '../components/SettingsSection'

export default function Dashboard() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const project = useSelector((state) => state.project)
  const [activeSection, setActiveSection] = useState('files')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await getDashboard()
        dispatch(setProject(res.data))
        if (!res.data.project_id) {
          navigate('/create-project')
        }
      } catch (err) {
        if (err.response?.status === 404) {
          navigate('/create-project')
        }
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    )
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'files': return <FilesSection />
      case 'apikeys': return <ApiKeysSection />
      case 'integration': return <IntegrationSection />
      case 'settings': return <SettingsSection />
      default: return <FilesSection />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* Sidebar */}
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        projectName={project.projectName}
        userName={project.userName}
        onLogout={handleLogout}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">

        {/* Top bar */}
        <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 capitalize">
              {activeSection === 'apikeys' ? 'API Keys' :
               activeSection === 'integration' ? 'Integration' :
               activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">{project.projectName}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">{project.userEmail}</span>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-gray-900 transition"
            >
              Sign out
            </button>
          </div>
        </div>

        {/* Section content */}
        <div className="flex-1 p-8">
          {renderSection()}
        </div>

      </div>
    </div>
  )
}