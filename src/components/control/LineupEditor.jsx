import React, { useState, useEffect } from 'react'
import { useMatchStore } from '../../store/matchStore'
import styles from './ControlSection.module.css'

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
        onChange={(e) => onChange(index, 'num', e.target.value)}
        placeholder="#"
      />
      <input
        className={styles.inputSm}
        style={{ flex: 1 }}
        value={player.name}
        onChange={(e) => onChange(index, 'name', e.target.value)}
        placeholder="Nome do jogador"
      />
      <select
        className={styles.selectSm}
        style={{ width: 70 }}
        value={player.pos}
        onChange={(e) => onChange(index, 'pos', e.target.value)}
      >
        {['GOL','LAD','LAE','ZAG','VOL','MEI','ATA','CA','MA'].map(p => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>
      <button className={`${styles.btn} ${styles.btnDanger} ${styles.btnXs}`} onClick={() => onRemove(index)}>✕</button>
    </div>
  )
}

export default function LineupEditor() {
  const { teamA, teamB, lineupA, lineupB, updateLineup } = useMatchStore()
  const [activeTeam, setActiveTeam] = useState('a')

  const lineup = activeTeam === 'a' ? lineupA : lineupB
  const [local, setLocal] = useState(lineup.map(p => ({ ...p })))

  // Atualiza local quando troca de time
  useEffect(() => {
    const src = activeTeam === 'a' ? lineupA : lineupB
    setLocal(src.map(p => ({ ...p })))
  }, [activeTeam])

  const handleChange = (idx, field, val) => {
    setLocal(prev => prev.map((p, i) => i === idx ? { ...p, [field]: field === 'num' ? Number(val) : val } : p))
  }

  const handleRemove = (idx) => {
    setLocal(prev => prev.filter((_, i) => i !== idx))
  }

  const handleAdd = () => {
    setLocal(prev => [...prev, { num: prev.length + 1, name: '', pos: 'MEI', cards: [] }])
  }

  const handleSave = () => {
    const cleaned = local.filter(p => p.name.trim() !== '').map(p => ({ ...p, cards: p.cards || [] }))
    updateLineup(activeTeam, cleaned)
  }

  const teamName = activeTeam === 'a' ? teamA : teamB

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>📋 Escalações</div>
      <div className={styles.body}>
        {/* Team tabs */}
        <div className={styles.teamToggle}>
          <button
            className={`${styles.toggleBtn} ${activeTeam === 'a' ? styles.toggleActive : ''}`}
            onClick={() => setActiveTeam('a')}
          >{teamA}</button>
          <button
            className={`${styles.toggleBtn} ${activeTeam === 'b' ? styles.toggleActive : ''}`}
            onClick={() => setActiveTeam('b')}
          >{teamB}</button>
        </div>

        {/* Header */}
        <div className={styles.playerEditHeader}>
          <span style={{ width: 48, textAlign: 'center' }}>#</span>
          <span style={{ flex: 1 }}>Nome</span>
          <span style={{ width: 70 }}>Pos</span>
          <span style={{ width: 32 }}></span>
        </div>

        {/* Players */}
        <div className={styles.playerEditList}>
          {local.map((p, i) => (
            <PlayerEditRow key={i} player={p} index={i} onChange={handleChange} onRemove={handleRemove} />
          ))}
        </div>

        {/* Actions */}
        <div className={styles.btnRow} style={{ marginTop: 10 }}>
          <button className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`} onClick={handleAdd}>+ Jogador</button>
          <button className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSm}`} onClick={handleSave}>✓ Salvar {teamName}</button>
        </div>
      </div>
    </div>
  )
}
