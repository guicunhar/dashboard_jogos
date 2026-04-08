import React, { useState, useEffect, useRef } from 'react'
import { useMatchStore } from '../../store/matchStore'
import styles from './ControlSection.module.css'

const POSITIONS = ['GOL','LAD','LAE','ZAG','VOL','MEI','ATA','CA','MA']

// Mapa de posições SofaScore → siglas do dashboard
const POS_MAP = { G: 'GOL', D: 'ZAG', M: 'MEI', F: 'ATA' }

// ─────────────────────────────────────────────────────────────
//  Parsear JSON SofaScore → array de jogadores do dashboard
//  Aceita tanto o formato completo { home: {...}, away: {...} }
//  quanto um sub-objeto { players: [...] }
// ─────────────────────────────────────────────────────────────
function parseSofaScore(json, side) {
  // Tenta encontrar o array de jogadores
  let players = null

  if (json[side]?.players) {
    players = json[side].players
  } else if (Array.isArray(json.players)) {
    players = json.players
  } else if (Array.isArray(json)) {
    players = json
  }

  if (!players) throw new Error(`Não encontrei "players" para "${side}" no JSON.`)

  return players
    .filter(p => !p.substitute) // apenas titulares
    .map((p, i) => {
      const pos = p.position || p.player?.position || 'M'
      return {
        num:   Number(p.shirtNumber || p.jerseyNumber) || i + 1,
        name:  String(p.player?.shortName || p.player?.name || `Jogador ${i + 1}`),
        pos:   POS_MAP[pos] || pos.toUpperCase().substring(0, 3),
        cards: [],
      }
    })
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
        type="number" min="1" max="99"
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
      <select
        className={styles.selectSm}
        style={{ width: 70 }}
        value={player.pos}
        onChange={e => onChange(index, 'pos', e.target.value)}
      >
        {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
      </select>
      <button className={`${styles.btn} ${styles.btnDanger} ${styles.btnXs}`} onClick={() => onRemove(index)}>✕</button>
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
  }, [activeTeam])

  const handleChange = (idx, field, val) =>
    setLocal(prev => prev.map((p, i) =>
      i === idx ? { ...p, [field]: field === 'num' ? Number(val) : val } : p
    ))

  const handleRemove = (idx) => setLocal(prev => prev.filter((_, i) => i !== idx))

  const handleAdd = () => setLocal(prev => [
    ...prev, { num: prev.length + 1, name: '', pos: 'MEI', cards: [] }
  ])

  const handleSave = () => {
    const cleaned = local.filter(p => p.name.trim() !== '').map(p => ({ ...p, cards: p.cards || [] }))
    updateLineup(activeTeam, cleaned)
  }

  return (
    <>
      <div className={styles.playerEditHeader}>
        <span style={{ width: 48, textAlign: 'center' }}>#</span>
        <span style={{ flex: 1 }}>Nome</span>
        <span style={{ width: 70 }}>Pos</span>
        <span style={{ width: 32 }} />
      </div>
      <div className={styles.playerEditList}>
        {local.map((p, i) => (
          <PlayerEditRow key={i} player={p} index={i} onChange={handleChange} onRemove={handleRemove} />
        ))}
      </div>
      <div className={styles.btnRow} style={{ marginTop: 10 }}>
        <button className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`} onClick={handleAdd}>+ Jogador</button>
        <button className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSm}`} onClick={handleSave}>✓ Salvar {teamName}</button>
      </div>
    </>
  )
}

