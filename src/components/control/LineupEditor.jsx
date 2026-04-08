import React, { useState, useEffect } from 'react'
import { useMatchStore } from '../../store/matchStore'
import styles from './ControlSection.module.css'

const POSITIONS = ['GOL','LAD','LAE','ZAG','VOL','MEI','ATA','CA','MA']

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────

// Navega um caminho "a.b.c" dentro de um objeto
function getPath(obj, path) {
  if (!path) return obj
  return path.split('.').reduce((acc, key) => (acc != null ? acc[key] : undefined), obj)
}

// Dado o JSON da API e os mapeamentos, extrai array de jogadores
function extractPlayers(data, cfg) {
  // cfg.arrayPath: caminho até o array (ex: "players" ou "data.lineup")
  // cfg.num:  campo do número (ex: "number" ou "shirt")
  // cfg.name: campo do nome   (ex: "name" ou "player.name")
  // cfg.pos:  campo da pos    (ex: "position" ou "role") — opcional

  const arr = cfg.arrayPath ? getPath(data, cfg.arrayPath) : data
  if (!Array.isArray(arr)) throw new Error('Caminho não aponta para um array')

  return arr.map((item, i) => ({
    num:   Number(getPath(item, cfg.num))  || i + 1,
    name:  String(getPath(item, cfg.name) || `Jogador ${i + 1}`),
    pos:   String(getPath(item, cfg.pos)  || 'MEI').toUpperCase().substring(0, 3),
    cards: [],
  }))
}

// ─────────────────────────────────────────
// Linha de edição manual
// ─────────────────────────────────────────
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

// ─────────────────────────────────────────
// Modo Manual
// ─────────────────────────────────────────
function ManualMode({ activeTeam, teamName }) {
  const { lineupA, lineupB, updateLineup } = useMatchStore()
  const src = activeTeam === 'a' ? lineupA : lineupB
  const [local, setLocal] = useState(src.map(p => ({ ...p })))

  useEffect(() => {
    const s = activeTeam === 'a' ? lineupA : lineupB
    setLocal(s.map(p => ({ ...p })))
  }, [activeTeam])

  const handleChange = (idx, field, val) => {
    setLocal(prev => prev.map((p, i) =>
      i === idx ? { ...p, [field]: field === 'num' ? Number(val) : val } : p
    ))
  }

  const handleRemove = (idx) => setLocal(prev => prev.filter((_, i) => i !== idx))

  const handleAdd = () => setLocal(prev => [
    ...prev, { num: prev.length + 1, name: '', pos: 'MEI', cards: [] }
  ])

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

// ─────────────────────────────────────────
// Modo API
// ─────────────────────────────────────────

// Configuração padrão salva por time no localStorage
const STORAGE_KEY = 'fb_api_cfg'

function loadApiCfg() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') } catch { return {} }
}

function saveApiCfg(cfg) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg))
}

