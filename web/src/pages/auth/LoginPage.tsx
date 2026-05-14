// src/pages/auth/LoginPage.tsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setUsuario } from '../../store'
import { authService, userService } from '../../services/api'
import styles from './Auth.module.css'

export function LoginPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro('')
    setLoading(true)
    try {
      await authService.login(email, senha)
      const usuario = await userService.meuPerfil()
      dispatch(setUsuario(usuario))
      navigate('/')
    } catch (err: any) {
      setErro(err.response?.data?.mensagem || 'E-mail ou senha incorretos')
    } finally {
      setLoading(false)
    }
  }

  const quickLogin = async (tipo: 'motorista' | 'passageiro') => {
    setEmail(tipo === 'motorista' ? 'carlos@caronavip.com' : 'joao@caronavip.com')
    setSenha('senha123')
  }

  return (
    <div className={styles.bg}>
      <div className={styles.blob1} />
      <div className={styles.blob2} />
      <div className={styles.card}>
        <div className={styles.logoBox}>
          <span className={styles.logoCarona}>CARONA</span>
          <span className={styles.logoVip}>VIP</span>
        </div>
        <h1 className={styles.title}>Login Carona VIP</h1>
        <p className={styles.sub}>Mobilidade entre cidades do Piauí</p>

        <form onSubmit={handleLogin} className={styles.form}>
          <input
            className={styles.input}
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            className={styles.input}
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={e => setSenha(e.target.value)}
            required
          />
          {erro && <div className={styles.erro}>{erro}</div>}
          <button className={styles.btn} type="submit" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className={styles.footer}>
          Não tem conta? <Link to="/cadastro" className={styles.link}>Cadastre-se</Link>
        </p>
        <div className={styles.demo}>
          Demo:
          <span onClick={() => quickLogin('passageiro')}>Passageiro</span>
          <span onClick={() => quickLogin('motorista')}>Motorista</span>
        </div>
      </div>
    </div>
  )
}
