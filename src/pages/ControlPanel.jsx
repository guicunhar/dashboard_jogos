import React from 'react'
import { Link } from 'react-router-dom'
import TimerControl from '../components/control/TimerControl'
import ScoreControl from '../components/control/ScoreControl'
import EventLogger from '../components/control/EventLogger'
import TeamConfig from '../components/control/TeamConfig'
import StatsPanel from '../components/control/StatsPanel'
import styles from './ControlPanel.module.css'

export default function ControlPanel() {
  return (
    <div className={styles.root}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerTitle}>🎮 Painel de Controle</div>
        <a
          href="/dashboard"
          target="_blank"
          rel="noreferrer"
          className={styles.obsBtn}
        >
          📺 Abrir Dashboard (OBS)
        </a>
      </div>

      {/* Content */}
      <div className={styles.content}>
        <div className={styles.col}>
          <TimerControl />
          <ScoreControl />
          <StatsPanel />
        </div>
        <div className={styles.col}>
          <EventLogger />
          <TeamConfig />
        </div>
      </div>
    </div>
  )
}
