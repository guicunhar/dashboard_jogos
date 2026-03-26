import React from 'react'
import styles from './CameraLayout.module.css'

const LABELS = ['CAM 1','CAM 2','CAM 3','CAM 4','CAM 5','CAM 6']

export default function CameraLayout({ count }) {
  const cams = Array.from({ length: count }, (_, i) => i)

  return (
    <div className={`${styles.grid} ${styles['g' + count]}`}>
      {cams.map(i => (
        <div key={i} className={styles.slot}>
          <div className={styles.camIcon}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="6" width="15" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M17 9l5-3v12l-5-3V9z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
              <circle cx="9.5" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </div>
          <div className={styles.camLabel}>{LABELS[i]}</div>
        </div>
      ))}
    </div>
  )
}