// ─────────────────────────────────────────────────────────────
//  Aba: Importar JSON (SofaScore ou qualquer formato compatível)
// ─────────────────────────────────────────────────────────────
function ImportMode() {
  const { teamA, teamB, updateLineup } = useMatchStore()
  const fileRef = useRef(null)

  const [jsonText, setJsonText]   = useState('')
  const [preview,  setPreview]    = useState(null)   // { lineupA, lineupB, teamA, teamB }
  const [error,    setError]      = useState('')
  const [imported, setImported]   = useState(false)

  const parse = (text) => {
    setError('')
    setPreview(null)
    setImported(false)
    if (!text.trim()) return

    let json
    try {
      json = JSON.parse(text)
    } catch {
      setError('JSON inválido. Verifique se o conteúdo está correto.')
      return
    }

    try {
      const lineupA = parseSofaScore(json, 'home')
      const lineupB = parseSofaScore(json, 'away')

      // Tenta pegar os nomes dos times do JSON
      const nameA = json.home?.teamName || json.homeTeam?.name || teamA
      const nameB = json.away?.teamName || json.awayTeam?.name || teamB

      setPreview({ lineupA, lineupB, nameA, nameB })
    } catch (e) {
      setError(e.message)
    }
  }

  const handleText = (text) => {
    setJsonText(text)
    parse(text)
  }

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
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

      {/* Upload ou colar */}
      <div className={styles.importMethods}>
        <button
          className={`${styles.btn} ${styles.btnBlue} ${styles.btnSm}`}
          onClick={() => fileRef.current?.click()}
        >
          📂 Carregar arquivo .json
        </button>
        <input ref={fileRef} type="file" accept=".json,application/json" style={{ display: 'none' }} onChange={handleFile} />
        <span style={{ fontSize: 12, color: 'var(--muted)', alignSelf: 'center' }}>ou cole o JSON abaixo:</span>
      </div>

      <textarea
        className={styles.jsonTextarea}
        placeholder={`Cole o JSON da SofaScore aqui...\n\nFormato esperado:\n{\n  "home": { "players": [...] },\n  "away": { "players": [...] }\n}`}
        value={jsonText}
        onChange={e => handleText(e.target.value)}
        spellCheck={false}
      />

      {/* Erro */}
      {error && <div className={styles.apiError}><strong>Erro:</strong> {error}</div>}

      {/* Preview */}
      {preview && !imported && (
        <div className={styles.importPreview}>
          <div className={styles.importPreviewTitle}>
            ✅ Encontrados: <strong>{preview.lineupA.length}</strong> titulares (Casa) e <strong>{preview.lineupB.length}</strong> (Visitante)
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 10 }}>
            {/* Time A */}
            <div>
              <div className={styles.fieldLabel} style={{ marginBottom: 6 }}>🏠 Casa ({teamA})</div>
              {preview.lineupA.map((p, i) => (
                <div key={i} className={styles.previewPlayer}>
                  <span className={styles.previewNum}>{p.num}</span>
                  <span className={styles.previewName}>{p.name}</span>
                  <span className={styles.previewPos}>{p.pos}</span>
                </div>
              ))}
            </div>
            {/* Time B */}
            <div>
              <div className={styles.fieldLabel} style={{ marginBottom: 6 }}>✈️ Visitante ({teamB})</div>
              {preview.lineupB.map((p, i) => (
                <div key={i} className={styles.previewPlayer}>
                  <span className={styles.previewNum}>{p.num}</span>
                  <span className={styles.previewName}>{p.name}</span>
                  <span className={styles.previewPos}>{p.pos}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            className={`${styles.btn} ${styles.btnPrimary} ${styles.btnFull}`}
            style={{ marginTop: 12 }}
            onClick={handleImport}
          >
            ✓ Importar Escalações
          </button>
        </div>
      )}

      {/* Sucesso */}
      {imported && (
        <div className={styles.apiSuccess}>
          ✅ Escalações importadas com sucesso! Veja na aba Manual para editar se precisar.
        </div>
      )}

      {/* Dica */}
      {!jsonText && (
        <div className={styles.importTip}>
          <strong>Como obter o JSON da SofaScore:</strong>
          <ol>
            <li>Abra o jogo na SofaScore no browser</li>
            <li>Pressione <code>F12</code> → aba <strong>Network</strong></li>
            <li>Filtre por <code>lineups</code></li>
            <li>Clique na requisição → aba <strong>Response</strong></li>
            <li>Copie o JSON e cole aqui, ou salve como .json e carregue o arquivo</li>
          </ol>
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
  const [mode, setMode] = useState('manual') // 'manual' | 'import'

  const teamName = activeTeam === 'a' ? teamA : teamB

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>📋 Escalações</div>
      <div className={styles.body}>

        {/* Modo */}
        <div className={styles.modeToggle}>
          <button
            className={`${styles.modeBtn} ${mode === 'manual' ? styles.modeBtnActive : ''}`}
            onClick={() => setMode('manual')}
          >✏️ Manual</button>
          <button
            className={`${styles.modeBtn} ${mode === 'import' ? styles.modeBtnActive : ''}`}
            onClick={() => setMode('import')}
          >📥 Importar JSON</button>
        </div>

        {/* Time selector — só no modo manual */}
        {mode === 'manual' && (
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
        )}

        {mode === 'manual'
          ? <ManualMode activeTeam={activeTeam} teamName={teamName} />
          : <ImportMode />
        }
      </div>
    </div>
  )
}
