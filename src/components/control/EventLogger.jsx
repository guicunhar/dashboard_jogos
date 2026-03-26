import React, { useState } from 'react'
import { useMatchStore, currentMin } from '../../store/matchStore'
import styles from './ControlSection.module.css'

let eventId = 0
const nextId = () => `ev_${++eventId}`

export default function EventLogger() {
  const { teamA, teamB, colorA, colorB, timerSec, addGoal, addEvent, addCardToPlayer, showFlash, stats } = useMatchStore()

  const [goalTeam, setGoalTeam] = useState('a')
  const [goalPlayer, setGoalPlayer] = useState('')

  const [cardTeam, setCardTeam] = useState('a')
  const [cardPlayer, setCardPlayer] = useState('')

  const [subTeam, setSubTeam] = useState('a')
  const [subOut, setSubOut] = useState('')
  const [subIn, setSubIn] = useState('')

  const [freeText, setFreeText] = useState('')

  const min = currentMin(timerSec)
  const teamColor = (t) => t === 'a' ? colorA : colorB

  const handleGoal = () => {
    const player = goalPlayer || 'Jogador'
    addGoal(goalTeam)
    addEvent({
      id: nextId(), min, icon: '⚽',
      name: `GOL! — ${player}`,
      sub: goalTeam === 'a' ? teamA : teamB,
      team: goalTeam,
      borderColor: teamColor(goalTeam),
    })
    showFlash('⚽  GOL!', '#f59e0b')
    setGoalPlayer('')
  }

  const handleCard = (type) => {
    const player = cardPlayer || 'Jogador'
    addCardToPlayer(cardTeam, player, type)
    if (type === 'yellow') {
      useMatchStore.setState((s) => ({ stats: { ...s.stats, yellows: s.stats.yellows + 1 } }))
      addEvent({ id: nextId(), min, icon: '🟨', name: `Cartão Amarelo — ${player}`, team: cardTeam, borderColor: '#eab308' })
      showFlash('🟨  AMARELO', '#eab308')
    } else {
      useMatchStore.setState((s) => ({ stats: { ...s.stats, reds: s.stats.reds + 1 } }))
      addEvent({ id: nextId(), min, icon: '🟥', name: `Cartão Vermelho — ${player}`, team: cardTeam, borderColor: '#ef4444' })
      showFlash('🟥  VERMELHO!', '#ef4444')
    }
    setCardPlayer('')
  }

  const handleSub = () => {
    const out = subOut || '?'
    const inp = subIn  || '?'
    useMatchStore.setState((s) => ({ stats: { ...s.stats, subs: s.stats.subs + 1 } }))
    addEvent({
      id: nextId(), min, icon: '🔄',
      name: 'Substituição',
      sub: `↑ ${inp}  ↓ ${out}`,
      team: subTeam,
      borderColor: teamColor(subTeam),
    })
    setSubOut('')
    setSubIn('')
  }

  const handleFree = () => {
    if (!freeText.trim()) return
    addEvent({ id: nextId(), min, icon: '📋', name: freeText.trim(), borderColor: '#64748b' })
    setFreeText('')
  }

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>📋 Registrar Eventos</div>
      <div className={styles.body} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Gol */}
        <div className={styles.inputRow}>
          <select className={styles.select} value={goalTeam} onChange={(e) => setGoalTeam(e.target.value)} style={{ width: 130 }}>
            <option value="a">{teamA}</option>
            <option value="b">{teamB}</option>
          </select>
          <input className={styles.input} style={{ flex: 1 }} placeholder="Jogador" value={goalPlayer} onChange={(e) => setGoalPlayer(e.target.value)} />
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleGoal}>⚽ Gol!</button>
        </div>

        {/* Cartão */}
        <div className={styles.inputRow}>
          <select className={styles.select} value={cardTeam} onChange={(e) => setCardTeam(e.target.value)} style={{ width: 130 }}>
            <option value="a">{teamA}</option>
            <option value="b">{teamB}</option>
          </select>
          <input className={styles.input} style={{ flex: 1 }} placeholder="Jogador" value={cardPlayer} onChange={(e) => setCardPlayer(e.target.value)} />
          <button className={`${styles.btn} ${styles.btnYellow}`} onClick={() => handleCard('yellow')}>🟨 Amarelo</button>
          <button className={`${styles.btn} ${styles.btnRed}`} onClick={() => handleCard('red')}>🟥 Vermelho</button>
        </div>

        {/* Substituição */}
        <div className={styles.inputRow}>
          <select className={styles.select} value={subTeam} onChange={(e) => setSubTeam(e.target.value)} style={{ width: 130 }}>
            <option value="a">{teamA}</option>
            <option value="b">{teamB}</option>
          </select>
          <input className={styles.input} style={{ flex: 1 }} placeholder="Sai" value={subOut} onChange={(e) => setSubOut(e.target.value)} />
          <input className={styles.input} style={{ flex: 1 }} placeholder="Entra" value={subIn} onChange={(e) => setSubIn(e.target.value)} />
          <button className={`${styles.btn} ${styles.btnBlue}`} onClick={handleSub}>🔄 Sub</button>
        </div>

        {/* Evento livre */}
        <div className={styles.inputRow}>
          <input
            className={styles.input}
            style={{ flex: 1 }}
            placeholder="Ex: Revisão VAR, Intervalo, Pênalti..."
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleFree()}
          />
          <button className={`${styles.btn} ${styles.btnGhost}`} onClick={handleFree}>+ Adicionar</button>
        </div>
      </div>
    </div>
  )
}
