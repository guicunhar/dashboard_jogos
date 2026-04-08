// api/sofascore.js — Proxy para SofaScore API
//
// SofaScore não tem autenticação por chave, mas bloqueia CORS no browser.
// Este proxy roda no servidor Vercel e repassa qualquer rota.
//
// Uso: /api/sofascore?path=/event/123/lineups
// → repassa para: https://www.sofascore.com/api/v1/event/123/lineups

const SOFASCORE_BASE = 'https://www.sofascore.com/api/v1'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { path, ...queryParams } = req.query

  if (!path) {
    return res.status(400).json({ error: 'Parâmetro "path" obrigatório. Ex: /api/sofascore?path=/event/123/lineups' })
  }

  const qs        = new URLSearchParams(queryParams).toString()
  const targetUrl = `${SOFASCORE_BASE}${path}${qs ? '?' + qs : ''}`

  try {
    const upstream = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        // SofaScore requer estes headers para não retornar 403
        'User-Agent':      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept':          'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer':         'https://www.sofascore.com/',
        'Origin':          'https://www.sofascore.com',
        'Cache-Control':   'no-cache',
      },
    })

    if (!upstream.ok) {
      return res.status(upstream.status).json({
        error: `SofaScore retornou ${upstream.status}`,
        url: targetUrl,
      })
    }

    const data = await upstream.json()

    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET')
    // Cache curto para dados ao vivo
    res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate=30')

    return res.status(200).json(data)
  } catch (err) {
    return res.status(502).json({ error: `Proxy error: ${err.message}` })
  }
}
