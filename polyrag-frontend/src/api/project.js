import axiosInstance from './axiosInstance'
import { getToken } from '../utils/token'

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${getToken()}` }
})

export const createProject = (data) =>
  axiosInstance.post('/project/create', data, authHeaders())

export const getDashboard = () =>
  axiosInstance.get('/project/dashboard', authHeaders())

export const updateProject = (data) =>
  axiosInstance.patch('/project/update', data, authHeaders())