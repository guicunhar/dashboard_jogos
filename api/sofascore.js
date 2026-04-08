// api/sofascore.js — Proxy para SofaScore API
//
// SofaScore bloqueia CORS e exige cookies de sessão válidos.
// Estratégia: faz um handshake na página inicial para obter cookies,
// depois usa esses cookies na chamada da API.

const SOFASCORE_BASE = 'https://www.sofascore.com/api/v1'
const SOFASCORE_HOME = 'https://www.sofascore.com'

const BROWSER_HEADERS = {
  'User-Agent':         'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept':             'application/json, text/plain, */*',
  'Accept-Language':    'en-US,en;q=0.9,pt;q=0.8',
  'Accept-Encoding':    'gzip, deflate, br',
  'Sec-Fetch-Dest':     'empty',
  'Sec-Fetch-Mode':     'cors',
  'Sec-Fetch-Site':     'same-origin',
  'Sec-Ch-Ua':          '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
  'Sec-Ch-Ua-Mobile':   '?0',
  'Sec-Ch-Ua-Platform': '"Windows"',
  'DNT':                '1',
  'Connection':         'keep-alive',
}

// Obtém cookies de sessão fazendo um GET na homepage
async function getSessionCookies() {
  const res = await fetch(SOFASCORE_HOME, {
    method: 'GET',
    headers: {
      ...BROWSER_HEADERS,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
    },
    redirect: 'follow',
  })

  // Extrai os cookies do header Set-Cookie
  const rawCookies = res.headers.getSetCookie?.() || []
  if (rawCookies.length === 0) {
    // Fallback: tenta pegar do header como string
    const single = res.headers.get('set-cookie')
    if (single) rawCookies.push(single)
  }

  // Monta string de cookies: "name=value; name2=value2"
  const cookieStr = rawCookies
    .map(c => c.split(';')[0].trim())
    .filter(Boolean)
    .join('; ')

  return cookieStr
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { path, ...queryParams } = req.query

  if (!path) {
    return res.status(400).json({ error: 'Parâmetro "path" obrigatório.' })
  }

  const qs        = new URLSearchParams(queryParams).toString()
  const targetUrl = `${SOFASCORE_BASE}${path}${qs ? '?' + qs : ''}`

  try {
    // Tenta primeiro sem cookies
    let cookies = ''
    let upstream = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        ...BROWSER_HEADERS,
        'Referer': 'https://www.sofascore.com/',
        'Origin':  'https://www.sofascore.com',
      },
      redirect: 'follow',
    })

    // Se deu 403, tenta com cookies de sessão
    if (upstream.status === 403) {
      cookies  = await getSessionCookies()
      upstream = await fetch(targetUrl, {
        method: 'GET',
        headers: {
          ...BROWSER_HEADERS,
          'Referer': 'https://www.sofascore.com/',
          'Origin':  'https://www.sofascore.com',
          ...(cookies ? { 'Cookie': cookies } : {}),
        },
        redirect: 'follow',
      })
    }

    const text = await upstream.text()

    if (!upstream.ok) {
      return res.status(upstream.status).json({
        error:  `SofaScore retornou ${upstream.status}`,
        url:    targetUrl,
        detail: text.substring(0, 300),
      })
    }

    let data
    try {
      data = JSON.parse(text)
    } catch {
      return res.status(502).json({ error: 'Resposta não é JSON', detail: text.substring(0, 200) })
    }

    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Cache-Control', 's-maxage=20, stale-while-revalidate=40')

    return res.status(200).json(data)
  } catch (err) {
    return res.status(502).json({ error: `Proxy error: ${err.message}` })
  }
}
