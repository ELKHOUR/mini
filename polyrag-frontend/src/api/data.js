import axios from 'axios'
import { getToken } from '../utils/token'

const API = 'http://localhost:8000/api/v1'

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${getToken()}` }
})

export const uploadFile = (formData) =>
  axios.post(`${API}/data/upload`, formData, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      'Content-Type': 'multipart/form-data'
    }
  })

export const listFiles = () =>
  axios.get(`${API}/data/files`, authHeaders())

export const deleteFile = (assetId) =>
  axios.delete(`${API}/data/files/${assetId}`, authHeaders())

export const processFiles = (data) =>
  axios.post(`${API}/data/process`, data, authHeaders())