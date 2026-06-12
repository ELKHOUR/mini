import { createSlice } from '@reduxjs/toolkit'

const filesSlice = createSlice({
  name: 'files',
  initialState: {
    files: [],
    uploading: false,
    deleting: null,
  },
  reducers: {
    setFiles: (state, action) => {
      state.files = action.payload
    },
    setUploading: (state, action) => {
      state.uploading = action.payload
    },
    setDeleting: (state, action) => {
      state.deleting = action.payload
    },
    removeFile: (state, action) => {
      state.files = state.files.filter(f => f.asset_id !== action.payload)
    },
    addFile: (state, action) => {
      state.files.push(action.payload)
    },
  },
})

export const { setFiles, setUploading, setDeleting, removeFile, addFile } = filesSlice.actions
export default filesSlice.reducer