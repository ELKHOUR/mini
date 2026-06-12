import { useSelector } from 'react-redux'

const navItems = [
  {
    id: 'files',
    label: 'Files',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    id: 'apikeys',
    label: 'API Keys',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
      </svg>
    ),
  },
  {
    id: 'integration',
    label: 'Integration',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
]

export default function Sidebar({ activeSection, setActiveSection, projectName, userName, onLogout }) {
  const needsIndex = useSelector((state) => state.project.needsIndex)

  return (
    <div className="w-60 bg-white border-r border-gray-200 flex flex-col min-h-screen">

      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100 flex items-center gap-3">
        <img src="/logo.png" alt="PolyRAG" className="w-8 h-8 object-contain" />
        <span className="font-bold text-gray-900 text-base">PolyRAG</span>
      </div>

      {/* Project name */}
      <div className="px-5 py-4 border-b border-gray-100">
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Project</p>
        <p className="text-sm font-medium text-gray-800 truncate">{projectName || 'My Project'}</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
              activeSection === item.id
                ? 'bg-gray-100 text-gray-900 font-medium'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            {item.icon}
            {item.label}
            {item.id === 'files' && needsIndex && (
              <span className="ml-auto w-2 h-2 bg-orange-400 rounded-full"></span>
            )}
          </button>
        ))}
      </nav>

      {/* User */}
      <div className="px-5 py-4 border-t border-gray-100">
        <p className="text-xs text-gray-500 truncate mb-2">{userName}</p>
        <button
          onClick={onLogout}
          className="text-xs text-gray-400 hover:text-gray-700 transition"
        >
          Sign out
        </button>
      </div>

    </div>
  )
}