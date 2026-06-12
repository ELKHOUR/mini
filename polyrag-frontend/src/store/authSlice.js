import { createSlice } from '@reduxjs/toolkit'
import { getToken, setToken, removeToken } from '../utils/token'

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: getToken(),
    isAuthenticated: !!getToken(),
    user: null,
  },
  reducers: {
    loginSuccess: (state, action) => {
      state.token = action.payload
      state.isAuthenticated = true
      setToken(action.payload)
    },
    logout: (state) => {
      state.token = null
      state.isAuthenticated = false
      state.user = null
      removeToken()
    },
  },
})

export const { loginSuccess, logout } = authSlice.actions
export default authSlice.reducer