import React, { useState } from 'react'
import { useMatchStore } from '../../store/matchStore'
import styles from './ControlSection.module.css'

const COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#22c55e', '#a855f7', '#ec4899', '#f1f5f9', '#06b6d4']

export default function TeamConfig() {
  const { teamA, teamB, colorA, colorB, competition, setTeamConfig } = useMatchStore()

  const [cfgA, setCfgA] = useState(teamA)
  const [cfgB, setCfgB] = useState(teamB)
  const [clrA, setClrA] = useState(colorA)
  const [clrB, setClrB] = useState(colorB)
  const [cfgComp, setCfgComp] = useState(competition)

  const apply = () => {
    setTeamConfig({
      teamA: cfgA || 'Time A',
      teamB: cfgB || 'Time B',
      colorA: clrA,
      colorB: clrB,
      competition: cfgComp || 'Competição',
    })
  }

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>⚙️ Configuração dos Times</div>
      <div className={styles.body}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {/* Team A */}
          <div style={{ flex: 1, minWidth: 200 }}>
            <div className={styles.fieldLabel}>Time A</div>
            <input className={styles.input} style={{ width: '100%', marginBottom: 8 }} value={cfgA} onChange={(e) => setCfgA(e.target.value)} />
            <div className={styles.colorRow}>
              {COLORS.map((c) => (
                <div
                  key={c}
                  className={`${styles.colorDot} ${clrA === c ? styles.colorActive : ''}`}
                  style={{ background: c }}
                  onClick={() => setClrA(c)}
                />
              ))}
            </div>
          </div>

          {/* Team B */}
          <div style={{ flex: 1, minWidth: 200 }}>
            <div className={styles.fieldLabel}>Time B</div>
            <input className={styles.input} style={{ width: '100%', marginBottom: 8 }} value={cfgB} onChange={(e) => setCfgB(e.target.value)} />
            <div className={styles.colorRow}>
              {COLORS.map((c) => (
                <div
                  key={c}
                  className={`${styles.colorDot} ${clrB === c ? styles.colorActive : ''}`}
                  style={{ background: c }}
                  onClick={() => setClrB(c)}
                />
              ))}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <div className={styles.fieldLabel}>Competição</div>
          <input className={styles.input} style={{ width: '100%', marginBottom: 10 }} value={cfgComp} onChange={(e) => setCfgComp(e.target.value)} />
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={apply}>✓ Aplicar Configurações</button>
        </div>
      </div>
    </div>
  )
}
