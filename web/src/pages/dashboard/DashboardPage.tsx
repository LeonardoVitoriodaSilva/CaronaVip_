// src/pages/dashboard/DashboardPage.tsx
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { RootState } from '../../store'
import { userService } from '../../services/api'
import styles from './Dashboard.module.css'

export function DashboardPage() {
  const usuario = useSelector((s: RootState) => s.auth.usuario)
  const navigate = useNavigate()
  const [historico, setHistorico] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const hora = new Date().getHours()
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite'
  const nome = usuario?.nome?.split(' ')[0] || 'Usuário'
  const isMotorista = usuario?.tipo === 'MOTORISTA'

  useEffect(() => {
    userService.historico()
      .then(d => setHistorico(d.itens || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const stats = isMotorista
    ? [
        { label: 'Viagens criadas', value: '87', change: '+5 este mês', up: true },
        { label: 'Avaliação', value: '4.9★', change: '87 avaliações', up: true },
        { label: 'Receita este mês', value: 'R$1.240', change: '+18%', up: true },
        { label: 'Km rodados', value: '12.400', change: 'acumulado', up: null },
      ]
    : [
        { label: 'Viagens realizadas', value: usuario ? String(usuario.mediaAvaliacao > 0 ? 23 : 0) : '0', change: '+3 este mês', up: true },
        { label: 'Avaliação média', value: `${usuario?.mediaAvaliacao || 5}★`, change: 'sua nota', up: true },
        { label: 'Economia estimada', value: 'R$644', change: 'vs. ônibus', up: true },
        { label: 'Km percorridos', value: '2.840', change: 'acumulado', up: null },
      ]

  return (
    <div className="fade-in">
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{saudacao}, {nome}! 👋</h1>
          <p className={styles.sub}>{isMotorista ? 'Gerencie suas rotas publicadas' : 'Pronto para viajar hoje?'}</p>
        </div>
        <button
          className={styles.ctaBtn}
          onClick={() => navigate(isMotorista ? '/minhas-viagens' : '/buscar')}
        >
          {isMotorista ? '+ Nova viagem' : '🔍 Buscar carona'}
        </button>
      </div>

      {/* Mode bar */}
      <div className={styles.modebar}>
        <span className={styles.modedot}></span>
        <span className={styles.modeLabel}>{isMotorista ? 'Modo Motorista' : 'Modo Passageiro'}</span>
        <span className={styles.modeSub}>{isMotorista ? '— gerencie suas rotas' : '— busque caronas disponíveis'}</span>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        {stats.map((s, i) => (
          <div key={i} className={styles.statCard}>
            <div className={styles.statLabel}>{s.label}</div>
            <div className={styles.statValue}>{s.value}</div>
            <div className={`${styles.statChange} ${s.up === true ? styles.up : s.up === false ? styles.down : styles.neu}`}>
              {s.change}
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className={styles.grid2}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>{isMotorista ? 'Ações rápidas' : 'Busca rápida'}</h2>
          <div className={styles.quickActions}>
            {isMotorista ? (
              <>
                <button className={styles.actionBtn} onClick={() => navigate('/minhas-viagens')}>
                  <span>🚗</span> Minhas viagens
                </button>
                <button className={styles.actionBtn} onClick={() => navigate('/minhas-viagens')}>
                  <span>📋</span> Ver solicitações
                </button>
                <button className={styles.actionBtn} onClick={() => navigate('/perfil')}>
                  <span>🚘</span> Meus veículos
                </button>
                <button className={styles.actionBtn} onClick={() => navigate('/perfil')}>
                  <span>⭐</span> Avaliações
                </button>
              </>
            ) : (
              <>
                <button className={styles.actionBtn} onClick={() => navigate('/buscar')}>
                  <span>🔍</span> Buscar viagens
                </button>
                <button className={styles.actionBtn} onClick={() => navigate('/minhas-viagens')}>
                  <span>📋</span> Minhas reservas
                </button>
                <button className={styles.actionBtn} onClick={() => navigate('/perfil')}>
                  <span>👤</span> Meu perfil
                </button>
                <button className={styles.actionBtn}>
                  <span>💬</span> Mensagens
                </button>
              </>
            )}
          </div>
        </div>

        {/* Histórico */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Histórico recente</h2>
          {loading ? (
            <div className={styles.loading}>Carregando...</div>
          ) : historico.length === 0 ? (
            <div className={styles.empty}>
              <div style={{fontSize:40}}>🚗</div>
              <p>Nenhuma viagem ainda.</p>
              <button className={styles.emptyBtn} onClick={() => navigate('/buscar')}>
                Buscar primeira carona
              </button>
            </div>
          ) : (
            <div className={styles.timeline}>
              {historico.slice(0, 5).map((h: any, i: number) => (
                <div key={i} className={styles.tlItem}>
                  <div className={`${styles.tlDot} ${h.viagem?.status === 'FINALIZADA' ? styles.green : h.viagem?.status === 'CANCELADA' ? styles.red : styles.orange}`}></div>
                  <div>
                    <div className={styles.tlTitle}>{h.viagem?.origem} → {h.viagem?.destino}</div>
                    <div className={styles.tlSub}>{h.viagem?.motorista?.nome} • R$ {h.viagem?.precoPorPessoa}</div>
                  </div>
                  <span className={`${styles.badge} ${h.viagem?.status === 'FINALIZADA' ? styles.bGreen : h.viagem?.status === 'CANCELADA' ? styles.bRed : styles.bOrange}`}>
                    {h.viagem?.status?.toLowerCase()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Rotas populares */}
      <div className={styles.card} style={{marginTop: 16}}>
        <h2 className={styles.cardTitle}>Rotas populares no Piauí</h2>
        <div className={styles.rotasGrid}>
          {[
            { orig: 'Teresina', dest: 'Parnaíba', km: 336, preco: 65 },
            { orig: 'Teresina', dest: 'Picos', km: 308, preco: 55 },
            { orig: 'Teresina', dest: 'Floriano', km: 240, preco: 70 },
            { orig: 'Teresina', dest: 'Campo Maior', km: 94, preco: 25 },
            { orig: 'Teresina', dest: 'Piripiri', km: 155, preco: 30 },
            { orig: 'Picos', dest: 'Floriano', km: 180, preco: 45 },
          ].map((r, i) => (
            <div key={i} className={styles.rotaCard} onClick={() => navigate(`/buscar?orig=${r.orig}&dest=${r.dest}`)}>
              <div className={styles.rotaRoute}>
                <span className={styles.rotaCity}>{r.orig}</span>
                <span className={styles.rotaArrow}>→</span>
                <span className={styles.rotaCity}>{r.dest}</span>
              </div>
              <div className={styles.rotaMeta}>{r.km} km</div>
              <div className={styles.rotaPrice}>R$ {r.preco}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
