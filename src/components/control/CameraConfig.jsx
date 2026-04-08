import React, { useState, useEffect } from 'react'
import { useMatchStore } from '../../store/matchStore'
import styles from './ControlSection.module.css'

const LABELS   = ['CAM 1','CAM 2','CAM 3','CAM 4','CAM 5','CAM 6']
const ASPECTS  = ['4:3','16:9','1:1','9:16','3:2','custom']
const FITS     = [{ v: 'cover', l: 'Preencher' }, { v: 'contain', l: 'Ajustar' }]

// Presets de layout automático para N câmeras
const PRESETS = {
  1: [{ x:0, y:0, w:100 }],
  2: [{ x:0, y:0, w:50 },{ x:50, y:0, w:50 }],
  4: [{ x:0,  y:0,  w:50 },{ x:50, y:0,  w:50 },
      { x:0,  y:50, w:50 },{ x:50, y:50, w:50 }],
  6: [{ x:0,    y:0,    w:33.33 },{ x:33.33, y:0,    w:33.33 },{ x:66.66, y:0,    w:33.33 },
      { x:0,    y:50,   w:33.33 },{ x:33.33, y:50,   w:33.33 },{ x:66.66, y:50,   w:33.33 }],
}

function useVideoDevices() {
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(false)
  const [err, setErr]         = useState(null)

  const scan = async () => {
    setLoading(true); setErr(null)
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      s.getTracks().forEach(t => t.stop())
      const all = await navigator.mediaDevices.enumerateDevices()
      setDevices(all.filter(d => d.kind === 'videoinput'))
    } catch(e) { setErr(e.message) }
    finally { setLoading(false) }
  }

  return { devices, loading, err, scan }
}

// ── Slider com label ──
function Slider({ label, value, min, max, step = 1, onChange, unit = '' }) {
  return (
    <div className={styles.sliderRow}>
      <div className={styles.sliderLabel}>{label}</div>
      <input
        type="range" min={min} max={max} step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ flex: 1 }}
      />
      <span className={styles.sliderVal}>{value}{unit}</span>
    </div>
  )
}

