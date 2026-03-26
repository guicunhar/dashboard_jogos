import React, { useState } from 'react'
import { useMatchStore, currentMin } from '../../store/matchStore'
import styles from './ControlSection.module.css'

let eventId = 0
const nextId = () => `ev_${++eventId}`

// ── GOL: flash imediato ao clicar no time, depois informa marcador ──
function GoalLogger({ teamA, teamB, colorA, colorB, lineupA, lineupB, timerSec }) {
  const { addGoal, addEvent, showFlash } = useMatchStore()
  const [step, setStep] = useState(1)   // 1 = escolher time, 2 = quem fez
  const [team, setTeam] = useState(null)
  const [player, setPlayer] = useState('')
  const [pendingMin, setPendingMin] = useState('')

  const lineup = team === 'a' ? lineupA : lineupB
  const teamColor = (t) => t === 'a' ? colorA : colorB
  const teamName  = (t) => t === 'a' ? teamA  : teamB

  // Passo 1: clique no time → gol contabilizado + flash IMEDIATO
  const handleTeamClick = (t) => {
    const min = currentMin(timerSec)
    addGoal(t)
    showFlash('⚽  GOL!', '#f59e0b')
    setTeam(t)
    setPendingMin(min)
    setPlayer('')
    setStep(2)
  }

  // Passo 2: informa marcador (opcional) e registra evento no feed
  const confirmScorer = () => {
    const pl = player || '(marcador a definir)'
    addEvent({
      id: nextId(),
      min: pendingMin,
      icon: '⚽',
      name: `GOL! — ${pl}`,
      sub: teamName(team),
      team,
      borderColor: teamColor(team),
    })
    setStep(1)
    setTeam(null)
    setPlayer('')
  }

  const skipScorer = () => {
    addEvent({
      id: nextId(),
      min: pendingMin,
      icon: '⚽',
      name: `GOL! — ${teamName(team)}`,
      sub: '',
      team,
      borderColor: teamColor(team),
    })
    setStep(1)
    setTeam(null)
    setPlayer('')
  }

  return (
    <div className={styles.eventBlock}>
      <div className={styles.eventBlockLabel}>⚽ Gol</div>

      {step === 1 ? (
        <div className={styles.btnRow}>
          <button
            className={`${styles.btn} ${styles.btnTeam}`}
            style={{ borderColor: colorA, color: colorA }}
            onClick={() => handleTeamClick('a')}
          >{teamA}</button>
          <button
            className={`${styles.btn} ${styles.btnTeam}`}
            style={{ borderColor: colorB, color: colorB }}
            onClick={() => handleTeamClick('b')}
          >{teamB}</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div className={styles.stepNote}>
            ✅ Gol de <strong style={{ color: teamColor(team) }}>{teamName(team)}</strong> registrado!
            Quem marcou?
          </div>
          <select
            className={styles.select}
            style={{ width: '100%' }}
            value={player}
            onChange={e => setPlayer(e.target.value)}
          >
            <option value="">— Selecionar marcador —</option>
            {lineup.map(p => (
              <option key={p.num} value={p.name}>{p.num} · {p.name}</option>
            ))}
          </select>
          <div className={styles.btnRow}>
            <button className={`${styles.btn} ${styles.btnPrimary}`} style={{ flex: 1 }} onClick={confirmScorer}>
              ✓ Confirmar
            </button>
            <button className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`} onClick={skipScorer}>
              Pular
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── CARTÃO: 2 passos ──
function CardLogger({ teamA, teamB, colorA, colorB, lineupA, lineupB, timerSec }) {
  const { addCardToPlayer, addEvent, showFlash } = useMatchStore()
  const [step, setStep] = useState(1)
  const [team, setTeam] = useState('a')
  const [player, setPlayer] = useState('')

  const lineup = team === 'a' ? lineupA : lineupB
  const min = currentMin(timerSec)

  const goStep2 = (t) => { setTeam(t); setPlayer(''); setStep(2) }

  const confirm = (type) => {
    const pl = player || lineup[0]?.name || 'Jogador'
    addCardToPlayer(team, pl, type)
    if (type === 'yellow') {
      useMatchStore.setState(s => ({ stats: { ...s.stats, yellows: s.stats.yellows + 1 } }))
      addEvent({ id: nextId(), min, icon: '🟨', name: `Cartão Amarelo — ${pl}`, team, borderColor: '#eab308' })
      showFlash('🟨  AMARELO', '#eab308')
    } else {
      useMatchStore.setState(s => ({ stats: { ...s.stats, reds: s.stats.reds + 1 } }))
      addEvent({ id: nextId(), min, icon: '🟥', name: `Cartão Vermelho — ${pl}`, team, borderColor: '#ef4444' })
      showFlash('🟥  VERMELHO!', '#ef4444')
    }
    setStep(1)
    setPlayer('')
  }

  return (
    <div className={styles.eventBlock}>
      <div className={styles.eventBlockLabel}>🟨 Cartão</div>
      {step === 1 ? (
        <div className={styles.btnRow}>
          <button className={`${styles.btn} ${styles.btnTeam}`} style={{ borderColor: colorA, color: colorA }} onClick={() => goStep2('a')}>{teamA}</button>
          <button className={`${styles.btn} ${styles.btnTeam}`} style={{ borderColor: colorB, color: colorB }} onClick={() => goStep2('b')}>{teamB}</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <select className={styles.select} style={{ width: '100%' }} value={player} onChange={e => setPlayer(e.target.value)}>
            <option value="">— Quem levou o cartão? —</option>
            {lineup.map(p => <option key={p.num} value={p.name}>{p.num} · {p.name}</option>)}
          </select>
          <div className={styles.btnRow}>
            <button className={`${styles.btn} ${styles.btnYellow}`} style={{ flex: 1 }} onClick={() => confirm('yellow')}>🟨 Amarelo</button>
            <button className={`${styles.btn} ${styles.btnRed}`} style={{ flex: 1 }} onClick={() => confirm('red')}>🟥 Vermelho</button>
            <button className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`} onClick={() => setStep(1)}>✕</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── SUBSTITUIÇÃO: altera a escalação ──
function SubLogger({ teamA, teamB, colorA, colorB, lineupA, lineupB, timerSec }) {
  const { addEvent, updateLineup } = useMatchStore()
  const [team, setTeam] = useState('a')
  const [playerOut, setPlayerOut] = useState('')
  const [playerInName, setPlayerInName] = useState('')
  const [playerInNum, setPlayerInNum] = useState('')

  const lineup = team === 'a' ? lineupA : lineupB
  const teamColor = (t) => t === 'a' ? colorA : colorB
  const min = currentMin(timerSec)

  const confirm = () => {
    if (!playerOut) return
    const inName = playerInName.trim() || 'Jogador'
    const inNum = playerInNum ? Number(playerInNum) : 99
    const newLineup = lineup.map(p =>
      p.name === playerOut ? { ...p, name: inName, num: inNum, cards: [] } : p
    )
    updateLineup(team, newLineup)
    useMatchStore.setState(s => ({ stats: { ...s.stats, subs: s.stats.subs + 1 } }))
    addEvent({
      id: nextId(), min, icon: '🔄',
      name: 'Substituição',
      sub: `↑ ${inName}  ↓ ${playerOut}`,
      team,
      borderColor: teamColor(team),
    })
    setPlayerOut('')
    setPlayerInName('')
    setPlayerInNum('')
  }

  return (
    <div className={styles.eventBlock}>
      <div className={styles.eventBlockLabel}>🔄 Substituição</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div className={styles.btnRow}>
          <button className={`${styles.btn} ${styles.btnSm} ${team === 'a' ? styles.btnPrimary : styles.btnGhost}`} onClick={() => { setTeam('a'); setPlayerOut('') }}>{teamA}</button>
          <button className={`${styles.btn} ${styles.btnSm} ${team === 'b' ? styles.btnPrimary : styles.btnGhost}`} onClick={() => { setTeam('b'); setPlayerOut('') }}>{teamB}</button>
        </div>
        <select className={styles.select} style={{ width: '100%' }} value={playerOut} onChange={e => setPlayerOut(e.target.value)}>
          <option value="">↓ Quem SAI?</option>
          {lineup.map(p => <option key={p.num} value={p.name}>{p.num} · {p.name}</option>)}
        </select>
        <div className={styles.inputRow}>
          <input className={styles.input} style={{ width: 60 }} placeholder="#" type="number" value={playerInNum} onChange={e => setPlayerInNum(e.target.value)} />
          <input className={styles.input} style={{ flex: 1 }} placeholder="↑ Nome de quem ENTRA" value={playerInName} onChange={e => setPlayerInName(e.target.value)} />
        </div>
        <button className={`${styles.btn} ${styles.btnBlue} ${styles.btnFull}`} onClick={confirm} disabled={!playerOut}>
          🔄 Confirmar Substituição
        </button>
      </div>
    </div>
  )
}

// ── EVENTO LIVRE ──
function FreeLogger({ timerSec }) {
  const { addEvent } = useMatchStore()
  const [text, setText] = useState('')
  const min = currentMin(timerSec)

  const confirm = () => {
    if (!text.trim()) return
    addEvent({ id: nextId(), min, icon: '📋', name: text.trim(), borderColor: '#64748b' })
    setText('')
  }

  return (
    <div className={styles.eventBlock}>
      <div className={styles.eventBlockLabel}>📋 Evento Livre</div>
      <div className={styles.inputRow}>
        <input className={styles.input} style={{ flex: 1 }} placeholder="VAR, Intervalo, Pênalti..." value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && confirm()} />
        <button className={`${styles.btn} ${styles.btnGhost}`} onClick={confirm}>+ Add</button>
      </div>
    </div>
  )
}

export default function EventLogger() {
  const { teamA, teamB, colorA, colorB, lineupA, lineupB, timerSec } = useMatchStore()
  const props = { teamA, teamB, colorA, colorB, lineupA, lineupB, timerSec }

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>⚡ Registrar Eventos</div>
      <div className={styles.body} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <GoalLogger {...props} />
        <CardLogger {...props} />
        <SubLogger {...props} />
        <FreeLogger timerSec={timerSec} />
      </div>
    </div>
  )
}
