import React from 'react'
import { useMatchStore, formatTime } from '../../store/matchStore'
import styles from './ControlSection.module.css'

export default function StatsPanel() {
  const { stats, timerSec, clearEvents } = useMatchStore()

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>📊 Estatísticas</div>
      <div className={styles.body}>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Gols A</div>
            <div className={styles.statVal}>{stats.goalsA}</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Gols B</div>
            <div className={styles.statVal}>{stats.goalsB}</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Tempo</div>
            <div className={styles.statVal} style={{ fontSize: 20 }}>{formatTime(timerSec)}</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Amarelos</div>
            <div className={styles.statVal}>🟨 {stats.yellows}</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Vermelhos</div>
            <div className={styles.statVal}>🟥 {stats.reds}</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Subs</div>
            <div className={styles.statVal}>🔄 {stats.subs}</div>
          </div>
        </div>
        <button
          className={`${styles.btn} ${styles.btnGhost} ${styles.btnFull}`}
          style={{ marginTop: 12 }}
          onClick={clearEvents}
        >🗑 Limpar eventos</button>
      </div>
    </div>
  )
}
