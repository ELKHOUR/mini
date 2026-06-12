import { createSlice } from '@reduxjs/toolkit'

const projectSlice = createSlice({
  name: 'project',
  initialState: {
    projectId: null,
    projectName: null,
    projectLang: null,
    apiKey: null,
    createdAt: null,
    updatedAt: null,
    userName: null,
    userEmail: null,
    needsIndex: false,
  },
  reducers: {
    setProject: (state, action) => {
      const p = action.payload
      state.projectId = p.project_id
      state.projectName = p.project_name
      state.projectLang = p.project_lang
      state.apiKey = p.api_key
      state.createdAt = p.created_at
      state.updatedAt = p.updated_at
      state.userName = p.user_name
      state.userEmail = p.user_email
    },
    setNeedsIndex: (state, action) => {
      state.needsIndex = action.payload
    },
    clearProject: (state) => {
      state.projectId = null
      state.projectName = null
      state.projectLang = null
      state.apiKey = null
      state.needsIndex = false
    },
  },
})

export const { setProject, setNeedsIndex, clearProject } = projectSlice.actions
export default projectSlice.reducer