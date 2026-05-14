// src/services/api.ts
import axios from 'axios'
import * as SecureStore from 'expo-secure-store'

const BASE_URL = __DEV__
  ? 'http://192.168.1.100:3000/api'  // ← Troque pelo IP da sua máquina
  : 'https://sua-api.com/api'

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

// Injeta token em todas as requisições
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Renova token automaticamente ao expirar
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const refreshToken = await SecureStore.getItemAsync('refreshToken')
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken })
        await SecureStore.setItemAsync('accessToken', data.dados.accessToken)
        original.headers.Authorization = `Bearer ${data.dados.accessToken}`
        return api(original)
      } catch {
        await SecureStore.deleteItemAsync('accessToken')
        await SecureStore.deleteItemAsync('refreshToken')
      }
    }
    return Promise.reject(error)
  }
)

export default api
