import React, { useEffect } from 'react'
import ScoreBoard from '../components/dashboard/ScoreBoard'
import LineupPanel from '../components/dashboard/LineupPanel'
import EventFeed from '../components/dashboard/EventFeed'
import BottomBar from '../components/dashboard/BottomBar'
import FlashOverlay from '../components/dashboard/FlashOverlay'
import CameraLayout from '../components/dashboard/CameraLayout'
import { useMatchStore } from '../store/matchStore'
import styles from './Dashboard.module.css'

export default function Dashboard() {
  const requestSync = useMatchStore((s) => s.requestSync)
  const cameraCount = useMatchStore((s) => s.cameraCount)

  useEffect(() => { requestSync() }, [])

  return (
    <div className={styles.root}>
      {/* ── 1. Placar (com campeonato integrado) ── */}
      <ScoreBoard />

      {/* ── 2. Zona principal ── */}
      <div className={styles.mainArea}>

        {/* Escalação esquerda — ocupa toda a altura */}
        <div className={styles.lineupCol}>
          <LineupPanel team="a" />
        </div>

        {/* Coluna central: câmeras em cima, eventos embaixo */}
        <div className={styles.centerCol}>
          <div className={styles.cameraZone}>
            <CameraLayout count={cameraCount} />
          </div>
          <div className={styles.eventsZone}>
            <EventFeed />
          </div>
        </div>

        {/* Escalação direita — ocupa toda a altura */}
        <div className={styles.lineupCol}>
          <LineupPanel team="b" />
        </div>

      </div>

      {/* ── 3. Barra inferior ── */}
      <BottomBar />

      <FlashOverlay />
    </div>
  )
}
