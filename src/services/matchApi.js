// =============================================================
//  matchApi.js — Integração com SofaScore API
//
//  Fonte: https://www.sofascore.com/api/v1/event/{id}/...
//
//  ⚠️  ATENÇÃO — CORS:
//  A SofaScore bloqueia chamadas diretas do browser.
//  Você precisa de um proxy. Opções:
//
//  1. Proxy próprio (recomendado):
//     Crie um endpoint na sua API que repassa as chamadas.
//     Ex: GET /api/sofascore?path=/event/123/lineups
//     → seu backend faz fetch em https://www.sofascore.com/api/v1/event/123/lineups
//     → retorna o JSON para o frontend
//
//  2. Proxy público de desenvolvimento (só para testes):
//     const PROXY = 'https://corsproxy.io/?'
//     → substitua SOFASCORE_BASE por `${PROXY}https://www.sofascore.com/api/v1`
//
//  ✏️  Configure a constante abaixo:
// =============================================================

// ─────────────────────────────────────────────────────────────
//  ✏️  CONFIGURE AQUI
// ─────────────────────────────────────────────────────────────

// Opção A — seu proxy próprio (recomendado para produção):
// const API_BASE_URL = 'https://seu-proxy.com/api/sofascore'
// Exemplo de como seu backend deve montar a URL:
//   recebe: GET /api/sofascore/event/123/lineups
//   repassa: GET https://www.sofascore.com/api/v1/event/123/lineups

// Opção B — SofaScore direto (só funciona sem CORS, ex: OBS browser interno):
const API_BASE_URL = 'https://www.sofascore.com/api/v1'

// Opção C — proxy público para testes locais (não use em produção):
// const API_BASE_URL = 'https://corsproxy.io/?https://www.sofascore.com/api/v1'

// Headers para seu proxy (adicione auth se necessário):
const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  // 'x-api-key': 'SEU_TOKEN_AQUI',
}

const TIMEOUT_MS = 10000

// ─────────────────────────────────────────────────────────────
//  UTILITÁRIOS
// ─────────────────────────────────────────────────────────────

// Navega caminhos pontilhados: get(obj, 'a.b.c')
function get(obj, path) {
  if (!path) return obj
  return path.split('.').reduce((acc, k) => (acc != null ? acc[k] : undefined), obj)
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(url, {
      ...options,
      headers: { ...DEFAULT_HEADERS, ...(options.headers || {}) },
      signal: controller.signal,
    })
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      throw new Error(`HTTP ${res.status} — ${res.statusText}${body ? `: ${body.substring(0, 120)}` : ''}`)
    }
    return await res.json()
  } finally {
    clearTimeout(timer)
  }
}

// ─────────────────────────────────────────────────────────────
//  NORMALIZAÇÃO — SofaScore → formato do dashboard
// ─────────────────────────────────────────────────────────────

// Mapa de posições SofaScore → sigla do dashboard
// SofaScore usa: G, D, M, F
const POSITION_MAP = {
  G: 'GOL',
  D: 'ZAG',
  M: 'MEI',
  F: 'ATA',
}

/**
 * Converte um jogador do formato SofaScore para o formato do dashboard.
 *
 * Estrutura SofaScore de cada item em home.players[]:
 * {
 *   shirtNumber: 9,
 *   position: "F",          // G | D | M | F
 *   substitute: false,
 *   player: {
 *     name: "Robert Lewandowski",
 *     shortName: "R. Lewandowski",
 *     id: 41789,
 *     ...
 *   }
 * }
 */
function normalizePlayer(raw, index) {
  const playerData = raw.player || {}
  const pos = raw.position || playerData.position || 'M'

  return {
    num:   Number(raw.shirtNumber || raw.jerseyNumber) || index + 1,
    name:  String(playerData.shortName || playerData.name || `Jogador ${index + 1}`),
    pos:   POSITION_MAP[pos] || pos.toUpperCase().substring(0, 3),
    cards: [],
  }
}

let _evCounter = 9000

