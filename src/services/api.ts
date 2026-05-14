// src/services/api.ts
import axios from 'axios'

export const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const refreshToken = localStorage.getItem('refreshToken')
        const { data } = await axios.post('/api/auth/refresh', { refreshToken })
        localStorage.setItem('accessToken', data.dados.accessToken)
        original.headers.Authorization = `Bearer ${data.dados.accessToken}`
        return api(original)
      } catch {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export const authService = {
  async login(email: string, senha: string) {
    const { data } = await api.post('/auth/login', { email, senha })
    localStorage.setItem('accessToken', data.dados.accessToken)
    localStorage.setItem('refreshToken', data.dados.refreshToken)
    return data.dados
  },
  async registrar(payload: any) {
    const { data } = await api.post('/auth/register', payload)
    localStorage.setItem('accessToken', data.dados.accessToken)
    localStorage.setItem('refreshToken', data.dados.refreshToken)
    return data.dados
  },
  logout() {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    window.location.href = '/login'
  },
}

export const tripService = {
  async buscar(params: any) {
    const { data } = await api.get('/trips/search', { params })
    return data.dados
  },
  async minhas(status?: string) {
    const { data } = await api.get('/trips/minhas', { params: status ? { status } : {} })
    return data.dados
  },
  async criar(payload: any) {
    const { data } = await api.post('/trips', payload)
    return data.dados
  },
  async solicitacoes(id: string) {
    const { data } = await api.get(`/trips/${id}/requests`)
    return data.dados
  },
  async cidades(q?: string) {
    const { data } = await api.get('/cities', { params: q ? { q } : {} })
    return data.dados as string[]
  },
}

export const userService = {
  async meuPerfil() {
    const { data } = await api.get('/users/me')
    return data.dados
  },
  async atualizar(payload: any) {
    const { data } = await api.put('/users/me', payload)
    return data.dados
  },
  async historico() {
    const { data } = await api.get('/users/me/history')
    return data.dados
  },
}
