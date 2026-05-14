// src/pages/auth/RegisterPage.tsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setUsuario } from '../../store'
import { authService, userService } from '../../services/api'
import styles from './Auth.module.css'

export function RegisterPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [tipo, setTipo] = useState<'PASSAGEIRO' | 'MOTORISTA'>('PASSAGEIRO')
  const [form, setForm] = useState({ nome: '', email: '', telefone: '', senha: '' })
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro('')
    if (form.senha.length < 8) { setErro('Senha deve ter mínimo 8 caracteres'); return }
    setLoading(true)
    try {
      await authService.registrar({ ...form, tipo })
      const usuario = await userService.meuPerfil()
      dispatch(setUsuario(usuario))
      navigate('/')
    } catch (err: any) {
      setErro(err.response?.data?.mensagem || 'Erro ao criar conta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.bg}>
      <div className={styles.blob1} /><div className={styles.blob2} />
      <div className={styles.card}>
        <h1 className={styles.title}>Criar conta</h1>
        <p className={styles.sub}>Você é:</p>
        <div className={styles.roleRow}>
          {(['PASSAGEIRO', 'MOTORISTA'] as const).map(t => (
            <button key={t} type="button"
              className={`${styles.roleBtn} ${tipo === t ? styles.roleBtnOn : ''}`}
              onClick={() => setTipo(t)}>
              <span className={styles.roleIco}>{t === 'PASSAGEIRO' ? '🧍' : '🚗'}</span>
              <span className={styles.roleLbl}>{t === 'PASSAGEIRO' ? 'Passageiro' : 'Motorista'}</span>
            </button>
          ))}
        </div>
        <form onSubmit={handleSubmit} className={styles.form}>
          <input className={styles.input} placeholder="Nome completo" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} required />
          <input className={styles.input} type="email" placeholder="E-mail" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
          <input className={styles.input} placeholder="Telefone (86) 99999-9999" value={form.telefone} onChange={e => setForm({...form, telefone: e.target.value})} required />
          <input className={styles.input} type="password" placeholder="Senha (mínimo 8 caracteres)" value={form.senha} onChange={e => setForm({...form, senha: e.target.value})} required />
          {erro && <div className={styles.erro}>{erro}</div>}
          <button className={styles.btn} type="submit" disabled={loading}>
            {loading ? 'Criando conta...' : 'Criar conta grátis'}
          </button>
        </form>
        <p className={styles.footer}>
          Já tem conta? <Link to="/login" className={styles.link}>Entrar</Link>
        </p>
      </div>
    </div>
  )
}
