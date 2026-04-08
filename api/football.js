// api/football.js — Proxy para API-Football v3
//
// Roda no servidor Vercel, portanto não tem problema de CORS.
// O frontend chama /api/football?path=/fixtures?id=123
// Esta função repassa para https://v3.football.api-sports.io/fixtures?id=123
//
// ✏️  Coloque sua chave na variável de ambiente do Vercel:
//    Dashboard → Settings → Environment Variables → API_FOOTBALL_KEY

const API_BASE = 'https://v3.football.api-sports.io'

export default async function handler(req, res) {
  // Só aceita GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Pega o caminho desejado: ?path=/fixtures/lineups&fixture=123
  const { path, ...queryParams } = req.query

  if (!path) {
    return res.status(400).json({ error: 'Parâmetro "path" obrigatório. Ex: /api/football?path=/fixtures&id=123' })
  }

  // Monta a query string com os demais parâmetros
  const qs = new URLSearchParams(queryParams).toString()
  const targetUrl = `${API_BASE}${path}${qs ? '?' + qs : ''}`

  // Pega a chave da variável de ambiente (nunca exposta no frontend)
  const apiKey = process.env.API_FOOTBALL_KEY

  if (!apiKey) {
    return res.status(500).json({
      error: 'API_FOOTBALL_KEY não configurada. Acesse Vercel → Settings → Environment Variables.'
    })
  }

  try {
    const upstream = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'x-apisports-key': apiKey,
        'Content-Type': 'application/json',
      },
    })

    const data = await upstream.json()

    // Repassa o status e os headers CORS para o browser
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET')
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60')

    return res.status(upstream.status).json(data)
  } catch (err) {
    return res.status(502).json({ error: `Proxy error: ${err.message}` })
  }
}