function ApiMode({ activeTeam, teamName }) {
  const { updateLineup } = useMatchStore()

  const stored = loadApiCfg()
  const teamKey = `team_${activeTeam}`

  const [url,       setUrl]       = useState(stored[teamKey]?.url       || '')
  const [arrayPath, setArrayPath] = useState(stored[teamKey]?.arrayPath || '')
  const [fieldNum,  setFieldNum]  = useState(stored[teamKey]?.num       || 'number')
  const [fieldName, setFieldName] = useState(stored[teamKey]?.name      || 'name')
  const [fieldPos,  setFieldPos]  = useState(stored[teamKey]?.pos       || 'position')

  // Preview
  const [status,   setStatus]  = useState('idle')  // idle | loading | ok | error
  const [preview,  setPreview] = useState(null)     // array de jogadores extraídos
  const [errMsg,   setErrMsg]  = useState('')
  const [rawSnip,  setRawSnip] = useState('')       // trecho do JSON bruto

  // Salva config no localStorage ao trocar campos
  useEffect(() => {
    const cfg = loadApiCfg()
    cfg[teamKey] = { url, arrayPath, num: fieldNum, name: fieldName, pos: fieldPos }
    saveApiCfg(cfg)
  }, [url, arrayPath, fieldNum, fieldName, fieldPos])

  // Ao trocar de time, recarrega a config salva
  useEffect(() => {
    const s = loadApiCfg()
    const t = s[`team_${activeTeam}`]
    if (t) {
      setUrl(t.url || '')
      setArrayPath(t.arrayPath || '')
      setFieldNum(t.num   || 'number')
      setFieldName(t.name || 'name')
      setFieldPos(t.pos   || 'position')
    }
    setStatus('idle')
    setPreview(null)
    setErrMsg('')
    setRawSnip('')
  }, [activeTeam])

  const fetchAndPreview = async () => {
    if (!url.trim()) return
    setStatus('loading')
    setPreview(null)
    setErrMsg('')
    setRawSnip('')

    try {
      const res = await fetch(url.trim())
      if (!res.ok) throw new Error(`HTTP ${res.status} — ${res.statusText}`)
      const data = await res.json()

      // Trecho bruto (primeiros 300 chars)
      setRawSnip(JSON.stringify(data, null, 2).substring(0, 400) + '…')

      const players = extractPlayers(data, {
        arrayPath,
        num:  fieldNum,
        name: fieldName,
        pos:  fieldPos,
      })

      setPreview(players)
      setStatus('ok')
    } catch (e) {
      setErrMsg(e.message)
      setStatus('error')
    }
  }

  const handleImport = () => {
    if (!preview || preview.length === 0) return
    updateLineup(activeTeam, preview)
    setStatus('imported')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* URL */}
      <div>
        <div className={styles.fieldLabel}>URL da API</div>
        <input
          className={styles.input}
          style={{ width: '100%' }}
          placeholder="https://minha-api.com/escalacao/flamengo"
          value={url}
          onChange={e => setUrl(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && fetchAndPreview()}
        />
      </div>

      {/* Mapeamento */}
      <div>
        <div className={styles.fieldLabel}>Mapeamento de campos do JSON</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div>
            <div className={styles.fieldLabelSm}>Caminho até o array</div>
            <input className={styles.inputSm} style={{ width: '100%' }} placeholder="ex: players  ou  data.lineup"
              value={arrayPath} onChange={e => setArrayPath(e.target.value)} />
          </div>
          <div>
            <div className={styles.fieldLabelSm}>Campo do número</div>
            <input className={styles.inputSm} style={{ width: '100%' }} placeholder="ex: number"
              value={fieldNum} onChange={e => setFieldNum(e.target.value)} />
          </div>
          <div>
            <div className={styles.fieldLabelSm}>Campo do nome</div>
            <input className={styles.inputSm} style={{ width: '100%' }} placeholder="ex: name"
              value={fieldName} onChange={e => setFieldName(e.target.value)} />
          </div>
          <div>
            <div className={styles.fieldLabelSm}>Campo da posição (opcional)</div>
            <input className={styles.inputSm} style={{ width: '100%' }} placeholder="ex: position"
              value={fieldPos} onChange={e => setFieldPos(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Botão buscar */}
      <button
        className={`${styles.btn} ${styles.btnBlue} ${styles.btnFull}`}
        onClick={fetchAndPreview}
        disabled={status === 'loading' || !url.trim()}
      >
        {status === 'loading' ? '⏳ Buscando...' : '🔍 Buscar e Visualizar'}
      </button>

      {/* Erro */}
      {status === 'error' && (
        <div className={styles.apiError}>
          <strong>Erro:</strong> {errMsg}
          {rawSnip && (
            <>
              <div style={{ marginTop: 6, fontSize: 11, opacity: 0.7 }}>Trecho do JSON recebido:</div>
              <pre className={styles.apiRaw}>{rawSnip}</pre>
            </>
          )}
        </div>
      )}

      {/* Preview */}
      {status === 'ok' && preview && (
        <div className={styles.apiPreview}>
          <div className={styles.apiPreviewTitle}>
            ✅ {preview.length} jogadores encontrados — confira antes de importar:
          </div>
          <div className={styles.playerEditHeader}>
            <span style={{ width: 32, textAlign: 'center' }}>#</span>
            <span style={{ flex: 1 }}>Nome</span>
            <span style={{ width: 50 }}>Pos</span>
          </div>
          <div className={styles.playerEditList} style={{ maxHeight: 200, overflowY: 'auto' }}>
            {preview.map((p, i) => (
              <div key={i} className={styles.playerEditRow}>
                <span className={styles.apiPreviewNum}>{p.num}</span>
                <span style={{ flex: 1, fontSize: 13 }}>{p.name}</span>
                <span style={{ width: 50, fontSize: 12, color: 'var(--muted)' }}>{p.pos}</span>
              </div>
            ))}
          </div>
          <button
            className={`${styles.btn} ${styles.btnPrimary} ${styles.btnFull}`}
            style={{ marginTop: 10 }}
            onClick={handleImport}
          >
            ✓ Importar escalação do {teamName}
          </button>
        </div>
      )}

      {/* Importado com sucesso */}
      {status === 'imported' && (
        <div className={styles.apiSuccess}>
          ✅ Escalação de <strong>{teamName}</strong> importada com sucesso!
        </div>
      )}

      {/* Dica de formato esperado */}
      <details className={styles.apiTip}>
        <summary>💡 Exemplos de formato aceito</summary>
        <pre className={styles.apiRaw}>{`// Array direto na raiz (arrayPath vazio):
[
  { "number": 1, "name": "Hugo Souza", "position": "GOL" },
  { "number": 9, "name": "Pedro", "position": "CA" }
]

// Array dentro de um objeto (arrayPath = "players"):
{
  "team": "Flamengo",
  "players": [
    { "shirt": 10, "name": "Arrascaeta", "role": "MEI" }
  ]
}

// Caminho aninhado (arrayPath = "data.lineup"):
{
  "data": {
    "lineup": [ ... ]
  }
}`}</pre>
      </details>
    </div>
  )
}

// ─────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────
export default function LineupEditor() {
  const { teamA, teamB } = useMatchStore()
  const [activeTeam, setActiveTeam] = useState('a')
  const [mode, setMode] = useState('manual') // 'manual' | 'api'

  const teamName = activeTeam === 'a' ? teamA : teamB

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>📋 Escalações</div>
      <div className={styles.body}>

        {/* Seleção de time */}
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

        {/* Seleção de modo */}
        <div className={styles.modeToggle}>
          <button
            className={`${styles.modeBtn} ${mode === 'manual' ? styles.modeBtnActive : ''}`}
            onClick={() => setMode('manual')}
          >✏️ Manual</button>
          <button
            className={`${styles.modeBtn} ${mode === 'api' ? styles.modeBtnActive : ''}`}
            onClick={() => setMode('api')}
          >🔌 Via API</button>
        </div>

        {/* Conteúdo conforme modo */}
        {mode === 'manual'
          ? <ManualMode activeTeam={activeTeam} teamName={teamName} />
          : <ApiMode   activeTeam={activeTeam} teamName={teamName} />
        }

      </div>
    </div>
  )
}
