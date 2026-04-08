import React, { useEffect, useRef, useState } from 'react'
import { useMatchStore } from '../../store/matchStore'
import styles from './CameraLayout.module.css'

const LABELS = ['CAM 1','CAM 2','CAM 3','CAM 4','CAM 5','CAM 6']

// ── Slot de webcam local ──
function WebcamSlot({ deviceId, label }) {
  const videoRef = useRef(null)
  const [err, setErr] = useState(null)

  useEffect(() => {
    if (!deviceId) return
    let stream = null

    const constraints = {
      video: deviceId === '__any__'
        ? true
        : { deviceId: { exact: deviceId } },
      audio: false,
    }

    navigator.mediaDevices.getUserMedia(constraints)
      .then(s => {
        stream = s
        if (videoRef.current) {
          videoRef.current.srcObject = s
        }
      })
      .catch(e => setErr(e.message))

    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop())
      if (videoRef.current) videoRef.current.srcObject = null
    }
  }, [deviceId])

  if (err) return (
    <div className={styles.slotError}>
      <span className={styles.camLabel}>{label}</span>
      <span className={styles.errMsg}>Sem acesso: {err}</span>
    </div>
  )

  return (
    <div className={styles.slotVideo}>
      <video ref={videoRef} autoPlay muted playsInline className={styles.videoEl} />
      <div className={styles.camOverlayLabel}>{label}</div>
    </div>
  )
}

// ── Slot VDO.Ninja via iframe ──
function VdoSlot({ url, label }) {
  // Garante que a URL tem &cleanoutput&nocontrols para overlay limpo
  let src = url.trim()
  if (src && !src.includes('cleanoutput')) src += (src.includes('?') ? '&' : '?') + 'cleanoutput&nocontrols&autostart'

  return (
    <div className={styles.slotVideo}>
      <iframe
        src={src}
        className={styles.iframeEl}
        allow="camera;microphone;autoplay;fullscreen;picture-in-picture"
        allowFullScreen
      />
      <div className={styles.camOverlayLabel}>{label}</div>
    </div>
  )
}

// ── Slot placeholder (OBS captura externamente) ──
function PlaceholderSlot({ label }) {
  return (
    <div className={styles.slot}>
      <div className={styles.camIcon}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <rect x="2" y="6" width="15" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M17 9l5-3v12l-5-3V9z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
          <circle cx="9.5" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
      </div>
      <div className={styles.camLabel}>{label}</div>
    </div>
  )
}

// ── Componente principal ──
export default function CameraLayout({ count }) {
  const cameras = useMatchStore(s => s.cameras)
  const slots   = Array.from({ length: count }, (_, i) => i)

  return (
    <div className={`${styles.grid} ${styles['g' + count]}`}>
      {slots.map(i => {
        const cfg   = cameras[i] || { type: 'placeholder', src: '' }
        const label = LABELS[i]

        if (cfg.type === 'webcam') {
          return <WebcamSlot key={i} deviceId={cfg.src || '__any__'} label={label} />
        }
        if (cfg.type === 'vdo' && cfg.src) {
          return <VdoSlot key={i} url={cfg.src} label={label} />
        }
        return <PlaceholderSlot key={i} label={label} />
      })}
    </div>
  )
}
