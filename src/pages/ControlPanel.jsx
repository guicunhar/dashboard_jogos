import React, { useState } from 'react'
import TimerControl from '../components/control/TimerControl'
import ScoreControl from '../components/control/ScoreControl'
import EventLogger from '../components/control/EventLogger'
import TeamConfig from '../components/control/TeamConfig'
import StatsPanel from '../components/control/StatsPanel'
import LineupEditor from '../components/control/LineupEditor'
import styles from './ControlPanel.module.css'

const TABS = [
  { id: 'jogo',      label: '⚽ Jogo' },
  { id: 'escalacao', label: '📋 Escalações' },
  { id: 'config',    label: '⚙️ Config' },
]

export default function ControlPanel() {
  const [tab, setTab] = useState('jogo')

  return (
    <div className={styles.root}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerTitle}>🎮 Painel de Controle</div>
        <a href="/dashboard" target="_blank" rel="noreferrer" className={styles.obsBtn}>
          📺 Abrir Dashboard
        </a>
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

        {/* ── ABA JOGO ── */}
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

        {/* ── ABA ESCALAÇÕES ── */}
        {tab === 'escalacao' && (
          <div className={styles.singleCol}>
            <LineupEditor />
          </div>
        )}

        {/* ── ABA CONFIG ── */}
        {tab === 'config' && (
          <div className={styles.singleCol}>
            <TeamConfig />
          </div>
        )}

      </div>
    </div>
  )
}
