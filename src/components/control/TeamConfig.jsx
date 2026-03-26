import React, { useState } from 'react'
import { useMatchStore } from '../../store/matchStore'
import styles from './ControlSection.module.css'

const COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#22c55e', '#a855f7', '#ec4899', '#f1f5f9', '#06b6d4']

const CAM_OPTIONS = [
  { n: 1, label: 'Principal' },
  { n: 2, label: 'Dupla'     },
  { n: 4, label: 'Quad'      },
  { n: 6, label: 'Hexa'      },
]

export default function TeamConfig() {
  const { teamA, teamB, colorA, colorB, competition, cameraCount, setTeamConfig } = useMatchStore()

  const [cfgA,    setCfgA]    = useState(teamA)
  const [cfgB,    setCfgB]    = useState(teamB)
  const [clrA,    setClrA]    = useState(colorA)
  const [clrB,    setClrB]    = useState(colorB)
  const [cfgComp, setCfgComp] = useState(competition)
  const [cams,    setCams]    = useState(cameraCount)

  const apply = () => {
    setTeamConfig({
      teamA:       cfgA  || 'Time A',
      teamB:       cfgB  || 'Time B',
      colorA:      clrA,
      colorB:      clrB,
      competition: cfgComp || 'Competição',
      cameraCount: cams,
    })
  }

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>⚙️ Config dos Times & Transmissão</div>
      <div className={styles.body}>

        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          {/* Time A */}
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

          {/* Time B */}
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

        <div style={{ marginTop: 16 }}>
          <div className={styles.fieldLabel}>Competição</div>
          <input className={styles.input} style={{ width: '100%', marginBottom: 16 }} value={cfgComp} onChange={e => setCfgComp(e.target.value)} />

          <div className={styles.fieldLabel}>📹 Câmeras no Dashboard</div>
          <div className={styles.camSelector}>
            {CAM_OPTIONS.map(({ n, label }) => (
              <button
                key={n}
                className={`${styles.camBtn} ${cams === n ? styles.camBtnActive : ''}`}
                onClick={() => setCams(n)}
              >
                <span className={styles.camBtnNum}>{n}</span>
                <span className={styles.camBtnLabel}>{label}</span>
              </button>
            ))}
          </div>
        </div>

        <button className={`${styles.btn} ${styles.btnPrimary}`} style={{ marginTop: 16 }} onClick={apply}>
          ✓ Aplicar Configurações
        </button>
      </div>
    </div>
  )
}
