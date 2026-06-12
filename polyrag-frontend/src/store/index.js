import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import projectReducer from './projectSlice'
import filesReducer from './filesSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    project: projectReducer,
    files: filesReducer,
  },
})