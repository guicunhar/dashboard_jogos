import React, { useState } from 'react'
import TimerControl from '../components/control/TimerControl'
import ScoreControl from '../components/control/ScoreControl'
import EventLogger from '../components/control/EventLogger'
import TeamConfig from '../components/control/TeamConfig'
import StatsPanel from '../components/control/StatsPanel'
import LineupEditor from '../components/control/LineupEditor'
import CameraConfig from '../components/control/CameraConfig'
import styles from './ControlPanel.module.css'

const TABS = [
  { id: 'jogo',      label: '⚽ Jogo'      },
  { id: 'escalacao', label: '📋 Escalações' },
  { id: 'cameras',   label: '📹 C.âmeras'   },
  { id: 'config',    label: '⚙️ Config'    },
]

export default function ControlPanel() {
  const [tab, setTab] = useState('jogo')

  return (
    <div className={styles.root}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerTitle}>🎮 Painel de Controle</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <a href="/dashboard" target="_blank" rel="noreferrer" className={styles.obsBtn}>
            📺 Dashboard (OBS)
          </a>
          <a href="/dashboard-vertical" target="_blank" rel="noreferrer" className={`${styles.obsBtn} ${styles.obsBtnTiktok}`}>
            📱 TikTok Live
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {TABS.map(t => (
          <button
            key={t.id}
            className={`${styles.tabBtn} ${tab === t.id ? styles.tabActive : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className={styles.content}>

        {tab === 'jogo' && (
          <div className={styles.twoCol}>
            <div className={styles.col}>
              <TimerControl />
              <ScoreControl />
              <StatsPanel />
            </div>
            <div className={styles.col}>
              <EventLogger />
            </div>
          </div>
        )}

        {tab === 'escalacao' && (
          <div className={styles.singleCol}>
            <LineupEditor />
          </div>
        )}

        {tab === 'cameras' && (
          <div className={styles.singleCol}>
            <CameraConfig />
          </div>
        )}

        {tab === 'config' && (
          <div className={styles.singleCol}>
            <TeamConfig />
          </div>
        )}

      </div>
    </div>
  )
}
