// src/services/authService.ts
import * as SecureStore from 'expo-secure-store'
import api from './api'

export const authService = {
  async login(email: string, senha: string) {
    const { data } = await api.post('/auth/login', { email, senha })
    await SecureStore.setItemAsync('accessToken', data.dados.accessToken)
    await SecureStore.setItemAsync('refreshToken', data.dados.refreshToken)
    return data.dados
  },

  async registrar(payload: {
    nome: string; email: string; telefone: string; senha: string; tipo: string
  }) {
    const { data } = await api.post('/auth/register', payload)
    await SecureStore.setItemAsync('accessToken', data.dados.accessToken)
    await SecureStore.setItemAsync('refreshToken', data.dados.refreshToken)
    return data.dados
  },

  async logout() {
    const refreshToken = await SecureStore.getItemAsync('refreshToken')
    try { await api.post('/auth/logout', { refreshToken }) } catch {}
    await SecureStore.deleteItemAsync('accessToken')
    await SecureStore.deleteItemAsync('refreshToken')
  },

  async tokenSalvo() {
    return !!(await SecureStore.getItemAsync('accessToken'))
  },
}
