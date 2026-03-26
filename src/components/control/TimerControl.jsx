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
          {timerRunning
            ? <button className={`${styles.btn} ${styles.btnGhost}`} style={{ flex: 1 }} onClick={pauseTimer}>⏸ Pausar</button>
            : <button className={`${styles.btn} ${styles.btnGreen}`} style={{ flex: 1 }} onClick={startTimer}>▶ Iniciar</button>
          }
          <button className={`${styles.btn} ${styles.btnGhost}`} onClick={resetTimer}>↺ Reset</button>
        </div>
        <div className={styles.inputRow} style={{ marginTop: 10 }}>
          <input
            className={styles.input}
            type="number"
            min="0"
            max="120"
            placeholder="Pular para minuto..."
            value={manualMin}
            onChange={e => setManualMin(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSetTime()}
            style={{ flex: 1 }}
          />
          <button className={`${styles.btn} ${styles.btnBlue}`} onClick={handleSetTime}>Ir</button>
        </div>
      </div>
    </div>
  )
}
