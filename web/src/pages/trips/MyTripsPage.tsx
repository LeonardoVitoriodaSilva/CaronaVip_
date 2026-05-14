// src/pages/trips/MyTripsPage.tsx
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { tripService } from '../../services/api'
import styles from './Trips.module.css'

const FILTROS = ['todas', 'DISPONIVEL', 'EM_ANDAMENTO', 'FINALIZADA', 'CANCELADA']
const LABEL: any = { todas: 'Todas', DISPONIVEL: 'Ativas', EM_ANDAMENTO: 'Em andamento', FINALIZADA: 'Finalizadas', CANCELADA: 'Canceladas' }

export function MyTripsPage() {
  const usuario = useSelector((s: RootState) => s.auth.usuario)
  const isMotorista = usuario?.tipo === 'MOTORISTA'
  const [viagens, setViagens] = useState<any[]>([])
  const [filtro, setFiltro] = useState('todas')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    tripService.minhas(filtro === 'todas' ? undefined : filtro)
      .then(setViagens)
      .catch(() => setViagens([]))
      .finally(() => setLoading(false))
  }, [filtro])

  const filtered = viagens

  return (
    <div className="fade-in">
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>{isMotorista ? 'Minhas viagens' : 'Minhas reservas'}</h1>
        <p className={styles.pageSub}>{isMotorista ? 'Gerencie suas rotas publicadas' : 'Suas caronas reservadas'}</p>
      </div>

      <div style={{display:'flex',gap:8,marginBottom:20,flexWrap:'wrap'}}>
        {FILTROS.map(f => (
          <button key={f}
            onClick={() => setFiltro(f)}
            style={{
              padding:'6px 16px', borderRadius:20, border:'1.5px solid',
              fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit',
              background: filtro===f ? 'rgba(224,123,26,0.1)' : 'white',
              borderColor: filtro===f ? 'var(--orange)' : 'var(--beige2)',
              color: filtro===f ? 'var(--orange)' : 'var(--text2)',
            }}>
            {LABEL[f]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className={styles.empty}>Carregando...</div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}>
          <div style={{fontSize:48}}>🚗</div>
          <p>Nenhuma viagem encontrada.</p>
        </div>
      ) : filtered.map((v: any) => {
        const pct = v.vagasTotal > 0 ? Math.round(((v.vagasTotal - v.vagasDisponiveis) / v.vagasTotal) * 100) : 0
        const st = v.status
        const badgeCls = st === 'FINALIZADA' ? styles.bGreen : st === 'CANCELADA' ? styles.bRed : st === 'EM_ANDAMENTO' ? styles.bOrange : styles.bGray
        return (
          <div key={v.id} className={styles.tripCard}>
            <div className={styles.tripRoute}>
              <span className={styles.tripCity}>{v.origem}</span>
              <span className={styles.tripArrow}>→</span>
              <span className={styles.tripCity}>{v.destino}</span>
              <span className={`${styles.badge} ${badgeCls}`} style={{marginLeft:'auto'}}>{st.toLowerCase().replace('_',' ')}</span>
            </div>
            <div className={styles.tripMeta}>
              <span>📅 {new Date(v.horarioSaida).toLocaleDateString('pt-BR')} às {new Date(v.horarioSaida).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}</span>
              {isMotorista && <span>💺 {v.vagasTotal - v.vagasDisponiveis}/{v.vagasTotal} passageiros</span>}
              <span>💰 R$ {v.precoPorPessoa}/pessoa</span>
              <span>🚗 {v.veiculo?.marca} {v.veiculo?.modelo} • {v.veiculo?.placa}</span>
            </div>
            {isMotorista && (
              <div>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:12,color:'var(--text3)',marginBottom:4}}>
                  <span>Ocupação</span><span>{pct}%</span>
                </div>
                <div className={styles.progress}>
                  <div className={styles.progressFill} style={{width:`${pct}%`}}></div>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
