import React from 'react'
import { useMatchStore } from '../../store/matchStore'
import styles from './ControlSection.module.css'

export default function ScoreControl() {
  const { teamA, teamB, scoreA, scoreB, addGoal, removeGoal, resetScore } = useMatchStore()

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>⚽ Placar</div>
      <div className={styles.body}>
        <div className={styles.scoreGrid}>
          {/* Team A */}
          <div className={styles.scoreTeam}>
            <div className={styles.scoreTeamLabel}>{teamA}</div>
            <div className={styles.scoreBig}>{scoreA}</div>
            <div className={styles.btnRow} style={{ justifyContent: 'center' }}>
              <button className={`${styles.btn} ${styles.btnGreen} ${styles.btnSm}`} onClick={() => addGoal('a')}>+ Gol</button>
              <button className={`${styles.btn} ${styles.btnRed} ${styles.btnSm}`} onClick={() => removeGoal('a')}>- Rem</button>
            </div>
          </div>

          <div className={styles.scoreSep}>×</div>

          {/* Team B */}
          <div className={styles.scoreTeam}>
            <div className={styles.scoreTeamLabel}>{teamB}</div>
            <div className={styles.scoreBig}>{scoreB}</div>
            <div className={styles.btnRow} style={{ justifyContent: 'center' }}>
              <button className={`${styles.btn} ${styles.btnGreen} ${styles.btnSm}`} onClick={() => addGoal('b')}>+ Gol</button>
              <button className={`${styles.btn} ${styles.btnRed} ${styles.btnSm}`} onClick={() => removeGoal('b')}>- Rem</button>
            </div>
          </div>
        </div>

        <button className={`${styles.btn} ${styles.btnGhost} ${styles.btnFull}`} onClick={resetScore} style={{ marginTop: 10 }}>
          ↺ Zerar Placar
        </button>
      </div>
    </div>
  )
}