// ── Config de um slot ──
function SlotConfig({ index, cfg, devices, onUpdate }) {
  const [open, setOpen] = useState(index === 0)

  const set = (patch) => onUpdate(index, { ...cfg, ...patch })

  return (
    <div className={styles.camSlotCfg}>
      {/* Header clicável */}
      <div className={styles.camSlotHeader} onClick={() => setOpen(o => !o)}>
        <span className={styles.camSlotLabel}>{LABELS[index]}</span>
        <span className={styles.camSlotType}>
          {cfg.type === 'placeholder' ? '⬛ OBS' : cfg.type === 'webcam' ? '📷 Webcam' : '🌐 VDO'}
          {' · '}{cfg.aspect}
          {' · '}{cfg.w}%
        </span>
        <span className={styles.camChevron}>{open ? '▲' : '▼'}</span>
      </div>

      {open && (
        <div className={styles.camSlotBody}>
          {/* Tipo */}
          <div className={styles.fieldLabel}>Fonte</div>
          <div className={styles.camTypeRow}>
            {[
              { id: 'placeholder', label: '⬛ OBS'    },
              { id: 'webcam',      label: '📷 Webcam' },
              { id: 'vdo',         label: '🌐 VDO'    },
            ].map(opt => (
              <button
                key={opt.id}
                className={`${styles.camTypeBtn} ${cfg.type === opt.id ? styles.camTypeBtnActive : ''}`}
                onClick={() => set({ type: opt.id, src: '' })}
              >{opt.label}</button>
            ))}
          </div>

          {/* Webcam: select do device */}
          {cfg.type === 'webcam' && (
            <>
              <div className={styles.fieldLabel} style={{ marginTop: 8 }}>Dispositivo</div>
              <select className={styles.select} style={{ width: '100%' }}
                value={cfg.src} onChange={e => set({ src: e.target.value })}>
                <option value="__any__">— Qualquer câmera disponível —</option>
                {devices.map(d => (
                  <option key={d.deviceId} value={d.deviceId}>
                    {d.label || `Câmera ${d.deviceId.substring(0,8)}…`}
                  </option>
                ))}
              </select>
              {devices.length === 0 && (
                <div className={styles.camHint}>Use "Detectar Câmeras" acima para listar.</div>
              )}
            </>
          )}

          {/* VDO: URL */}
          {cfg.type === 'vdo' && (
            <>
              <div className={styles.fieldLabel} style={{ marginTop: 8 }}>URL do VDO.Ninja (view link)</div>
              <input
                className={styles.input} style={{ width: '100%' }}
                placeholder="https://vdo.ninja/?view=CODIGO"
                value={cfg.src}
                onChange={e => set({ src: e.target.value })}
              />
              <div className={styles.camHint} style={{ marginTop: 4 }}>
                Use sempre o link de <strong>visualização</strong> (<code>?view=</code>), não o de push.
                Exemplo: câmera envia em <code>vdo.ninja/?push=cam1</code>, cole aqui <code>vdo.ninja/?view=cam1</code>
              </div>
            </>
          )}

          {/* Proporção */}
          <div className={styles.fieldLabel} style={{ marginTop: 12 }}>Proporção (Aspect Ratio)</div>
          <div className={styles.camTypeRow} style={{ flexWrap: 'wrap' }}>
            {ASPECTS.map(a => (
              <button key={a}
                className={`${styles.camTypeBtn} ${cfg.aspect === a ? styles.camTypeBtnActive : ''}`}
                onClick={() => set({ aspect: a })}
              >{a}</button>
            ))}
          </div>

          {/* Custom ratio */}
          {cfg.aspect === 'custom' && (
            <div className={styles.inputRow} style={{ marginTop: 8, gap: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>W</span>
              <input className={styles.inputSm} type="number" style={{ width: 60 }} value={cfg.customW || 4}
                onChange={e => set({ customW: Number(e.target.value) })} />
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>H</span>
              <input className={styles.inputSm} type="number" style={{ width: 60 }} value={cfg.customH || 3}
                onChange={e => set({ customH: Number(e.target.value) })} />
            </div>
          )}

          {/* Fit */}
          <div className={styles.fieldLabel} style={{ marginTop: 12 }}>Preenchimento</div>
          <div className={styles.camTypeRow}>
            {FITS.map(f => (
              <button key={f.v}
                className={`${styles.camTypeBtn} ${cfg.fit === f.v ? styles.camTypeBtnActive : ''}`}
                onClick={() => set({ fit: f.v })}
              >{f.l}</button>
            ))}
          </div>

          {/* Posição e tamanho */}
          <div className={styles.fieldLabel} style={{ marginTop: 12 }}>Posição & Tamanho</div>

          <Slider label="Posição X" value={cfg.x  || 0}  min={-50} max={100} step={0.5} unit="%" onChange={v => set({ x: v })} />
          <Slider label="Posição Y" value={cfg.y  || 0}  min={-50} max={100} step={0.5} unit="%" onChange={v => set({ y: v })} />
          <Slider label="Largura"   value={cfg.w  || 50} min={5}   max={150} step={0.5} unit="%" onChange={v => set({ w: v })} />
        </div>
      )}
    </div>
  )
}

// ── Componente principal ──
export default function CameraConfig() {
  const { cameraCount, cameras, setCameraConfig } = useMatchStore()
  const { devices, loading, err, scan } = useVideoDevices()
  const slots = Array.from({ length: cameraCount }, (_, i) => i)

  const applyPreset = () => {
    const preset = PRESETS[cameraCount]
    if (!preset) return
    slots.forEach((i) => {
      const p = preset[i] || preset[0]
      setCameraConfig(i, { ...cameras[i], x: p.x, y: p.y, w: p.w })
    })
  }

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>📹. Câmeras</div>
      <div className={styles.body}>

        {/* Detectar + Preset */}
        <div className={styles.btnRow} style={{ marginBottom: 12 }}>
          <button className={`${styles.btn} ${styles.btnBlue} ${styles.btnSm}`}
            onClick={scan} disabled={loading}>
            {loading ? '⏳ Detectando...' : '🔍 Detectar Webcams'}
          </button>
          <button className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`}
            onClick={applyPreset} title="Distribuir câmeras automaticamente">
            ⚡ Auto Layout
          </button>
          {devices.length > 0 && <span style={{ fontSize: 12, color: 'var(--green)' }}>✅ {devices.length} câmera(s)</span>}
          {err && <span style={{ fontSize: 12, color: 'var(--red)' }}>⚠️ {err}</span>}
        </div>

        {/* Slots */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {slots.map(i => (
            <SlotConfig
              key={i}
              index={i}
              cfg={cameras[i] || { type: 'placeholder', src: '', aspect: '4:3', x: 0, y: 0, w: 50, fit: 'cover' }}
              devices={devices}
              onUpdate={(idx, patch) => setCameraConfig(idx, patch)}
            />
          ))}
        </div>

        <div className={styles.camHint} style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
          <strong>VDO.Ninja:</strong> câmera envia em <code>vdo.ninja/?push=NOME</code>,
          cole <code>vdo.ninja/?view=NOME</code> no campo VDO.
          Posição X/Y e Largura são em % da zona de câmeras (pode ultrapassar 100% para cobrir a tela inteira).
        </div>
      </div>
    </div>
  )
}
