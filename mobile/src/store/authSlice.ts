// src/store/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Usuario {
  id: string; nome: string; email: string; tipo: string
  mediaAvaliacao: number; fotoPerfil?: string
}

interface AuthState {
  usuario: Usuario | null
  autenticado: boolean
  carregando: boolean
}

const initialState: AuthState = { usuario: null, autenticado: false, carregando: true }

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUsuario: (state, action: PayloadAction<Usuario>) => {
      state.usuario = action.payload
      state.autenticado = true
      state.carregando = false
    },
    logout: (state) => {
      state.usuario = null
      state.autenticado = false
      state.carregando = false
    },
    setCarregando: (state, action: PayloadAction<boolean>) => {
      state.carregando = action.payload
    },
  },
})

export const { setUsuario, logout, setCarregando } = authSlice.actions
export default authSlice.reducer
