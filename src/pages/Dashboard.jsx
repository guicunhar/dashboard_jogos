import React from 'react'
import ScoreBoard from '../components/dashboard/ScoreBoard'
import LineupPanel from '../components/dashboard/LineupPanel'
import EventFeed from '../components/dashboard/EventFeed'
import BottomBar from '../components/dashboard/BottomBar'
import FlashOverlay from '../components/dashboard/FlashOverlay'
import styles from './Dashboard.module.css'

export default function Dashboard() {
  return (
    <div className={styles.root}>
      <ScoreBoard />
      <div className={styles.main}>
        <LineupPanel team="a" />
        <EventFeed />
        <LineupPanel team="b" />
      </div>
      <BottomBar />
      <FlashOverlay />
    </div>
  )
}
