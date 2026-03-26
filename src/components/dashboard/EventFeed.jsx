import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMatchStore } from '../../store/matchStore'
import styles from './EventFeed.module.css'

const EVENT_ANIM = {
  initial: { opacity: 0, y: -12, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit:    { opacity: 0, x: -20 },
  transition: { type: 'spring', stiffness: 300, damping: 28 },
}

export default function EventFeed() {
  const { events, teamA, teamB, colorA, colorB } = useMatchStore()

  const getTeamName = (team) => team === 'a' ? teamA : team === 'b' ? teamB : ''
  const getTeamColor = (team) => team === 'a' ? colorA : team === 'b' ? colorB : '#64748b'

  return (
    <div className={styles.panel}>
      <div className={styles.title}>⚽ Eventos da Partida</div>

      {events.length === 0 && (
        <div className={styles.empty}>Nenhum evento registrado ainda</div>
      )}

      <AnimatePresence initial={false}>
        {events.map((ev, i) => (
          <motion.div
            key={ev.id}
            className={styles.item}
            style={{ borderLeftColor: ev.borderColor }}
            {...EVENT_ANIM}
          >
            <div className={styles.time}>{ev.min}</div>
            <div className={styles.icon}>{ev.icon}</div>
            <div className={styles.detail}>
              <div className={styles.eventName}>{ev.name}</div>
              {ev.sub && <div className={styles.eventSub}>{ev.sub}</div>}
            </div>
            {ev.team && (
              <span
                className={styles.teamTag}
                style={{ background: getTeamColor(ev.team) + '22', color: getTeamColor(ev.team) }}
              >
                {getTeamName(ev.team).toUpperCase().substring(0, 3)}
              </span>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
