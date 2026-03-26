import React, { useState } from 'react'
import { useMatchStore, formatTime } from '../../store/matchStore'
import styles from './ControlSection.module.css'

export default function TimerControl() {
  const { timerSec, timerRunning, startTimer, pauseTimer, resetTimer, setTimerMin } = useMatchStore()
  const [manualMin, setManualMin] = useState('')

  const handleSetTime = () => {
    const val = parseInt(manualMin)
    if (!isNaN(val) && val >= 0) {
      setTimerMin(val)
      setManualMin('')
    }
  }

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>⏱ Cronômetro</div>
      <div className={styles.body}>
        <div className={styles.timerDisplay}>{formatTime(timerSec)}</div>
        <div className={styles.btnRow}>
          {timerRunning ? (
            <button className={`${styles.btn} ${styles.btnGhost}`} onClick={pauseTimer}>⏸ Pausar</button>
          ) : (
            <button className={`${styles.btn} ${styles.btnGreen}`} onClick={startTimer}>▶ Iniciar</button>
          )}
          <button className={`${styles.btn} ${styles.btnGhost}`} onClick={resetTimer}>↺ Reset</button>
          <input
            className={styles.input}
            type="number"
            min="0"
            max="120"
            placeholder="Min"
            value={manualMin}
            onChange={(e) => setManualMin(e.target.value)}
            style={{ width: 72 }}
          />
          <button className={`${styles.btn} ${styles.btnBlue} ${styles.btnSm}`} onClick={handleSetTime}>
            Definir
          </button>
        </div>
      </div>
    </div>
  )
}
