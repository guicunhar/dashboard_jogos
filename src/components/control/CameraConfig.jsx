import React, { useState, useEffect } from 'react'
import { useMatchStore } from '../../store/matchStore'
import styles from './ControlSection.module.css'

const LABELS = ['CAM 1', 'CAM 2', 'CAM 3', 'CAM 4', 'CAM 5', 'CAM 6']

// Detecta e lista os dispositivos de câmera disponíveis no navegador
function useVideoDevices() {
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(false)
  const [err, setErr]         = useState(null)

  const scan = async () => {
    setLoading(true)
    setErr(null)
    try {
      // Pede permissão primeiro
      await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(s => s.getTracks().forEach(t => t.stop()))

      const all = await navigator.mediaDevices.enumerateDevices()
      setDevices(all.filter(d => d.kind === 'videoinput'))
    } catch (e) {
      setErr(e.message)
    } finally {
      setLoading(false)
    }
  }

  return { devices, loading, err, scan }
}

// ── Config de um único slot ──
function SlotConfig({ index, cfg, devices }) {
  const setCameraConfig = useMatchStore(s => s.setCameraConfig)
  const [type, setType] = useState(cfg.type || 'placeholder')
  const [src,  setSrc]  = useState(cfg.src  || '')

  // Sincroniza estado local com o store quando o index muda
  useEffect(() => {
    setType(cfg.type || 'placeholder')
    setSrc(cfg.src   || '')
  }, [index, cfg.type, cfg.src])

  const apply = (newType, newSrc) => {
    const t = newType !== undefined ? newType : type
    const s = newSrc  !== undefined ? newSrc  : src
    setType(t)
    setSrc(s)
    setCameraConfig(index, { type: t, src: s })
  }

  return (
    <div className={styles.camSlotCfg}>
      <div className={styles.camSlotLabel}>{LABELS[index]}</div>

      {/* Tipo do slot */}
      <div className={styles.camTypeRow}>
        {[
          { id: 'placeholder', icon: '⬛', label: 'OBS'     },
          { id: 'webcam',      icon: '📷', label: 'Webcam'  },
          { id: 'vdo',         icon: '🌐', label: 'VDO'     },
        ].map(opt => (
          <button
            key={opt.id}
            className={`${styles.camTypeBtn} ${type === opt.id ? styles.camTypeBtnActive : ''}`}
            onClick={() => apply(opt.id, '')}
          >
            {opt.icon} {opt.label}
          </button>
        ))}
      </div>

      {/* Config: webcam */}
      {type === 'webcam' && (
        <div className={styles.camSourceRow}>
          {devices.length > 0 ? (
            <select
              className={styles.select}
              style={{ width: '100%' }}
              value={src}
              onChange={e => apply('webcam', e.target.value)}
            >
              <option value="__any__">— Qualquer câmera disponível —</option>
              {devices.map(d => (
                <option key={d.deviceId} value={d.deviceId}>
                  {d.label || `Câmera ${d.deviceId.substring(0, 8)}...`}
                </option>
              ))}
            </select>
          ) : (
            <div className={styles.camHint}>
              Clique em "Detectar Câmeras" acima para listar os dispositivos.
            </div>
          )}
        </div>
      )}

      {/* Config: VDO.Ninja */}
      {type === 'vdo' && (
        <div className={styles.camSourceRow}>
          <input
            className={styles.input}
            style={{ width: '100%' }}
            placeholder="https://vdo.ninja/?view=ROOM_CODE"
            value={src}
            onChange={e => apply('vdo', e.target.value)}
          />
          {src && (
            <div className={styles.camHint}>
              💡 Use <code>?view=</code> para receber, <code>?push=</code> para transmitir.
              O dashboard adiciona <code>&cleanoutput&nocontrols</code> automaticamente.
            </div>
          )}
        </div>
      )}

      {/* Placeholder info */}
      {type === 'placeholder' && (
        <div className={styles.camHint}>
          Slot reservado para o OBS capturar externamente (fonte de câmera/vídeo sobre o browser source).
        </div>
      )}
    </div>
  )
}

// ── Componente principal ──
export default function CameraConfig() {
  const { cameraCount, cameras } = useMatchStore()
  const { devices, loading, err, scan } = useVideoDevices()
  const [expanded, setExpanded] = useState(null)

  const slots = Array.from({ length: cameraCount }, (_, i) => i)

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>📹 Configuração das Câmeras</div>
      <div className={styles.body}>

        {/* Botão de detecção de câmeras */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <button
            className={`${styles.btn} ${styles.btnBlue} ${styles.btnSm}`}
            onClick={scan}
            disabled={loading}
          >
            {loading ? '⏳ Detectando...' : '🔍 Detectar Câmeras'}
          </button>
          {devices.length > 0 && (
            <span style={{ fontSize: 12, color: 'var(--green)' }}>
              ✅ {devices.length} câmera{devices.length !== 1 ? 's' : ''} encontrada{devices.length !== 1 ? 's' : ''}
            </span>
          )}
          {err && (
            <span style={{ fontSize: 12, color: 'var(--red)' }}>
              ⚠️ {err}
            </span>
          )}
        </div>

        {/* Legenda dos tipos */}
        <div className={styles.camLegend}>
          <span><strong>⬛ OBS</strong> — slot vazio, o OBS posiciona a fonte de vídeo por cima</span>
          <span><strong>📷 Webcam</strong> — câmera local do dispositivo via WebRTC</span>
          <span><strong>🌐 VDO</strong> — câmera remota via vdo.ninja (URL de view)</span>
        </div>

        {/* Um bloco por slot ativo */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
          {slots.map(i => (
            <SlotConfig
              key={i}
              index={i}
              cfg={cameras[i] || { type: 'placeholder', src: '' }}
              devices={devices}
            />
          ))}
        </div>

        <div className={styles.camHint} style={{ marginTop: 12, borderTop: '1px solid var(--border)', paddingTop: 10 }}>
          💡 <strong>VDO.Ninja — como usar:</strong> No celular/câmera remota acesse{' '}
          <code>https://vdo.ninja/?push=NOME</code> e cole{' '}
          <code>https://vdo.ninja/?view=NOME</code> no campo VDO acima.
          Troque NOME por qualquer palavra única para cada câmera.
        </div>
      </div>
    </div>
  )
}
