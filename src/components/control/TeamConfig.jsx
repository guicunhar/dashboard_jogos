import React, { useState } from 'react'
import { useMatchStore } from '../../store/matchStore'
import { fetchMatchInfo, fetchLineups, fetchEvents, fetchFullMatch } from '../../services/matchApi'
import styles from './ControlSection.module.css'

const COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#22c55e', '#a855f7', '#ec4899', '#f1f5f9', '#06b6d4']

const CAM_OPTIONS = [
  { n: 1, label: 'Principal' },
  { n: 2, label: 'Dupla'     },
  { n: 4, label: 'Quad'      },
  { n: 6, label: 'Hexa'      },
]

export default function TeamConfig() {
  const store = useMatchStore()
  const { teamA, teamB, colorA, colorB, competition, cameraCount, matchId, setTeamConfig, updateLineup } = store

  const [cfgA,    setCfgA]    = useState(teamA)
  const [cfgB,    setCfgB]    = useState(teamB)
  const [clrA,    setClrA]    = useState(colorA)
  const [clrB,    setClrB]    = useState(colorB)
  const [cfgComp, setCfgComp] = useState(competition)
  const [cams,    setCams]    = useState(cameraCount)
  const [mid,     setMid]     = useState(matchId || '')

  // API load status
  const [apiStatus, setApiStatus] = useState('idle')   // idle | loading | ok | error
  const [apiMsg,    setApiMsg]    = useState('')
  const [loadType,  setLoadType]  = useState('')        // 'full' | 'info' | 'lineups' | 'events'

  const apply = () => {
    setTeamConfig({
      teamA:       cfgA  || 'Time A',
      teamB:       cfgB  || 'Time B',
      colorA:      clrA,
      colorB:      clrB,
      competition: cfgComp || 'Competição',
      cameraCount: cams,
      matchId:     mid.trim(),
    })
  }

  const handleApiLoad = async (type) => {
    const id = mid.trim()
    if (!id) {
      setApiStatus('error')
      setApiMsg('Informe o ID da partida antes de carregar.')
      return
    }

    setApiStatus('loading')
    setLoadType(type)
    setApiMsg('')

    try {
      if (type === 'full') {
        const data = await fetchFullMatch(id, clrA, clrB)
        setTeamConfig({
          teamA:       data.teamA,
          teamB:       data.teamB,
          scoreA:      data.scoreA,
          scoreB:      data.scoreB,
          competition: data.competition,
          colorA:      clrA,
          colorB:      clrB,
          cameraCount: cams,
          matchId:     id,
        })
        updateLineup('a', data.lineupA)
        updateLineup('b', data.lineupB)
        // Também carrega eventos
        useMatchStore.setState({ events: data.events })
        setCfgA(data.teamA)
        setCfgB(data.teamB)
        setCfgComp(data.competition)
        setApiMsg(`✅ Partida carregada: ${data.teamA} × ${data.teamB}`)
      }

      else if (type === 'info') {
        const data = await fetchMatchInfo(id)
        setTeamConfig({
          teamA:       data.teamA,
          teamB:       data.teamB,
          competition: data.competition,
          colorA:      clrA,
          colorB:      clrB,
          cameraCount: cams,
          matchId:     id,
        })
        setCfgA(data.teamA)
        setCfgB(data.teamB)
        setCfgComp(data.competition)
        setApiMsg(`✅ Times: ${data.teamA} × ${data.teamB}`)
      }

      else if (type === 'lineups') {
        const data = await fetchLineups(id)
        updateLineup('a', data.lineupA)
        updateLineup('b', data.lineupB)
        setApiMsg(`✅ Escalações carregadas (${data.lineupA.length} + ${data.lineupB.length} jogadores)`)
      }

      else if (type === 'events') {
        const data = await fetchEvents(id, cfgA, cfgB, clrA, clrB)
        useMatchStore.setState({ events: data })
        setApiMsg(`✅ ${data.length} eventos carregados`)
      }

      setApiStatus('ok')
    } catch (err) {
      setApiStatus('error')
      setApiMsg(`Erro: ${err.message}`)
    }
  }

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>⚙️ Config dos Times & Transmissão</div>
      <div className={styles.body}>

        {/* ── ID da Partida + botões API ── */}
        <div className={styles.matchIdBlock}>
          <div className={styles.fieldLabel}>🔑 ID da Partida (para API)</div>
          <div className={styles.inputRow}>
            <input
              className={styles.input}
              style={{ flex: 1 }}
              placeholder="ex: 123456 ou abc-xyz"
              value={mid}
              onChange={e => setMid(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleApiLoad('full')}
            />
          </div>

          <div className={styles.apiLoadGrid}>
            <button
              className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSm}`}
              style={{ gridColumn: '1 / -1' }}
              disabled={apiStatus === 'loading'}
              onClick={() => handleApiLoad('full')}
            >
              {apiStatus === 'loading' && loadType === 'full' ? '⏳ Carregando...' : '🚀 Carregar Partida Completa'}
            </button>
            <button
              className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`}
              disabled={apiStatus === 'loading'}
              onClick={() => handleApiLoad('info')}
            >
              {apiStatus === 'loading' && loadType === 'info' ? '⏳...' : '👥 Só Times'}
            </button>
            <button
              className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`}
              disabled={apiStatus === 'loading'}
              onClick={() => handleApiLoad('lineups')}
            >
              {apiStatus === 'loading' && loadType === 'lineups' ? '⏳...' : '📋 Só Escalações'}
            </button>
            <button
              className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`}
              disabled={apiStatus === 'loading'}
              onClick={() => handleApiLoad('events')}
            >
              {apiStatus === 'loading' && loadType === 'events' ? '⏳...' : '⚡ Só Eventos'}
            </button>
          </div>

          {/* Feedback da API */}
          {apiMsg && (
            <div className={apiStatus === 'error' ? styles.apiError : styles.apiSuccess}>
              {apiMsg}
            </div>
          )}

          <div className={styles.apiHint}>
            Configure os endpoints em <code>src/services/matchApi.js</code>
          </div>
        </div>

        <div className={styles.divider} />

        {/* ── Times ── */}
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 180 }}>
            <div className={styles.fieldLabel}>Time A (Casa)</div>
            <input className={styles.input} style={{ width: '100%', marginBottom: 10 }} value={cfgA} onChange={e => setCfgA(e.target.value)} />
            <div className={styles.fieldLabel}>Cor</div>
            <div className={styles.colorRow}>
              {COLORS.map(c => (
                <div key={c} className={`${styles.colorDot} ${clrA === c ? styles.colorActive : ''}`} style={{ background: c }} onClick={() => setClrA(c)} />
              ))}
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 180 }}>
            <div className={styles.fieldLabel}>Time B (Visitante)</div>
            <input className={styles.input} style={{ width: '100%', marginBottom: 10 }} value={cfgB} onChange={e => setCfgB(e.target.value)} />
            <div className={styles.fieldLabel}>Cor</div>
            <div className={styles.colorRow}>
              {COLORS.map(c => (
                <div key={c} className={`${styles.colorDot} ${clrB === c ? styles.colorActive : ''}`} style={{ background: c }} onClick={() => setClrB(c)} />
              ))}
            </div>
          </div>
        </div>

        {/* ── Competição + Câmeras ── */}
        <div style={{ marginTop: 16 }}>
          <div className={styles.fieldLabel}>Competição</div>
          <input className={styles.input} style={{ width: '100%', marginBottom: 16 }} value={cfgComp} onChange={e => setCfgComp(e.target.value)} />

          <div className={styles.fieldLabel}>📹 Câmeras no Dashboard</div>
          <div className={styles.camSelector}>
            {CAM_OPTIONS.map(({ n, label }) => (
              <button key={n} className={`${styles.camBtn} ${cams === n ? styles.camBtnActive : ''}`} onClick={() => setCams(n)}>
                <span className={styles.camBtnNum}>{n}</span>
                <span className={styles.camBtnLabel}>{label}</span>
              </button>
            ))}
          </div>
        </div>

        <button className={`${styles.btn} ${styles.btnPrimary}`} style={{ marginTop: 16 }} onClick={apply}>
          ✓ Aplicar Configurações Manuais
        </button>
      </div>
    </div>
  )
}