/**
 * Converte um evento do formato SofaScore incidents para o formato do dashboard.
 *
 * Tipos comuns na SofaScore:
 * - incidentType: "goal" | "card" | "substitution" | "period" | "injuryTime" | "varDecision"
 * - incidentClass: "regular" | "ownGoal" | "penalty" | "yellow" | "red" | "yellowRed"
 * - isHome: true | false
 *
 * Estrutura exemplo:
 * {
 *   incidentType: "goal",
 *   incidentClass: "regular",
 *   time: 45,
 *   isHome: true,
 *   player: { name: "Pedri", shortName: "Pedri" },
 *   playerIn:  { name: "..." },   // substituição — quem entra
 *   playerOut: { name: "..." },   // substituição — quem sai
 * }
 */
function normalizeIncident(raw, homeTeam, awayTeam, colorA, colorB) {
  const type   = raw.incidentType   || ''
  const cls    = raw.incidentClass  || ''
  const minute = raw.time           || raw.minute || 0
  const addTime = raw.addedTime     || 0
  const isHome = raw.isHome !== undefined ? raw.isHome : true
  const team   = isHome ? 'a' : 'b'
  const color  = isHome ? colorA : colorB
  const teamName = isHome ? homeTeam : awayTeam

  const playerName = raw.player?.shortName || raw.player?.name || ''
  const playerIn   = raw.playerIn?.shortName  || raw.playerIn?.name  || ''
  const playerOut  = raw.playerOut?.shortName || raw.playerOut?.name || ''
  const minStr     = addTime > 0 ? `${minute}+${addTime}'` : `${minute}'`

  let icon = '📋', name = type, borderColor = '#64748b'

  if (type === 'goal') {
    if (cls === 'ownGoal') {
      icon = '⚽'; name = `Gol Contra — ${playerName}`; borderColor = '#ef4444'
    } else if (cls === 'penalty') {
      icon = '⚽'; name = `GOL de Pênalti! — ${playerName}`; borderColor = color
    } else {
      icon = '⚽'; name = `GOL! — ${playerName}`; borderColor = color
    }
  } else if (type === 'card') {
    if (cls === 'yellow') {
      icon = '🟨'; name = `Cartão Amarelo — ${playerName}`; borderColor = '#eab308'
    } else if (cls === 'red') {
      icon = '🟥'; name = `Cartão Vermelho — ${playerName}`; borderColor = '#ef4444'
    } else if (cls === 'yellowRed') {
      icon = '🟥'; name = `Segundo Amarelo — ${playerName}`; borderColor = '#ef4444'
    }
  } else if (type === 'substitution') {
    icon = '🔄'
    name = `Substituição`
    // sub é usado como linha secundária no dashboard
    return {
      id: `api_ev_${++_evCounter}`,
      min: minStr,
      icon,
      name,
      sub: `↑ ${playerIn}  ↓ ${playerOut}`,
      team,
      borderColor: color,
    }
  } else if (type === 'period') {
    // Início/fim de período — opcional mostrar
    if (raw.text === 'HT') {
      icon = '⏸'; name = 'Intervalo'; borderColor = '#64748b'
    } else if (raw.text === 'FT') {
      icon = '🏁'; name = 'Fim de Jogo'; borderColor = '#64748b'
    } else {
      return null // ignora outros períodos
    }
  } else if (type === 'varDecision') {
    icon = '📺'; name = `VAR — ${raw.decision || ''}`; borderColor = '#7c3aed'
  } else if (type === 'injuryTime') {
    return null // ignora acréscimos
  } else {
    return null // ignora tipos desconhecidos
  }

  return {
    id: `api_ev_${++_evCounter}`,
    min: minStr,
    icon,
    name,
    sub: teamName,
    team,
    borderColor,
  }
}

// ─────────────────────────────────────────────────────────────
//  FUNÇÕES PÚBLICAS
// ─────────────────────────────────────────────────────────────

/**
 * Busca informações da partida na SofaScore.
 * Endpoint: GET /event/{matchId}
 *
 * Retorna: { teamA, teamB, scoreA, scoreB, competition, status }
 */
