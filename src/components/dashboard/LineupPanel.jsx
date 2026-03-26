import React from 'react'
import { useMatchStore } from '../../store/matchStore'
import styles from './LineupPanel.module.css'

function PlayerRow({ player, color }) {
  const initials = player.name.split(' ').map((n) => n[0]).slice(0, 2).join('')
  return (
    <div className={styles.row}>
      <span className={styles.num}>{player.num}</span>
      <div className={styles.avatar} style={{ background: color + '22', color, borderColor: color + '55' }}>
        {initials}
      </div>
      <div className={styles.info}>
        <div className={styles.name}>{player.name}</div>
        <div className={styles.pos}>{player.pos}</div>
      </div>
      <div className={styles.cards}>
        {player.cards.map((c, i) => (
          <span key={i} className={`${styles.card} ${c === 'yellow' ? styles.yellow : styles.red}`}>
            {c === 'yellow' ? 'A' : 'V'}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function LineupPanel({ team }) {
  const { teamA, teamB, colorA, colorB, lineupA, lineupB } = useMatchStore()
  const isA = team === 'a'
  const lineup = isA ? lineupA : lineupB
  const color = isA ? colorA : colorB
  const name = isA ? teamA : teamB

  return (
    <div className={`${styles.panel} ${!isA ? styles.right : ''}`}>
      <div className={styles.title}>{name} — Escalação</div>
      {lineup.map((p) => (
        <PlayerRow key={p.num} player={p} color={color} />
      ))}
    </div>
  )
}
