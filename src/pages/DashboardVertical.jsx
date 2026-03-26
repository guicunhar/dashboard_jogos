import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMatchStore, formatTime } from '../store/matchStore'
import FlashOverlay from '../components/dashboard/FlashOverlay'
import CameraLayout from '../components/dashboard/CameraLayout'
import styles from './DashboardVertical.module.css'

// ── ScoreBoard ──
function VerticalScoreBoard() {
  const { teamA, teamB, colorA, colorB, scoreA, scoreB, timerSec, timerRunning, competition } = useMatchStore()

  return (
    <div className={styles.scoreboard}>
      <div className={styles.accentLine} />
      <div className={styles.compRow}>
        <span className={styles.compDot} style={{ background: colorA }} />
        <span className={styles.compName}>{competition}</span>
        <span className={styles.compDot} style={{ background: colorB }} />
      </div>
      <div className={styles.scoreRow}>
        <div className={styles.teamBlock}>
          <div className={styles.teamBadge} style={{ background: colorA + '22', borderColor: colorA, color: colorA }}>
            {teamA.substring(0, 3).toUpperCase()}
          </div>
          <div className={styles.teamName} style={{ color: colorA }}>{teamA}</div>
          <div className={styles.teamRole}>Casa</div>
        </div>

        <div className={styles.scoreCenter}>
          <div className={styles.scoreWrap}>
            <motion.span key={scoreA} className={styles.scoreNum}
              initial={{ scale: 1.6, color: '#f59e0b' }} animate={{ scale: 1, color: '#fff' }}
              transition={{ type: 'spring', stiffness: 350, damping: 22 }}
            >{scoreA}</motion.span>
            <span className={styles.scoreSep}>–</span>
            <motion.span key={`b${scoreB}`} className={styles.scoreNum}
              initial={{ scale: 1.6, color: '#f59e0b' }} animate={{ scale: 1, color: '#fff' }}
              transition={{ type: 'spring', stiffness: 350, damping: 22 }}
            >{scoreB}</motion.span>
          </div>
          <div className={styles.timeBadge}>
            {timerRunning && <span className={styles.liveDot} />}
            {formatTime(timerSec)}
          </div>
        </div>

        <div className={`${styles.teamBlock} ${styles.teamBlockRight}`}>
          <div className={styles.teamBadge} style={{ background: colorB + '22', borderColor: colorB, color: colorB }}>
            {teamB.substring(0, 3).toUpperCase()}
          </div>
          <div className={styles.teamName} style={{ color: colorB }}>{teamB}</div>
          <div className={styles.teamRole}>Visit.</div>
        </div>
      </div>
    </div>
  )
}

// ── Eventos — preenche a zona fixa ──
function VerticalEvents() {
  const { events, teamA, teamB, colorA, colorB } = useMatchStore()
  const getColor = (t) => t === 'a' ? colorA : t === 'b' ? colorB : '#64748b'
  const getName  = (t) => t === 'a' ? teamA  : t === 'b' ? teamB  : ''

  return (
    <div className={styles.eventsPanel}>
      <div className={styles.eventsLabel}>
        <span className={styles.eventsLabelDot} />
        ⚡ Eventos da Partida
      </div>
      <div className={styles.eventsList}>
        {events.length === 0 && (
          <span className={styles.eventsEmpty}>Nenhum evento ainda...</span>
        )}
        <AnimatePresence initial={false}>
          {events.map(ev => (
            <motion.div key={ev.id} className={styles.eventItem} style={{ borderLeftColor: ev.borderColor }}
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <span className={styles.eventMin}>{ev.min}</span>
              <span className={styles.eventIcon}>{ev.icon}</span>
              <span className={styles.eventName}>{ev.name}</span>
              {ev.team && (
                <span className={styles.eventTag} style={{ background: getColor(ev.team) + '33', color: getColor(ev.team) }}>
                  {getName(ev.team).substring(0, 3).toUpperCase()}
                </span>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ── Page ──
export default function DashboardVertical() {
  const requestSync = useMatchStore(s => s.requestSync)
  const cameraCount = useMatchStore(s => s.cameraCount)

  useEffect(() => { requestSync() }, [])

  return (
    <div className={styles.wrapper}>
      <div className={styles.canvas}>

        {/* 1 — Placar */}
        <VerticalScoreBoard />

        {/* 2 — Câmera */}
        <div className={styles.cameraZone}>
          <CameraLayout count={cameraCount} />
        </div>

        {/* 3 — Eventos: sempre visível, altura fixa */}
        <div className={styles.eventsFixed}>
          <VerticalEvents />
        </div>

      </div>
      <FlashOverlay />
    </div>
  )
}
