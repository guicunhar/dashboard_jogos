import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMatchStore } from '../../store/matchStore'
import styles from './EventFeed.module.css'

const ITEM_ANIM = {
  initial:    { opacity: 0, x: -20, scale: 0.9 },
  animate:    { opacity: 1, x: 0,   scale: 1   },
  exit:       { opacity: 0, x: 20              },
  transition: { type: 'spring', stiffness: 320, damping: 28 },
}

export default function EventFeed() {
  const { events, teamA, teamB, colorA, colorB } = useMatchStore()

  const getTeamName  = (t) => t === 'a' ? teamA  : t === 'b' ? teamB  : ''
  const getTeamColor = (t) => t === 'a' ? colorA : t === 'b' ? colorB : '#64748b'

  return (
    <div className={styles.panel}>
      {/* Vertical label on the left */}
      <div className={styles.titleStrip}>Eventos</div>

      {events.length === 0 && (
        <span className={styles.empty}>Nenhum evento ainda</span>
      )}

      <AnimatePresence initial={false}>
        {events.map((ev) => (
          <motion.div
            key={ev.id}
            className={styles.item}
            style={{ borderLeftColor: ev.borderColor }}
            {...ITEM_ANIM}
          >
            <div className={styles.itemTop}>
              <span className={styles.time}>{ev.min}</span>
              <span className={styles.icon}>{ev.icon}</span>
            </div>
            <div className={styles.eventName}>{ev.name}</div>
            {ev.sub && <div className={styles.eventSub}>{ev.sub}</div>}
            {ev.team && (
              <span
                className={styles.teamTag}
                style={{ background: getTeamColor(ev.team) + '22', color: getTeamColor(ev.team) }}
              >
                {getTeamName(ev.team).substring(0, 3).toUpperCase()}
              </span>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

