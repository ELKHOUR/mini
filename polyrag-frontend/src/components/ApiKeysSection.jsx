import { useState } from 'react'
import { useSelector } from 'react-redux'

export default function ApiKeysSection() {
  const { apiKey, projectName, createdAt, updatedAt } = useSelector((state) => state.project)
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formatDate = (iso) => {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  return (
    <div className="max-w-2xl">

      <div className="mb-6">
        <h3 className="text-base font-semibold text-gray-900">API Keys</h3>
        <p className="text-sm text-gray-400 mt-0.5">
          Use this key to connect your chatbot to PolyRAG.
        </p>
      </div>

      {/* API Key card */}
      <div className="border border-gray-200 rounded-xl p-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-gray-700">{projectName}</p>
            <p className="text-xs text-gray-400 mt-0.5">Project API Key</p>
          </div>
          <button
            onClick={handleCopy}
            className={`flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg border transition ${
              copied
                ? 'border-green-300 text-green-600 bg-green-50'
                : 'border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            {copied ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy
              </>
            )}
          </button>
        </div>

        {/* Key display */}
        <div className="bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 font-mono text-sm text-gray-600 break-all">
          {apiKey}
        </div>
      </div>

      {/* Meta info */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full">
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="px-4 py-3 text-sm text-gray-400 w-40">Project Name</td>
              <td className="px-4 py-3 text-sm text-gray-700 font-medium">{projectName}</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="px-4 py-3 text-sm text-gray-400">Created</td>
              <td className="px-4 py-3 text-sm text-gray-700">{formatDate(createdAt)}</td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-sm text-gray-400">Last Updated</td>
              <td className="px-4 py-3 text-sm text-gray-700">{formatDate(updatedAt)}</td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  )
}