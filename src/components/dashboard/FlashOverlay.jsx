import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMatchStore } from '../../store/matchStore'
import styles from './FlashOverlay.module.css'

export default function FlashOverlay() {
  const flash = useMatchStore((s) => s.flash)

  return (
    <AnimatePresence>
      {flash && (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.85 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        >
          <motion.div
            className={styles.badge}
            style={{ background: flash.color, color: flash.color === '#f59e0b' || flash.color === '#eab308' ? '#000' : '#fff' }}
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 0.4, repeat: 2 }}
          >
            {flash.text}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
