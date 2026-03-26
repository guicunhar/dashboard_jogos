import { create } from 'zustand'

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

export const useMatchStore = create((set, get) => ({
  // Teams
  teamA: 'Flamengo',
  teamB: 'Palmeiras',
  colorA: '#3b82f6',
  colorB: '#ef4444',
  competition: 'Campeonato Brasileiro · Série A',

  // Score
  scoreA: 0,
  scoreB: 0,

  // Timer
  timerSec: 0,
  timerRunning: false,
  _timerInterval: null,

  // Lineups
  lineupA: DEFAULT_LINEUP_A,
  lineupB: DEFAULT_LINEUP_B,

  // Events
  events: [],

  // Flash notification
  flash: null,

  // Stats
  stats: { goalsA: 0, goalsB: 0, yellows: 0, reds: 0, subs: 0 },

  // ── SCORE ACTIONS ──
  addGoal: (team) => set((s) => {
    const stats = { ...s.stats }
    if (team === 'a') { stats.goalsA++ ; return { scoreA: s.scoreA + 1, stats } }
    else              { stats.goalsB++ ; return { scoreB: s.scoreB + 1, stats } }
  }),

  removeGoal: (team) => set((s) => {
    const stats = { ...s.stats }
    if (team === 'a' && s.scoreA > 0) { stats.goalsA = Math.max(0, stats.goalsA - 1); return { scoreA: s.scoreA - 1, stats } }
    if (team === 'b' && s.scoreB > 0) { stats.goalsB = Math.max(0, stats.goalsB - 1); return { scoreB: s.scoreB - 1, stats } }
    return {}
  }),

  resetScore: () => set({ scoreA: 0, scoreB: 0, stats: { ...get().stats, goalsA: 0, goalsB: 0 } }),

  // ── TIMER ACTIONS ──
  startTimer: () => {
    const { _timerInterval } = get()
    if (_timerInterval) clearInterval(_timerInterval)
    const interval = setInterval(() => {
      set((s) => ({ timerSec: s.timerSec + 1 }))
    }, 1000)
    set({ timerRunning: true, _timerInterval: interval })
  },

  pauseTimer: () => {
    const { _timerInterval } = get()
    if (_timerInterval) clearInterval(_timerInterval)
    set({ timerRunning: false, _timerInterval: null })
  },

  resetTimer: () => {
    const { _timerInterval } = get()
    if (_timerInterval) clearInterval(_timerInterval)
    set({ timerRunning: false, timerSec: 0, _timerInterval: null })
  },

  setTimerMin: (min) => set({ timerSec: min * 60 }),

  // ── EVENTS ──
  addEvent: (event) => set((s) => ({ events: [event, ...s.events] })),

  clearEvents: () => set({ events: [] }),

  // ── FLASH ──
  showFlash: (text, color = '#f59e0b') => {
    set({ flash: { text, color } })
    setTimeout(() => set({ flash: null }), 2200)
  },

  // ── LINEUP ──
  updateLineup: (team, lineup) => {
    if (team === 'a') set({ lineupA: lineup })
    else set({ lineupB: lineup })
  },

  addCardToPlayer: (team, playerName, cardType) => set((s) => {
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
  setTeamConfig: (cfg) => set(cfg),
}))

// Helper: format timer seconds → "MM:SS"
export const formatTime = (sec) => {
  const m = String(Math.floor(sec / 60)).padStart(2, '0')
  const s = String(sec % 60).padStart(2, '0')
  return `${m}:${s}`
}

// Helper: current match minute string
export const currentMin = (timerSec) => `${Math.floor(timerSec / 60)}'`
