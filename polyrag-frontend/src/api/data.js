import axiosInstance from './axiosInstance'
import { getToken } from '../utils/token'

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${getToken()}` }
})

export const uploadFile = (formData) =>
  axiosInstance.post('/data/upload', formData, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      'Content-Type': 'multipart/form-data'
    }
  })

export const listFiles = () =>
  axiosInstance.get('/data/files', authHeaders())

export const deleteFile = (assetId) =>
  axiosInstance.delete(`/data/files/${assetId}`, authHeaders())

export const processFiles = (data) =>
  axiosInstance.post('/data/process', data, authHeaders())