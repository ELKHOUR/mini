import axiosInstance from './axiosInstance'
import { getToken } from '../utils/token'

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${getToken()}` }
})

export const indexPush = (data) =>
  axiosInstance.post('/nlp/index/push', data, authHeaders())