export async function fetchMatchInfo(matchId) {
  const data  = await fetchWithTimeout(`${API_BASE_URL}/event/${matchId}`)
  const event = data.event || data  // SofaScore envolve em { event: {...} }

  return {
    teamA:       String(event.homeTeam?.name       || 'Time A'),
    teamB:       String(event.awayTeam?.name       || 'Time B'),
    scoreA:      Number(event.homeScore?.current)  || 0,
    scoreB:      Number(event.awayScore?.current)  || 0,
    competition: String(event.tournament?.name     || event.season?.tournament?.name || 'Competição'),
    status:      String(event.status?.type         || 'notstarted'),
  }
}

/**
 * Busca escalações da SofaScore.
 * Endpoint: GET /event/{matchId}/lineups
 *
 * Retorna: { lineupA: Player[], lineupB: Player[] }
 *
 * O JSON tem a estrutura:
 * {
 *   home: { players: [ { shirtNumber, position, substitute, player: { name, shortName } } ] },
 *   away: { players: [ ... ] }
 * }
 */
export async function fetchLineups(matchId) {
  const data = await fetchWithTimeout(`${API_BASE_URL}/event/${matchId}/lineups`)

  // Filtra só os titulares (substitute: false)
  const rawHome = (data.home?.players || []).filter(p => !p.substitute)
  const rawAway = (data.away?.players || []).filter(p => !p.substitute)

  return {
    lineupA: rawHome.map(normalizePlayer),
    lineupB: rawAway.map(normalizePlayer),
  }
}

/**
 * Busca todos os titulares + reservas separados.
 * Retorna também os substitutos caso queira exibir no dashboard.
 */
export async function fetchLineupsAll(matchId) {
  const data = await fetchWithTimeout(`${API_BASE_URL}/event/${matchId}/lineups`)

  return {
    lineupA:      (data.home?.players || []).filter(p => !p.substitute).map(normalizePlayer),
    lineupB:      (data.away?.players || []).filter(p => !p.substitute).map(normalizePlayer),
    substitutesA: (data.home?.players || []).filter(p => p.substitute).map(normalizePlayer),
    substitutesB: (data.away?.players || []).filter(p => p.substitute).map(normalizePlayer),
    formationA:   data.home?.formation || '',
    formationB:   data.away?.formation || '',
  }
}

/**
 * Busca os eventos (incidents) da partida na SofaScore.
 * Endpoint: GET /event/{matchId}/incidents
 *
 * Retorna: Event[] (ordenados do mais recente para o mais antigo)
 */
export async function fetchEvents(matchId, homeTeam = '', awayTeam = '', colorA = '#3b82f6', colorB = '#ef4444') {
  const data = await fetchWithTimeout(`${API_BASE_URL}/event/${matchId}/incidents`)
  const raw  = data.incidents || []

  // Normaliza e remove eventos nulos (períodos ignorados, etc.)
  const events = raw
    .map(ev => normalizeIncident(ev, homeTeam, awayTeam, colorA, colorB))
    .filter(Boolean)
    .reverse() // SofaScore retorna em ordem cronológica, dashboard espera mais recente primeiro

  return events
}

/**
 * Carrega partida completa: info + escalações + eventos.
 * Faz 3 chamadas em paralelo para máxima velocidade.
 *
 * Retorna objeto pronto para aplicar direto no store.
 */
export async function fetchFullMatch(matchId, colorA = '#3b82f6', colorB = '#ef4444') {
  const [info, lineups, rawEvents] = await Promise.all([
    fetchMatchInfo(matchId),
    fetchLineups(matchId),
    fetchEvents(matchId, '', '', colorA, colorB).catch(() => []),
    // Eventos podem falhar se a partida ainda não começou — não bloqueia
  ])

  // Reprocessa eventos com os nomes reais dos times
  const events = rawEvents.map(ev => ({
    ...ev,
    sub: ev.sub || (ev.team === 'a' ? info.teamA : info.teamB),
  }))

  return {
    ...info,
    ...lineups,
    events,
  }
}
