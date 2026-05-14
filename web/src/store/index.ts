// src/store/index.ts
import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Usuario {
  id: string; nome: string; email: string; tipo: string
  mediaAvaliacao: number; fotoPerfil?: string; veiculos?: any[]
}

const authSlice = createSlice({
  name: 'auth',
  initialState: { usuario: null as Usuario | null, autenticado: false },
  reducers: {
    setUsuario: (state, action: PayloadAction<Usuario>) => {
      state.usuario = action.payload
      state.autenticado = true
    },
    logout: (state) => {
      state.usuario = null
      state.autenticado = false
    },
  },
})

export const { setUsuario, logout } = authSlice.actions

export const store = configureStore({
  reducer: { auth: authSlice.reducer },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
