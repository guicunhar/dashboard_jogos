import React, { useState, useEffect, useRef } from 'react'
import { useMatchStore } from '../../store/matchStore'
import styles from './ControlSection.module.css'

// ─────────────────────────────────────────────────────────────
//  Parsear JSON SofaScore → array de jogadores do dashboard
// ─────────────────────────────────────────────────────────────
function parseSofaScore(json, side) {
  let players = null

  if (json[side]?.players) {
    players = json[side].players
  } else if (Array.isArray(json.players)) {
    players = json.players
  } else if (Array.isArray(json)) {
    players = json
  }

  if (!players) {
    throw new Error(`Não encontrei "players" para "${side}" no JSON.`)
  }

  return players
    .filter(p => !p.substitute)
    .map((p, i) => ({
      num: Number(p.shirtNumber || p.jerseyNumber) || i + 1,
      name: String(
        p.player?.shortName ||
        p.player?.name ||
        `Jogador ${i + 1}`
      ),
      cards: [],
    }))
}

// ─────────────────────────────────────────────────────────────
//  Linha de edição manual
// ─────────────────────────────────────────────────────────────
function PlayerEditRow({ player, index, onChange, onRemove }) {
  return (
    <div className={styles.playerEditRow}>
      <input
        className={styles.inputSm}
        style={{ width: 48, textAlign: 'center' }}
        type="number"
        min="1"
        max="99"
        value={player.num}
        onChange={e => onChange(index, 'num', e.target.value)}
        placeholder="#"
      />

      <input
        className={styles.inputSm}
        style={{ flex: 1 }}
        value={player.name}
        onChange={e => onChange(index, 'name', e.target.value)}
        placeholder="Nome do jogador"
      />

      <button
        className={`${styles.btn} ${styles.btnDanger} ${styles.btnXs}`}
        onClick={() => onRemove(index)}
      >
        ✕
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
//  Aba: Edição Manual
// ─────────────────────────────────────────────────────────────
function ManualMode({ activeTeam, teamName }) {
  const { lineupA, lineupB, updateLineup } = useMatchStore()
  const src = activeTeam === 'a' ? lineupA : lineupB
  const [local, setLocal] = useState(src.map(p => ({ ...p })))

  useEffect(() => {
    const s = activeTeam === 'a' ? lineupA : lineupB
    setLocal(s.map(p => ({ ...p })))
  }, [activeTeam, lineupA, lineupB])

  const handleChange = (idx, field, val) => {
    setLocal(prev =>
      prev.map((p, i) =>
        i === idx
          ? { ...p, [field]: field === 'num' ? Number(val) : val }
          : p
      )
    )
  }

  const handleRemove = idx =>
    setLocal(prev => prev.filter((_, i) => i !== idx))

