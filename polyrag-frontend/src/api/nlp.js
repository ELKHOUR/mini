import axios from 'axios'
import { getToken } from '../utils/token'

const API = 'http://localhost:8000/api/v1'

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${getToken()}` }
})

export const indexPush = (data) =>
  axios.post(`${API}/nlp/index/push`, data, authHeaders())