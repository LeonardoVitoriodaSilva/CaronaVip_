// src/components/layout/Layout.tsx
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useState } from 'react'
import { logout } from '../../store'
import { authService } from '../../services/api'
import type { RootState } from '../../store'
import styles from './Layout.module.css'

const navItems = [
  { to: '/', label: 'Início', icon: '🏠', end: true },
  { to: '/buscar', label: 'Buscar viagens', icon: '🔍' },
  { to: '/minhas-viagens', label: 'Minhas viagens', icon: '🚗' },
  { to: '/perfil', label: 'Perfil', icon: '👤' },
]

export function Layout() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const usuario = useSelector((s: RootState) => s.auth.usuario)
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = () => {
    authService.logout()
    dispatch(logout())
    navigate('/login')
  }

  return (
    <div className={`${styles.shell} ${collapsed ? styles.collapsed : ''}`}>
      {/* SIDEBAR */}
      <aside className={styles.sidebar}>
        <div className={styles.logoArea}>
          <div className={styles.logoBox}>
            <span className={styles.logoCarona}>CARONA</span>
            <span className={styles.logoVip}>VIP</span>
          </div>
          {!collapsed && (
            <div>
              <div className={styles.logoTitle}>Carona VIP</div>
              <div className={styles.logoSub}>Mobilidade regional</div>
            </div>
          )}
          <button className={styles.collapseBtn} onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? '→' : '←'}
          </button>
        </div>

        <nav className={styles.nav}>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>
              {usuario?.nome?.charAt(0) || 'U'}
            </div>
            {!collapsed && (
              <div className={styles.userText}>
                <div className={styles.userName}>{usuario?.nome || 'Usuário'}</div>
                <div className={styles.userRole}>{usuario?.tipo === 'MOTORISTA' ? 'Motorista' : 'Passageiro'}</div>
              </div>
            )}
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout} title="Sair">
            🚪
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className={styles.main}>
        <div className={styles.content}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
