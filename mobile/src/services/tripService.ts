// src/services/tripService.ts
import api from './api'

export const tripService = {
  async buscar(params: { origem: string; destino: string; data?: string; vagas?: number }) {
    const { data } = await api.get('/trips/search', { params })
    return data.dados
  },

  async detalhe(id: string) {
    const { data } = await api.get(`/trips/${id}`)
    return data.dados
  },

  async criar(payload: any) {
    const { data } = await api.post('/trips', payload)
    return data.dados
  },

  async minhas(status?: string) {
    const { data } = await api.get('/trips/minhas', { params: status ? { status } : {} })
    return data.dados
  },

  async atualizarStatus(id: string, status: string) {
    const { data } = await api.patch(`/trips/${id}/status`, { status })
    return data.dados
  },

  async solicitar(id: string, pontoEmbarque?: string, observacao?: string) {
    const { data } = await api.post(`/trips/${id}/requests`, { pontoEmbarque, observacao })
    return data.dados
  },

  async solicitacoes(id: string) {
    const { data } = await api.get(`/trips/${id}/requests`)
    return data.dados
  },

  async avaliar(id: string, avaliadoId: string, nota: number, comentario?: string) {
    const { data } = await api.post(`/trips/${id}/reviews`, { avaliadoId, nota, comentario })
    return data.dados
  },

  async cidades(q?: string) {
    const { data } = await api.get('/cities', { params: q ? { q } : {} })
    return data.dados as string[]
  },
}
