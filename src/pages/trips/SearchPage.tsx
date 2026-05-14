// src/pages/trips/SearchPage.tsx
import { useState } from 'react'
import { tripService } from '../../services/api'
import styles from './Trips.module.css'

export function SearchPage() {
  const [form, setForm] = useState({ origem: 'Teresina', destino: 'Parnaíba', data: '', vagas: '1' })
  const [viagens, setViagens] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [buscou, setBuscou] = useState(false)
  const [cidades, setCidades] = useState<string[]>([])
  const [acField, setAcField] = useState<string | null>(null)

  const buscarCidades = async (q: string, field: string) => {
    setForm(f => ({ ...f, [field]: q }))
    if (q.length >= 2) {
      const res = await tripService.cidades(q)
      setCidades(res.slice(0, 8))
      setAcField(field)
    } else {
      setCidades([])
    }
  }

  const buscar = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setBuscou(true)
    try {
      const res = await tripService.buscar({ origem: form.origem, destino: form.destino, data: form.data || undefined, vagas: form.vagas })
      setViagens(res.viagens || [])
    } catch {
      setViagens([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fade-in">
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Buscar viagens</h1>
        <p className={styles.pageSub}>Encontre a carona ideal para você</p>
      </div>

      <div className={styles.card}>
        <form onSubmit={buscar}>
          <div className={styles.formGrid}>
            <div className={styles.fgRelative}>
              <label className={styles.label}>Origem</label>
              <input className={styles.input} value={form.origem} onChange={e => buscarCidades(e.target.value, 'origem')} onFocus={() => buscarCidades(form.origem, 'origem')} onBlur={() => setTimeout(() => setCidades([]), 200)} placeholder="Cidade de origem"/>
              {acField === 'origem' && cidades.length > 0 && (
                <div className={styles.dropdown}>
                  {cidades.map(c => <div key={c} className={styles.dropItem} onMouseDown={() => { setForm(f => ({...f, origem: c})); setCidades([]) }}>{c}</div>)}
                </div>
              )}
            </div>
            <div className={styles.fgRelative}>
              <label className={styles.label}>Destino</label>
              <input className={styles.input} value={form.destino} onChange={e => buscarCidades(e.target.value, 'destino')} onFocus={() => buscarCidades(form.destino, 'destino')} onBlur={() => setTimeout(() => setCidades([]), 200)} placeholder="Cidade de destino"/>
              {acField === 'destino' && cidades.length > 0 && (
                <div className={styles.dropdown}>
                  {cidades.map(c => <div key={c} className={styles.dropItem} onMouseDown={() => { setForm(f => ({...f, destino: c})); setCidades([]) }}>{c}</div>)}
                </div>
              )}
            </div>
            <div>
              <label className={styles.label}>Data</label>
              <input className={styles.input} type="date" value={form.data} onChange={e => setForm({...form, data: e.target.value})}/>
            </div>
            <div>
              <label className={styles.label}>Vagas</label>
              <select className={styles.input} value={form.vagas} onChange={e => setForm({...form, vagas: e.target.value})}>
                <option value="1">1 passageiro</option>
                <option value="2">2 passageiros</option>
                <option value="3">3 passageiros</option>
              </select>
            </div>
          </div>
          <button className={styles.btnPrimary} type="submit" disabled={loading}>
            {loading ? 'Buscando...' : '🔍 Buscar viagens'}
          </button>
        </form>
      </div>

      {buscou && (
        <div>
          <div className={styles.resultHeader}>
            <span><strong style={{color:'var(--orange)'}}>{viagens.length}</strong> viagens encontradas</span>
          </div>
          {viagens.length === 0 ? (
            <div className={styles.empty}>
              <div style={{fontSize:48}}>🔍</div>
              <p>Nenhuma viagem encontrada para esta rota.</p>
            </div>
          ) : viagens.map((v: any) => (
            <div key={v.id} className={styles.tripCard}>
              <div className={styles.tripRoute}>
                <span className={styles.tripCity}>{v.origem}</span>
                <span className={styles.tripArrow}>→</span>
                <span className={styles.tripCity}>{v.destino}</span>
              </div>
              <div className={styles.tripMeta}>
                <span>📅 {new Date(v.horarioSaida).toLocaleDateString('pt-BR')} às {new Date(v.horarioSaida).toLocaleTimeString('pt-BR', {hour:'2-digit',minute:'2-digit'})}</span>
                <span>💺 {v.vagasDisponiveis} vagas</span>
                <span>🚗 {v.veiculo?.marca} {v.veiculo?.modelo}</span>
                {v.distanciaKm && <span>📍 {v.distanciaKm} km</span>}
              </div>
              <div className={styles.tripFooter}>
                <div>
                  <div className={styles.tripPrice}>R$ {v.precoPorPessoa.toFixed(2)}</div>
                  <div style={{fontSize:12,color:'var(--text3)'}}>por pessoa</div>
                </div>
                <div className={styles.tripDriver}>
                  <div className={styles.driverAv}>{v.motorista?.nome?.charAt(0)}</div>
                  <div>
                    <div style={{fontSize:13,fontWeight:600,color:'var(--navy)'}}>{v.motorista?.nome}</div>
                    <div style={{color:'var(--orange)',fontSize:12}}>{'★'.repeat(Math.floor(v.motorista?.mediaAvaliacao || 5))}</div>
                  </div>
                  <button className={styles.btnSolicitar}>Solicitar</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
