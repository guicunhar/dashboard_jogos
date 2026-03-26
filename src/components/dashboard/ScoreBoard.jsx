import React from 'react'
import { motion } from 'framer-motion'
import { useMatchStore, formatTime } from '../../store/matchStore'
import styles from './ScoreBoard.module.css'

export default function ScoreBoard() {
  const { teamA, teamB, colorA, colorB, scoreA, scoreB, timerSec, timerRunning } = useMatchStore()

  const shortA = teamA.toUpperCase().substring(0, 3)
  const shortB = teamB.toUpperCase().substring(0, 3)

  return (
    <div className={styles.scoreboard}>
      <div className={styles.topLine} />

      <div className={styles.row}>
        {/* Team A */}
        <div className={styles.teamSide}>
          <div className={styles.badge} style={{ background: colorA + '22', color: colorA, borderColor: colorA }}>
            {shortA}
          </div>
          <div className={styles.teamInfo}>
            <div className={styles.teamName}>{teamA}</div>
            <div className={styles.teamSub}>Time da Casa</div>
          </div>
        </div>

        {/* Score center */}
        <div className={styles.center}>
          <div className={styles.scoreWrap}>
            <motion.span
              key={scoreA}
              className={styles.scoreNum}
              initial={{ scale: 1.4, color: '#f59e0b' }}
              animate={{ scale: 1, color: '#ffffff' }}
              transition={{ duration: 0.4 }}
            >
              {scoreA}
            </motion.span>
            <span className={styles.scoreSep}>:</span>
            <motion.span
              key={scoreB + 100}
              className={styles.scoreNum}
              initial={{ scale: 1.4, color: '#f59e0b' }}
              animate={{ scale: 1, color: '#ffffff' }}
              transition={{ duration: 0.4 }}
            >
              {scoreB}
            </motion.span>
          </div>
          <div className={styles.matchMeta}>
            <span className={styles.timeBadge}>{formatTime(timerSec)}</span>
            {timerRunning && <span className={styles.liveDot} />}
            <span className={styles.matchStatus}>{timerRunning ? 'Ao Vivo' : timerSec > 0 ? 'Pausado' : 'Aguardando'}</span>
          </div>
        </div>

        {/* Team B */}
        <div className={`${styles.teamSide} ${styles.right}`}>
          <div className={styles.teamInfo} style={{ textAlign: 'right' }}>
            <div className={styles.teamName}>{teamB}</div>
            <div className={styles.teamSub}>Visitante</div>
          </div>
          <div className={styles.badge} style={{ background: colorB + '22', color: colorB, borderColor: colorB }}>
            {shortB}
          </div>
        </div>
      </div>
    </div>
  )
}
