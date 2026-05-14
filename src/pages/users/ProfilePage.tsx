// src/pages/users/ProfilePage.tsx
import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, setUsuario } from '../../store'
import { userService } from '../../services/api'
import styles from './Profile.module.css'

export function ProfilePage() {
  const dispatch = useDispatch()
  const usuario = useSelector((s: RootState) => s.auth.usuario)
  const [form, setForm] = useState({ nome: '', email: '', telefone: '' })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const isMotorista = usuario?.tipo === 'MOTORISTA'

  useEffect(() => {
    if (usuario) {
      setForm({ nome: usuario.nome || '', email: usuario.email || '', telefone: '' })
    }
  }, [usuario])

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const atualizado = await userService.atualizar({ nome: form.nome, telefone: form.telefone })
      dispatch(setUsuario({ ...usuario!, ...atualizado }))
      setMsg('Perfil atualizado com sucesso!')
      setTimeout(() => setMsg(''), 3000)
    } catch {
      setMsg('Erro ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fade-in">
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Meu perfil</h1>
        <p className={styles.pageSub}>Gerencie suas informações</p>
      </div>

      <div className={styles.grid}>
        {/* Card do perfil */}
        <div className={styles.profileCard}>
          <div className={styles.avatarLg}>{usuario?.nome?.charAt(0) || 'U'}</div>
          <div className={styles.profileName}>{usuario?.nome}</div>
          <div className={styles.profileRole}>{isMotorista ? 'Motorista verificado' : 'Passageiro'}</div>
          <div className={styles.profileStars}>
            {'★'.repeat(Math.floor(usuario?.mediaAvaliacao || 5))}
          </div>
          <div className={styles.profileRating}>{usuario?.mediaAvaliacao} · avaliações</div>

          <div className={styles.divider}></div>

          <div className={styles.statsRow}>
            <div className={styles.statItem}>
              <div className={styles.statNum}>23</div>
              <div className={styles.statLbl}>Viagens</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNum}>2.840</div>
              <div className={styles.statLbl}>Km</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNum} style={{color:'var(--orange)'}}>R$644</div>
              <div className={styles.statLbl}>Economizados</div>
            </div>
          </div>

          <div className={styles.divider}></div>

          <div className={styles.checks}>
            <div className={styles.checkRow}>
              <span>📧 E-mail</span>
              <span className={styles.verified}>✓ Verificado</span>
            </div>
            <div className={styles.checkRow}>
              <span>📱 Telefone</span>
              <span className={styles.verified}>✓ Verificado</span>
            </div>
            {isMotorista && (
              <div className={styles.checkRow}>
                <span>🪪 CNH</span>
                <span className={styles.pending}>Pendente</span>
              </div>
            )}
          </div>
        </div>

        {/* Formulário de edição */}
        <div>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Editar dados</h2>
            <form onSubmit={salvar}>
              <div className={styles.fg}>
                <label className={styles.label}>Nome completo</label>
                <input className={styles.input} value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} />
              </div>
              <div className={styles.fg}>
                <label className={styles.label}>E-mail</label>
                <input className={styles.input} value={form.email} disabled style={{opacity:0.6}} />
              </div>
              <div className={styles.fg}>
                <label className={styles.label}>Telefone</label>
                <input className={styles.input} value={form.telefone} onChange={e => setForm({...form, telefone: e.target.value})} placeholder="(86) 99999-9999" />
              </div>
              {msg && <div className={styles.msg}>{msg}</div>}
              <button className={styles.btnSave} type="submit" disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar alterações'}
              </button>
            </form>
          </div>

          {isMotorista && usuario?.veiculos && usuario.veiculos.length > 0 && (
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Meus veículos</h2>
              {usuario.veiculos.map((v: any) => (
                <div key={v.id} className={styles.vehicleCard}>
                  <div className={styles.vehicleIcon}>🚗</div>
                  <div>
                    <div className={styles.vehicleName}>{v.marca} {v.modelo}</div>
                    <div className={styles.vehicleMeta}>{v.placa} · {v.cor} · {v.capacidade} lugares</div>
                  </div>
                  <span className={styles.verified}>Ativo</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
