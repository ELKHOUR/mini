import axios from 'axios'
import { getToken } from '../utils/token'

const API = 'http://localhost:8000/api/v1'

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${getToken()}` }
})

export const createProject = (data) =>
  axios.post(`${API}/project/create`, data, authHeaders())

export const getDashboard = () =>
  axios.get(`${API}/project/dashboard`, authHeaders())

export const updateProject = (data) =>
  axios.patch(`${API}/project/update`, data, authHeaders())