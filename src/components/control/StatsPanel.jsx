import React from 'react'
import { useMatchStore, formatTime } from '../../store/matchStore'
import styles from './ControlSection.module.css'

export default function StatsPanel() {
  const { stats, events, timerSec, clearEvents } = useMatchStore()

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>📊 Estatísticas da Partida</div>
      <div className={styles.body}>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Gols Time A</div>
            <div className={styles.statVal}>{stats.goalsA}</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Gols Time B</div>
            <div className={styles.statVal}>{stats.goalsB}</div>
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
            <div className={styles.statLabel}>Substituições</div>
            <div className={styles.statVal}>🔄 {stats.subs}</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Tempo de jogo</div>
            <div className={styles.statVal}>{formatTime(timerSec)}</div>
          </div>
        </div>
        <button
          className={`${styles.btn} ${styles.btnGhost} ${styles.btnFull}`}
          style={{ marginTop: 10 }}
          onClick={clearEvents}
        >
          🗑 Limpar todos os eventos
        </button>
      </div>
    </div>
  )
}
