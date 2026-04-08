import { create } from 'zustand'

// ── BroadcastChannel: sincroniza estado entre janelas do mesmo origin ──
const CHANNEL_NAME = 'football_broadcast_state'
const bc = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(CHANNEL_NAME) : null

const EXCLUDE_FROM_SYNC = ['_timerInterval', 'flash']

function serializeState(state) {
  const out = {}
  for (const [k, v] of Object.entries(state)) {
    if (EXCLUDE_FROM_SYNC.includes(k)) continue
    if (typeof v === 'function') continue
    out[k] = v
  }
  return out
}

const DEFAULT_LINEUP_A = [
  { num: 1,  name: 'Hugo Souza',        pos: 'GOL', cards: [] },
  { num: 2,  name: 'Varela',            pos: 'LAD', cards: [] },
  { num: 3,  name: 'Léo Pereira',       pos: 'ZAG', cards: [] },
  { num: 4,  name: 'David Luiz',        pos: 'ZAG', cards: [] },
  { num: 6,  name: 'Ayrton Lucas',      pos: 'LAE', cards: [] },
  { num: 5,  name: 'Pulgar',            pos: 'VOL', cards: [] },
  { num: 8,  name: 'De la Cruz',        pos: 'MEI', cards: [] },
  { num: 7,  name: 'Everton Cebolinha', pos: 'ATA', cards: [] },
  { num: 10, name: 'Arrascaeta',        pos: 'MEI', cards: [] },
  { num: 11, name: 'Gabigol',           pos: 'ATA', cards: [] },
  { num: 9,  name: 'Pedro',             pos: 'CA',  cards: [] },
]

const DEFAULT_LINEUP_B = [
  { num: 1,  name: 'Weverton',        pos: 'GOL', cards: [] },
  { num: 2,  name: 'Marcos Rocha',    pos: 'LAD', cards: [] },
  { num: 3,  name: 'Murilo',          pos: 'ZAG', cards: [] },
  { num: 4,  name: 'Gustavo Gómez',   pos: 'ZAG', cards: [] },
  { num: 6,  name: 'Piquerez',        pos: 'LAE', cards: [] },
  { num: 5,  name: 'Aníbal Moreno',   pos: 'VOL', cards: [] },
  { num: 8,  name: 'Richard Rios',    pos: 'MEI', cards: [] },
  { num: 7,  name: 'Mayke',           pos: 'LAD', cards: [] },
  { num: 10, name: 'Raphael Veiga',   pos: 'MEI', cards: [] },
  { num: 11, name: 'Dudu',            pos: 'ATA', cards: [] },
  { num: 9,  name: 'Flaco López',     pos: 'CA',  cards: [] },
]

