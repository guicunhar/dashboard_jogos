// =============================================================
//  matchApi.js — Integração com API-Football v3
//  https://v3.football.api-sports.io
//  Documentação: https://www.api-football.com/documentation-v3
// =============================================================

// ✏️  CONFIGURE AQUI
const API_BASE_URL = 'https://v3.football.api-sports.io'
const API_KEY      = 'SUA_CHAVE_AQUI'   // sua x-apisports-key

const DEFAULT_HEADERS = { 'x-apisports-key': API_KEY }
const TIMEOUT_MS = 10000

// Mapeamento de posições: G | D | M | F → siglas do dashboard
const POSITION_MAP = { G: 'GOL', D: 'ZAG', M: 'MEI', F: 'ATA' }

// ─────────────────────────────────────────────────────────────
//  UTILITÁRIOS
// ─────────────────────────────────────────────────────────────

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(url, {
      method: 'GET',
      ...options,
      headers: { ...DEFAULT_HEADERS, ...(options.headers || {}) },
      signal: controller.signal,
    })
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      throw new Error(`HTTP ${res.status} — ${res.statusText}${body ? `: ${body.substring(0, 120)}` : ''}`)
    }
    const json = await res.json()
    if (json.errors && Object.keys(json.errors).length > 0) {
      throw new Error(`API-Football: ${Object.values(json.errors).join(' | ')}`)
    }
    return json
  } finally {
    clearTimeout(timer)
  }
}

function normalizePlayer(raw, index) {
  const p = raw.player || {}
  return {
    num:   Number(p.number) || index + 1,
    name:  String(p.name   || `Jogador ${index + 1}`),
    pos:   POSITION_MAP[p.pos] || (p.pos || 'M').toUpperCase().substring(0, 3),
    cards: [],
  }
}

// ─────────────────────────────────────────────────────────────
//  FUNÇÕES PÚBLICAS
// ─────────────────────────────────────────────────────────────

/**
 * Busca informações básicas da partida.
 * GET /fixtures?id={matchId}
 * Retorna: { teamA, teamB, scoreA, scoreB, competition, status }
 */
export async function fetchMatchInfo(matchId) {
  const json  = await fetchWithTimeout(`${API_BASE_URL}/fixtures?id=${matchId}`)
  const match = json.response?.[0]
  if (!match) throw new Error(`Partida ${matchId} não encontrada`)

  return {
    teamA:       String(match.teams?.home?.name || 'Time A'),
    teamB:       String(match.teams?.away?.name || 'Time B'),
    homeTeamId:  match.teams?.home?.id,
    scoreA:      Number(match.goals?.home) ?? 0,
    scoreB:      Number(match.goals?.away) ?? 0,
    competition: match.league?.name
      ? `${match.league.name}${match.league.round ? ' · ' + match.league.round : ''}`
      : 'Competição',
    status: String(match.fixture?.status?.short || 'NS'),
  }
}

/**
 * Busca escalações.
 * GET /fixtures/lineups?fixture={matchId}
 *
 * response[0] = home → startXI[].player.{ number, name, pos }
 * response[1] = away → startXI[].player.{ number, name, pos }
 *
 * Retorna: { lineupA, lineupB, formationA, formationB }
 */
export async function fetchLineups(matchId) {
  const json = await fetchWithTimeout(`${API_BASE_URL}/fixtures/lineups?fixture=${matchId}`)
  const res  = json.response || []

  if (res.length < 2) throw new Error('Escalações ainda não disponíveis para esta partida.')

  const home = res[0]
  const away = res[1]

  return {
    lineupA:    (home.startXI || []).map(normalizePlayer),
    lineupB:    (away.startXI || []).map(normalizePlayer),
    formationA: home.formation || '',
    formationB: away.formation || '',
  }
}

/**
 * Carrega partida completa: info + escalações em paralelo.
 * Eventos são inseridos manualmente — não há chamada para /fixtures/events.
 */
export async function fetchFullMatch(matchId, colorA = '#3b82f6', colorB = '#ef4444') {
  const info    = await fetchMatchInfo(matchId)
  const lineups = await fetchLineups(matchId).catch(() => ({ lineupA: [], lineupB: [] }))

  return {
    teamA:       info.teamA,
    teamB:       info.teamB,
    scoreA:      info.scoreA,
    scoreB:      info.scoreB,
    competition: info.competition,
    status:      info.status,
    lineupA:     lineups.lineupA,
    lineupB:     lineups.lineupB,
  }
}
