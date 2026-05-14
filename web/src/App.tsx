// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from './store'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { DashboardPage } from './pages/dashboard/DashboardPage'
import { SearchPage } from './pages/trips/SearchPage'
import { MyTripsPage } from './pages/trips/MyTripsPage'
import { ProfilePage } from './pages/users/ProfilePage'
import { Layout } from './components/layout/Layout'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('accessToken')
  return token ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastro" element={<RegisterPage />} />
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<DashboardPage />} />
          <Route path="buscar" element={<SearchPage />} />
          <Route path="minhas-viagens" element={<MyTripsPage />} />
          <Route path="perfil" element={<ProfilePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
