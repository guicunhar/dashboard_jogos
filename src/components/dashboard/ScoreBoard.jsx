import React from 'react'
import { motion } from 'framer-motion'
import { useMatchStore, formatTime } from '../../store/matchStore'
import styles from './ScoreBoard.module.css'

export default function ScoreBoard() {
  const { teamA, teamB, colorA, colorB, scoreA, scoreB, timerSec, timerRunning, competition } = useMatchStore()

  return (
    <div className={styles.scoreboard}>
      <div className={styles.accentLine} />

      {/* ── Campeonato acima do placar ── */}
      <div className={styles.competitionRow}>
        <span className={styles.compDot} />
        <span className={styles.compName}>{competition}</span>
        <span className={styles.compDot} />
      </div>

      {/* ── Placar + times ── */}
      <div className={styles.row}>
        {/* Casa — texto alinhado à direita, encostado no placar */}
        <div className={styles.teamLeft}>
          <div className={styles.teamRole}>Casa</div>
          <div className={styles.teamName} style={{ color: colorA }}>{teamA}</div>
        </div>

        {/* Placar central */}
        <div className={styles.center}>
          <div className={styles.scoreWrap}>
            <motion.span
              key={scoreA}
              className={styles.scoreNum}
              initial={{ scale: 1.5, color: '#f59e0b' }}
              animate={{ scale: 1,   color: '#ffffff' }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >{scoreA}</motion.span>

            <span className={styles.scoreSep}>–</span>

            <motion.span
              key={`b${scoreB}`}
              className={styles.scoreNum}
              initial={{ scale: 1.5, color: '#f59e0b' }}
              animate={{ scale: 1,   color: '#ffffff' }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >{scoreB}</motion.span>
          </div>

          <div className={styles.matchMeta}>
            <span className={styles.timeBadge}>{formatTime(timerSec)}</span>
            {timerRunning && <span className={styles.liveDot} />}
            <span className={styles.matchStatus}>
              {timerRunning ? 'Ao Vivo' : timerSec > 0 ? 'Pausado' : 'Aguardando'}
            </span>
          </div>
        </div>

        {/* Visitante — texto alinhado à esquerda, encostado no placar */}
        <div className={styles.teamRight}>
          <div className={styles.teamRole}>Visitante</div>
          <div className={styles.teamName} style={{ color: colorB }}>{teamB}</div>
        </div>
      </div>
    </div>
  )
}
