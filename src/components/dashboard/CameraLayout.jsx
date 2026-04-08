import React, { useEffect, useRef, useState } from 'react'
import { useMatchStore } from '../../store/matchStore'
import styles from './CameraLayout.module.css'

const LABELS = ['CAM 1','CAM 2','CAM 3','CAM 4','CAM 5','CAM 6']

// Calcula a proporção em número a partir da string
function aspectRatio(cfg) {
  if (cfg.aspect === 'custom') {
    const w = Number(cfg.customW) || 4
    const h = Number(cfg.customH) || 3
    return w / h
  }
  const map = { '4:3': 4/3, '16:9': 16/9, '1:1': 1, '9:16': 9/16, '3:2': 3/2 }
  return map[cfg.aspect] || 4/3
}

// ── Webcam ──
function WebcamSlot({ cfg, label }) {
  const videoRef = useRef(null)
  const [err, setErr] = useState(null)

  useEffect(() => {
    let stream = null
    const deviceId = cfg.src
    navigator.mediaDevices.getUserMedia({
      video: deviceId && deviceId !== '__any__' ? { deviceId: { exact: deviceId } } : true,
      audio: false,
    })
      .then(s => { stream = s; if (videoRef.current) videoRef.current.srcObject = s })
      .catch(e => setErr(e.message))

    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop())
    }
  }, [cfg.src])

  if (err) return (
    <div className={styles.slotInner}>
      <span className={styles.camLabel}>{label}</span>
      <span className={styles.errMsg}>{err}</span>
    </div>
  )

  return (
    <>
      <video
        ref={videoRef}
        autoPlay muted playsInline
        className={styles.media}
        style={{ objectFit: cfg.fit || 'cover' }}
      />
      <div className={styles.camOverlayLabel}>{label}</div>
    </>
  )
}

// ── VDO.Ninja ──
// O VDO.Ninja requer allow="camera;microphone" e não pode ter sandbox restritivo
// A URL precisa ser a URL completa de visualização (view link), não o push link
function VdoSlot({ cfg, label }) {
  const src = cfg.src?.trim() || ''
  if (!src) return <div className={styles.slotInner}><span className={styles.camLabel}>{label}</span><span className={styles.errMsg}>URL não configurada</span></div>

  // Monta URL limpa — remove parâmetros conflitantes e adiciona os necessários para overlay
  let url
  try {
    url = new URL(src)
  } catch {
    return <div className={styles.slotInner}><span className={styles.camLabel}>{label}</span><span className={styles.errMsg}>URL inválida</span></div>
  }

  // Parâmetros para overlay limpo sem UI do VDO
  url.searchParams.set('cleanoutput', '1')
  url.searchParams.set('autostart', '1')
  url.searchParams.delete('push') // view only no dashboard

  return (
    <>
      <iframe
        src={url.toString()}
        className={styles.media}
        style={{ border: 'none' }}
        allow="camera;microphone;autoplay;display-capture;picture-in-picture"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
      />
      <div className={styles.camOverlayLabel}>{label}</div>
    </>
  )
}

// ── Placeholder ──
function PlaceholderSlot({ label }) {
  return (
    <div className={styles.slotInner}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ color: '#1e2840' }}>
        <rect x="2" y="6" width="15" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M17 9l5-3v12l-5-3V9z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>
      <div className={styles.camLabel}>{label}</div>
    </div>
  )
}

// ── Slot com posição e proporção livres ──
function CamSlot({ cfg, index }) {
  const ratio = aspectRatio(cfg)
  const label = LABELS[index]

  // Calcula o tamanho mantendo a proporção
  // w e h estão em % da zona. A altura é derivada da largura pela proporção.
  const wPct = cfg.w || 50
  // height em % da largura: h = w / ratio * (containerH / containerW)
  // Usamos padding-top trick para manter proporção independente do container
  const paddingTop = (1 / ratio) * 100  // em % da própria largura do slot

  return (
    <div
      className={styles.slot}
      style={{
        left:  `${cfg.x || 0}%`,
        top:   `${cfg.y || 0}%`,
        width: `${wPct}%`,
      }}
    >
      {/* Aspect ratio box */}
      <div className={styles.aspectBox} style={{ paddingTop: `${paddingTop}%` }}>
        <div className={styles.aspectInner}>
          {cfg.type === 'webcam'                       && <WebcamSlot     cfg={cfg} label={label} />}
          {cfg.type === 'vdo'    && cfg.src             && <VdoSlot        cfg={cfg} label={label} />}
          {(cfg.type === 'placeholder' || (cfg.type === 'vdo' && !cfg.src)) && <PlaceholderSlot label={label} />}
        </div>
      </div>
    </div>
  )
}

// ── Layout principal — zona livre sem grade ──
export default function CameraLayout({ count }) {
  const cameras = useMatchStore(s => s.cameras)

  return (
    <div className={styles.zone}>
      {Array.from({ length: count }, (_, i) => (
        <CamSlot key={i} cfg={cameras[i] || { type: 'placeholder', src: '', aspect: '4:3', x: 0, y: 0, w: 50 }} index={i} />
      ))}
    </div>
  )
}