export const useMatchStore = create((set, get) => {

  // syncSet: aplica o set localmente E transmite o novo estado para outras janelas
  const syncSet = (updater) => {
    set(updater)
    setTimeout(() => {
      if (bc) bc.postMessage({ type: 'STATE_SYNC', payload: serializeState(get()) })
    }, 0)
  }

  return {
    // Teams
    teamA: 'Flamengo',
    teamB: 'Palmeiras',
    colorA: '#3b82f6',
    colorB: '#ef4444',
    competition: 'Campeonato Brasileiro · Série A',
    matchId: '',

    // Score
    scoreA: 0,
    scoreB: 0,

    // Timer — roda no painel de controle e envia ticks via broadcast
    timerSec: 0,
    timerRunning: false,
    _timerInterval: null,

    // Lineups
    lineupA: DEFAULT_LINEUP_A,
    lineupB: DEFAULT_LINEUP_B,

    // Events
    events: [],

    // Flash (local por janela, mas disparado remotamente via broadcast)
    flash: null,

    // Camera layout
    cameraCount: 1,
    // Config de cada câmera: array de { type: 'placeholder'|'webcam'|'vdo', src: '' }
    cameras: [
      { type: 'placeholder', src: '' },
      { type: 'placeholder', src: '' },
      { type: 'placeholder', src: '' },
      { type: 'placeholder', src: '' },
      { type: 'placeholder', src: '' },
      { type: 'placeholder', src: '' },
    ],

    // Stats
    stats: { goalsA: 0, goalsB: 0, yellows: 0, reds: 0, subs: 0 },

    // ── SCORE ──
    addGoal: (team) => syncSet((s) => {
      const stats = { ...s.stats }
      if (team === 'a') { stats.goalsA++; return { scoreA: s.scoreA + 1, stats } }
      else              { stats.goalsB++; return { scoreB: s.scoreB + 1, stats } }
    }),

    removeGoal: (team) => syncSet((s) => {
      const stats = { ...s.stats }
      if (team === 'a' && s.scoreA > 0) { stats.goalsA = Math.max(0, stats.goalsA - 1); return { scoreA: s.scoreA - 1, stats } }
      if (team === 'b' && s.scoreB > 0) { stats.goalsB = Math.max(0, stats.goalsB - 1); return { scoreB: s.scoreB - 1, stats } }
      return {}
    }),

    resetScore: () => syncSet((s) => ({ scoreA: 0, scoreB: 0, stats: { ...s.stats, goalsA: 0, goalsB: 0 } })),

    // ── TIMER ──
    startTimer: () => {
      const { _timerInterval } = get()
      if (_timerInterval) clearInterval(_timerInterval)
      const interval = setInterval(() => {
        const newSec = get().timerSec + 1
        set({ timerSec: newSec })
        if (bc) bc.postMessage({ type: 'TIMER_TICK', payload: { timerSec: newSec } })
      }, 1000)
      set({ timerRunning: true, _timerInterval: interval })
      if (bc) bc.postMessage({ type: 'STATE_SYNC', payload: serializeState({ ...get(), timerRunning: true }) })
    },

    pauseTimer: () => {
      const { _timerInterval } = get()
      if (_timerInterval) clearInterval(_timerInterval)
      set({ timerRunning: false, _timerInterval: null })
      if (bc) bc.postMessage({ type: 'STATE_SYNC', payload: serializeState({ ...get(), timerRunning: false }) })
    },

    resetTimer: () => {
      const { _timerInterval } = get()
      if (_timerInterval) clearInterval(_timerInterval)
      set({ timerRunning: false, timerSec: 0, _timerInterval: null })
      if (bc) bc.postMessage({ type: 'STATE_SYNC', payload: serializeState({ ...get(), timerRunning: false, timerSec: 0 }) })
    },

    setTimerMin: (min) => {
      set({ timerSec: min * 60 })
      if (bc) bc.postMessage({ type: 'TIMER_TICK', payload: { timerSec: min * 60 } })
    },

    // ── EVENTS ──
    addEvent: (event) => syncSet((s) => ({ events: [event, ...s.events] })),
    clearEvents: () => syncSet({ events: [] }),

    // ── FLASH ──
    showFlash: (text, color = '#f59e0b') => {
      set({ flash: { text, color } })
      if (bc) bc.postMessage({ type: 'FLASH', payload: { text, color } })
      setTimeout(() => set({ flash: null }), 2200)
    },

    // ── LINEUP ──
    updateLineup: (team, lineup) => syncSet(team === 'a' ? { lineupA: lineup } : { lineupB: lineup }),

    addCardToPlayer: (team, playerName, cardType) => syncSet((s) => {
      const key = team === 'a' ? 'lineupA' : 'lineupB'
      const lineup = s[key].map((p) => {
        if (p.name.toLowerCase().includes(playerName.toLowerCase())) {
          return { ...p, cards: [...p.cards, cardType] }
        }
        return p
      })
      return { [key]: lineup }
    }),

    // ── CONFIG ──
    setTeamConfig: (cfg) => syncSet(cfg),

    // Atualiza a config de uma câmera específica pelo índice
    setCameraConfig: (index, camCfg) => syncSet((s) => {
      const cameras = [...s.cameras]
      cameras[index] = { ...cameras[index], ...camCfg }
      return { cameras }
    }),

    // ── RECEBER SYNC (Dashboard aplica estado recebido sem sobrescrever interval/flash) ──
    applyRemoteState: (payload) => {
      // eslint-disable-next-line no-unused-vars
      const { _timerInterval, flash, ...safe } = payload
      set(safe)
    },

    applyFlash: (text, color) => {
      set({ flash: { text, color } })
      setTimeout(() => set({ flash: null }), 2200)
    },

    // Dashboard solicita estado ao abrir
    requestSync: () => {
      if (bc) bc.postMessage({ type: 'REQUEST_STATE' })
    },

    respondSync: () => {
      if (bc) bc.postMessage({ type: 'STATE_SYNC', payload: serializeState(get()) })
    },
  }
})

// ── Listener global do BroadcastChannel ──
if (bc) {
  bc.onmessage = (event) => {
    const { type, payload } = event.data
    const store = useMatchStore.getState()

    if (type === 'STATE_SYNC') {
      store.applyRemoteState(payload)
    }

    if (type === 'TIMER_TICK') {
      useMatchStore.setState({ timerSec: payload.timerSec })
    }

    if (type === 'FLASH') {
      store.applyFlash(payload.text, payload.color)
    }

    if (type === 'REQUEST_STATE') {
      // Só responde se for o painel de controle (tem timerInterval ativo ou é a janela de controle)
      store.respondSync()
    }
  }
}

// Helper: format timer seconds → "MM:SS"
export const formatTime = (sec) => {
  const m = String(Math.floor(sec / 60)).padStart(2, '0')
  const s = String(sec % 60).padStart(2, '0')
  return `${m}:${s}`
}

// Helper: current match minute string
export const currentMin = (timerSec) => `${Math.floor(timerSec / 60)}'`
