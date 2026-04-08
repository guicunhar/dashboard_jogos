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

  const handleAdd = () => {
    setLocal(prev => [
      ...prev,
      { num: prev.length + 1, name: '', cards: [] },
    ])
  }

  const handleSave = () => {
    const cleaned = local
      .filter(p => p.name.trim() !== '')
      .map(p => ({ ...p, cards: p.cards || [] }))
    updateLineup(activeTeam, cleaned)
  }

  return (
    <>
      <div className={styles.playerEditHeader}>
        <span style={{ width: 48, textAlign: 'center' }}>#</span>
        <span style={{ flex: 1 }}>Nome</span>
        <span style={{ width: 32 }} />
      </div>

      <div className={styles.playerEditList}>
        {local.map((p, i) => (
          <PlayerEditRow
            key={i}
            player={p}
            index={i}
            onChange={handleChange}
            onRemove={handleRemove}
          />
        ))}
      </div>

      <div className={styles.btnRow} style={{ marginTop: 10 }}>
        <button
          className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`}
          onClick={handleAdd}
        >
          + Jogador
        </button>
        <button
          className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSm}`}
          onClick={handleSave}
        >
          ✓ Salvar {teamName}
        </button>
      </div>
    </>
  )
}

// ─────────────────────────────────────────────────────────────
//  Aba: Importar JSON
// ─────────────────────────────────────────────────────────────
function ImportMode() {
  const { teamA, teamB, updateLineup } = useMatchStore()
  const fileRef = useRef(null)

  const [jsonText, setJsonText] = useState('')
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState('')
  const [imported, setImported] = useState(false)

  const parse = text => {
    setError('')
    setPreview(null)
    setImported(false)
    if (!text.trim()) return

    let json
    try {
      json = JSON.parse(text)
    } catch {
      setError('JSON inválido.')
      return
    }

    try {
      const lineupA = parseSofaScore(json, 'home')
      const lineupB = parseSofaScore(json, 'away')

      setPreview({ lineupA, lineupB })
    } catch (e) {
      setError(e.message)
    }
  }

  const handleFile = e => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const text = ev.target.result
      setJsonText(text)
      parse(text)
    }
    reader.readAsText(file)
  }

  const handleImport = () => {
    if (!preview) return
    updateLineup('a', preview.lineupA)
    updateLineup('b', preview.lineupB)
    setImported(true)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <button
        className={`${styles.btn} ${styles.btnBlue} ${styles.btnSm}`}
        onClick={() => fileRef.current?.click()}
      >
        📂 Carregar arquivo .json
      </button>

      <input
        ref={fileRef}
        type="file"
        accept=".json,application/json"
        style={{ display: 'none' }}
        onChange={handleFile}
      />

      <textarea
        className={styles.jsonTextarea}
        placeholder="Cole o JSON da SofaScore aqui..."
        value={jsonText}
        onChange={e => {
          setJsonText(e.target.value)
          parse(e.target.value)
        }}
      />

      {error && <div className={styles.apiError}>Erro: {error}</div>}

      {preview && !imported && (
        <button
          className={`${styles.btn} ${styles.btnPrimary}`}
          onClick={handleImport}
        >
          ✓ Importar Escalações
        </button>
      )}

      {imported && (
        <div className={styles.apiSuccess}>
          ✅ Escalações importadas com sucesso
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
//  Componente principal
// ─────────────────────────────────────────────────────────────
export default function LineupEditor() {
  const { teamA, teamB } = useMatchStore()
  const [activeTeam, setActiveTeam] = useState('a')
  const [mode, setMode] = useState('manual')

  const teamName = activeTeam === 'a' ? teamA : teamB

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>📋 Escalações</div>

      <div className={styles.modeToggle}>
        <button
          className={`${styles.modeBtn} ${
            mode === 'manual' ? styles.modeBtnActive : ''
          }`}
          onClick={() => setMode('manual')}
        >
          ✏️ Manual
        </button>
        <button
          className={`${styles.modeBtn} ${
            mode === 'import' ? styles.modeBtnActive : ''
          }`}
          onClick={() => setMode('import')}
        >
          📥 Importar JSON
        </button>
      </div>

      {mode === 'manual' && (
        <div className={styles.teamToggle}>
          <button
            className={`${styles.toggleBtn} ${
              activeTeam === 'a' ? styles.toggleActive : ''
            }`}
            onClick={() => setActiveTeam('a')}
          >
            {teamA}
          </button>
          <button
            className={`${styles.toggleBtn} ${
              activeTeam === 'b' ? styles.toggleActive : ''
            }`}
            onClick={() => setActiveTeam('b')}
          >
            {teamB}
          </button>
        </div>
      )}

      {mode === 'manual' ? (
        <ManualMode activeTeam={activeTeam} teamName={teamName} />
      ) : (
        <ImportMode />
      )}
    </div>
  )
}