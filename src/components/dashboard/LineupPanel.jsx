import React from 'react'
import { useMatchStore } from '../../store/matchStore'
import styles from './LineupPanel.module.css'

function PlayerRow({ player, color }) {
  return (
    <div className={styles.row}>
      <div className={styles.numBall} style={{ background: color + '22', color, borderColor: color + '88' }}>
        {player.num}
      </div>
      <div className={styles.info}>
        <div className={styles.name}>{player.name}</div>
        <div className={styles.pos}>{player.pos}</div>
      </div>
      <div className={styles.cards}>
        {player.cards.map((c, i) => (
          <span key={i} className={`${styles.card} ${c === 'yellow' ? styles.yellow : styles.red}`}>
            {c === 'yellow' ? '🟨' : '🟥'}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function LineupPanel({ team }) {
  const { teamA, teamB, colorA, colorB, lineupA, lineupB } = useMatchStore()
  const isA   = team === 'a'
  const lineup = isA ? lineupA : lineupB
  const color  = isA ? colorA : colorB
  const name   = isA ? teamA  : teamB

  return (
    <div className={`${styles.panel} ${!isA ? styles.right : ''}`}>
      <div className={styles.title} style={{ borderBottomColor: color + '55', color }}>
        {name}
      </div>
      {lineup.map((p, i) => (
        <PlayerRow key={i} player={p} color={color} />
      ))}
    </div>
  )
}
