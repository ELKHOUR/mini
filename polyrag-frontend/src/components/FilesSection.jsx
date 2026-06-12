import { useEffect, useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { listFiles, uploadFile, deleteFile, processFiles } from '../api/data'
import { indexPush } from '../api/nlp'
import { setFiles, setUploading, setDeleting, removeFile, addFile } from '../store/filesSlice'
import { setNeedsIndex } from '../store/projectSlice'
import Modal from './Modal'

export default function FilesSection() {
  const dispatch = useDispatch()
  const { files, uploading, deleting } = useSelector((state) => state.files)
  const { projectId, needsIndex } = useSelector((state) => state.project)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [indexing, setIndexing] = useState(false)
  const [indexSuccess, setIndexSuccess] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef()

  useEffect(() => {
    fetchFiles()
  }, [])

  const fetchFiles = async () => {
    try {
      const res = await listFiles()
      dispatch(setFiles(res.data.files))
    } catch (err) {
      setError('Failed to load files.')
    }
  }

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    dispatch(setUploading(true))
    setError('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await uploadFile(formData)
      await fetchFiles()
      dispatch(setNeedsIndex(true))
    } catch (err) {
      const signal = err.response?.data?.signal
      if (signal === 'File type not supported') {
        setError('File type not supported. Only .txt and .pdf allowed.')
      } else if (signal === 'project_size_exceeded') {
        setError('Project size limit reached (5MB).')
      } else {
        setError('Upload failed. Please try again.')
      }
    } finally {
      dispatch(setUploading(false))
      fileInputRef.current.value = ''
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    dispatch(setDeleting(deleteTarget.asset_id))
    try {
      await deleteFile(deleteTarget.asset_id)

        dispatch(removeFile(deleteTarget.asset_id))
        const remaining = files.filter(f => f.asset_id !== deleteTarget.asset_id)
        if (remaining.length === 0) {
        dispatch(setNeedsIndex(false))
        } else {
        dispatch(setNeedsIndex(true))
        }

      setIndexSuccess(false)
    } catch (err) {
      setError('Failed to delete file.')
    } finally {
      dispatch(setDeleting(null))
      setDeleteTarget(null)
    }
  }

  const handleIndex = async () => {
    setIndexing(true)
    setError('')
    setIndexSuccess(false)
    try {
      await processFiles({ do_reset: 1 })
      await indexPush({ do_reset: 1 })
      dispatch(setNeedsIndex(false))
      setIndexSuccess(true)
    } catch (err) {
      setError('Indexing failed. Please try again.')
    } finally {
      setIndexing(false)
    }
  }

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1048576).toFixed(1)} MB`
  }

  const formatDate = (iso) => {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    })
  }

  return (
    <div className="max-w-3xl">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Project Files</h3>
          <p className="text-sm text-gray-400 mt-0.5">Upload .txt, .pdf or .docx files (max 2MB each, 5MB total)</p>
        </div>
        <div className="flex items-center gap-3">
          {needsIndex && files.length > 0 && (
            <button
              onClick={handleIndex}
              disabled={indexing}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
            >
              {indexing ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Indexing...
                </>
              ) : 'Save & Index'}
            </button>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleUpload}
            accept=".txt,.pdf,.docx"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current.click()}
            disabled={uploading}
            className="flex items-center gap-2 bg-gray-900 hover:bg-gray-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
          >
            {uploading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Uploading...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Upload File
              </>
            )}
          </button>
        </div>
      </div>

      {/* Success message */}
      {indexSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 mb-4">
          ✓ Files indexed successfully. Your chatbot is ready.
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
          {error}
        </div>
      )}

      {/* Files list */}
      {files.length === 0 ? (
        <div className="border border-dashed border-gray-200 rounded-xl py-16 text-center">
          <svg className="w-10 h-10 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-sm text-gray-400">No files yet. Upload your first file.</p>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left text-xs font-medium text-gray-400 px-4 py-3">Name</th>
                <th className="text-left text-xs font-medium text-gray-400 px-4 py-3">Size</th>
                <th className="text-left text-xs font-medium text-gray-400 px-4 py-3">Uploaded</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {files.map((file, i) => (
                <tr key={file.asset_id}
                  className={`${i !== files.length - 1 ? 'border-b border-gray-100' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-sm text-gray-700 truncate max-w-xs">{file.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">{formatSize(file.size)}</td>
                  <td className="px-4 py-3 text-sm text-gray-400">{formatDate(file.created_at)}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setDeleteTarget(file)}
                      disabled={deleting === file.asset_id}
                      className="text-gray-300 hover:text-red-500 transition"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete confirmation modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete File"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This will also remove all associated chunks and vectors. Your project will need to be re-indexed.`}
        confirmLabel="Delete"
        confirmClass="bg-red-600 hover:bg-red-500 text-white"
      />

    </div>
  )
}