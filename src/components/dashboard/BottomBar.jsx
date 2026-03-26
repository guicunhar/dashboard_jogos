import React from 'react'
import { useMatchStore } from '../../store/matchStore'
import styles from './BottomBar.module.css'

export default function BottomBar() {
  const { competition, timerRunning } = useMatchStore()
  return (
    <div className={styles.bar}>
      <div className={styles.comp}>
        <div className={styles.dot} />
        <span>{competition}</span>
      </div>
      {timerRunning && (
        <div className={styles.live}>
          <span className={styles.liveDot} />
          AO VIVO
        </div>
      )}
      <div className={styles.brand}>⚡ Football Broadcast v1.0</div>
    </div>
  )
}
