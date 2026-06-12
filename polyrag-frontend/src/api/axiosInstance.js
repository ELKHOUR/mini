import axios from 'axios'
import { store } from '../store/index'
import { logout } from '../store/authSlice'

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000/api/v1'
})

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      store.dispatch(logout())
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default axiosInstance