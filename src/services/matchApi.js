// =============================================================
//  matchApi.js — Integração com API-Football v3 ou SofaScore
//
//  Ambas as APIs são chamadas via proxy Vercel (/api/football
//  e /api/sofascore) para evitar CORS.
//
//  ✏️  Para API-Football: configure a chave em:
//  Vercel → Settings → Environment Variables → API_FOOTBALL_KEY
//
//  SofaScore não precisa de chave.
// =============================================================

// ✏️  Escolha a fonte padrão: 'football' | 'sofascore'
export const DEFAULT_SOURCE = 'sofascore'

const TIMEOUT_MS    = 12000
const POSITION_MAP  = { G: 'GOL', D: 'ZAG', M: 'MEI', F: 'ATA' }
const IS_DEV        = import.meta.env.DEV

// ─────────────────────────────────────────────────────────────
//  UTILITÁRIOS
// ─────────────────────────────────────────────────────────────

function buildUrl(proxy, path, params = {}) {
  const qs = new URLSearchParams(params).toString()

  if (IS_DEV) {
    // Desenvolvimento local: use `vercel dev` para ter o proxy.
    // Fallback direto (pode dar CORS):
    if (proxy === 'sofascore') return `https://www.sofascore.com/api/v1${path}${qs ? '?' + qs : ''}`
    return `https://v3.football.api-sports.io${path}${qs ? '?' + qs : ''}`
  }

  // Produção: proxy Vercel
  return `/api/${proxy}?path=${encodeURIComponent(path)}${qs ? '&' + qs : ''}`
}

// ✏️  Só necessário para dev local com API-Football (não o SofaScore)
const DEV_FOOTBALL_KEY = 'SUA_CHAVE_AQUI'

async function fetchProxy(proxy, path, params = {}) {
  const url        = buildUrl(proxy, path, params)
  const controller = new AbortController()
  const timer      = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const headers = (IS_DEV && proxy === 'football')
      ? { 'x-apisports-key': DEV_FOOTBALL_KEY }
      : {}

    const res = await fetch(url, { method: 'GET', headers, signal: controller.signal })

    if (!res.ok) {
      const body = await res.text().catch(() => '')
      throw new Error(`HTTP ${res.status}${body ? ': ' + body.substring(0, 150) : ''}`)
    }

    const json = await res.json()

    // API-Football encapsula erros em json.errors
    if (json.errors && Object.keys(json.errors).length > 0) {
      throw new Error(Object.values(json.errors).join(' | '))
    }

    return json
  } finally {
    clearTimeout(timer)
  }
}

// ─────────────────────────────────────────────────────────────
//  NORMALIZAÇÃO — SofaScore
//
//  Lineups: /event/{id}/lineups
//  {
//    home: { players: [ { shirtNumber, position, substitute, player: { name, shortName } } ] },
//    away: { ... }
//  }
//
//  Info: /event/{id}
//  { event: { homeTeam: { name }, awayTeam: { name }, homeScore: { current },
//             awayScore: { current }, tournament: { name }, status: { type } } }
// ─────────────────────────────────────────────────────────────

function normalizePlayerSofa(raw, index) {
  const p   = raw.player || {}
  const pos = raw.position || p.position || 'M'
  return {
    num:   Number(raw.shirtNumber || raw.jerseyNumber) || index + 1,
    name:  String(p.shortName || p.name || `Jogador ${index + 1}`),
    pos:   POSITION_MAP[pos] || pos.toUpperCase().substring(0, 3),
    cards: [],
  }
}

async function fetchMatchInfoSofa(matchId) {
  const json  = await fetchProxy('sofascore', `/event/${matchId}`)
  const event = json.event || json

  return {
    teamA:       String(event.homeTeam?.name              || 'Time A'),
    teamB:       String(event.awayTeam?.name              || 'Time B'),
    homeTeamId:  event.homeTeam?.id,
    scoreA:      Number(event.homeScore?.current)         ?? 0,
    scoreB:      Number(event.awayScore?.current)         ?? 0,
    competition: String(
      event.tournament?.name ||
      event.season?.tournament?.name ||
      'Competição'
    ),
    status: String(event.status?.type || 'notstarted'),
  }
}

async function fetchLineupsSofa(matchId) {
  const json = await fetchProxy('sofascore', `/event/${matchId}/lineups`)

  const rawHome = (json.home?.players || []).filter(p => !p.substitute)
  const rawAway = (json.away?.players || []).filter(p => !p.substitute)

  if (rawHome.length === 0 && rawAway.length === 0) {
    throw new Error('Escalações ainda não disponíveis para esta partida.')
  }

  return {
    lineupA:    rawHome.map(normalizePlayerSofa),
    lineupB:    rawAway.map(normalizePlayerSofa),
    formationA: json.home?.formation || '',
    formationB: json.away?.formation || '',
  }
}

// ─────────────────────────────────────────────────────────────
//  NORMALIZAÇÃO — API-Football
//
//  Fixtures: /fixtures?id={id}
//  Lineups:  /fixtures/lineups?fixture={id}
//  { response: [ { team, formation, startXI: [ { player: { name, number, pos } } ] } ] }
// ─────────────────────────────────────────────────────────────

function normalizePlayerFootball(raw, index) {
  const p = raw.player || {}
  return {
    num:   Number(p.number) || index + 1,
    name:  String(p.name   || `Jogador ${index + 1}`),
    pos:   POSITION_MAP[p.pos] || (p.pos || 'M').toUpperCase().substring(0, 3),
    cards: [],
  }
}

async function fetchMatchInfoFootball(matchId) {
  const json  = await fetchProxy('football', '/fixtures', { id: matchId })
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

async function fetchLineupsFootball(matchId) {
  const json = await fetchProxy('football', '/fixtures/lineups', { fixture: matchId })
  const res  = json.response || []

  if (res.length < 2) throw new Error('Escalações ainda não disponíveis para esta partida.')

  return {
    lineupA:    (res[0].startXI || []).map(normalizePlayerFootball),
    lineupB:    (res[1].startXI || []).map(normalizePlayerFootball),
    formationA: res[0].formation || '',
    formationB: res[1].formation || '',
  }
}

// ─────────────────────────────────────────────────────────────
//  FUNÇÕES PÚBLICAS — usadas pelo TeamConfig
// ─────────────────────────────────────────────────────────────

/**
 * Busca informações básicas da partida.
 * @param {string} matchId
 * @param {'sofascore'|'football'} source
 */
export async function fetchMatchInfo(matchId, source = DEFAULT_SOURCE) {
  return source === 'sofascore'
    ? fetchMatchInfoSofa(matchId)
    : fetchMatchInfoFootball(matchId)
}

/**
 * Busca escalações.
 * @param {string} matchId
 * @param {'sofascore'|'football'} source
 */
export async function fetchLineups(matchId, source = DEFAULT_SOURCE) {
  return source === 'sofascore'
    ? fetchLineupsSofa(matchId)
    : fetchLineupsFootball(matchId)
}

/**
 * Carrega tudo: info + escalações.
 * Eventos são sempre manuais.
 * @param {string} matchId
 * @param {'sofascore'|'football'} source
 */
export async function fetchFullMatch(matchId, source = DEFAULT_SOURCE) {
  const info    = await fetchMatchInfo(matchId, source)
  const lineups = await fetchLineups(matchId, source).catch(e => {
    console.warn('Escalações indisponíveis:', e.message)
    return { lineupA: [], lineupB: [] }
  })

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
