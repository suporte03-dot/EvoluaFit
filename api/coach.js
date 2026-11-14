/**
 * POST /api/coach — Coach IA (Vercel Serverless, Node ESM, sem dependências).
 *
 * Env (só servidor): COACH_AI_API_KEY, COACH_AI_MODEL, COACH_AI_BASE_URL (OpenAI-compatible),
 * SUPABASE_URL + SUPABASE_ANON_KEY (ou VITE_SUPABASE_URL + VITE_SUPABASE_PUBLISHABLE_KEY).
 *
 * Rate limit em memória: vale por instância da função (reinicia em cold start e não é
 * compartilhado entre instâncias). Suficiente como freio; para limite rígido use um store externo.
 */

const MAX_BODY_CHARS = 32000
const MAX_QUESTION_CHARS = 1200
const MAX_RESPOSTA_CHARS = 4000
const MAX_CHANGES = 12
const RATE_PER_MINUTE = 8
const RATE_PER_DAY = 120
const AI_TIMEOUT_MS = 25000
const AUTH_TIMEOUT_MS = 6000
const CHANGE_TYPES = ['adicionar', 'remover', 'trocar', 'ajustar']
const MODES = ['chat', 'explain_proposal']

export const SYSTEM_PROMPT = `Você é o Coach do app EvoluaFit: treinador de musculação, objetivo e cuidadoso. Responda sempre em português do Brasil.

Formato: responda SOMENTE um objeto JSON válido, sem texto fora dele:
{"resposta": "texto para o usuário", "proposta": {"titulo": "...", "mudancas": [{"tipo": "adicionar|remover|trocar|ajustar", "dia": "número ou nome do dia da planilha", "de": "exercício atual", "para": "exercício novo ou prescrição (ex.: 4x8-10 · 90s)", "motivo": "por quê"}]}}
"proposta" é opcional: inclua só quando o usuário pedir para mudar a planilha ativa. Sem pedido de mudança, omita "proposta".

Regras:
- Use o contexto (objetivo, nível, dias, duração, local/equipamento, restrições, planilha ativa, últimas sessões, metas). Não invente dados que não estão no contexto.
- Em "adicionar" e "trocar", use SOMENTE nomes exatos da lista "catalogo". Nunca invente exercícios.
- "dia" deve ser o número ou o nome de um dia que existe em "planilhaAtiva".
- Prescrição de referência (o motor do app valida e corrige): compostos 6-12 repetições, isolados 8-15, descansos em degraus de 15 s.
- Seja direto: até 6 frases curtas ou uma lista breve. Sem promessas de resultado, sem julgar aparência.
- Segurança: você não é médico. Não faça diagnóstico nem prescreva reabilitação. Se o usuário citar dor, lesão, inflamação ou similar, oriente procurar médico ou fisioterapeuta, diga para parar o que causa dor e, se fizer sentido, sugira evitar a região afetada.
- Se a pergunta não for sobre treino, saúde geral ou o app, diga educadamente que só ajuda com treino.`

const EXPLAIN_PROMPT = `Modo "explain_proposal": o motor do app já montou a proposta em "propostaDoMotor". Escreva em "resposta" 2 a 4 frases explicando a lógica da proposta para este usuário (divisão, volume, descanso, por que combina com o objetivo e nível). Não liste todos os exercícios. NÃO inclua "proposta" na resposta.`

export function getConfig(env = process.env) {
  return {
    apiKey: env.COACH_AI_API_KEY || '',
    model: env.COACH_AI_MODEL || 'gpt-4o-mini',
    baseUrl: String(env.COACH_AI_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, ''),
    supabaseUrl: String(env.SUPABASE_URL || env.VITE_SUPABASE_URL || '').replace(/\/+$/, ''),
    supabaseKey: env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY || '',
  }
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

/** Lê e valida o corpo. @returns {{ ok: true, value } | { ok: false, status, error }} */
export function validateCoachRequest(rawBody) {
  let body = rawBody
  if (typeof body === 'string') {
    if (body.length > MAX_BODY_CHARS) return { ok: false, status: 413, error: 'payload_too_large' }
    try {
      body = JSON.parse(body)
    } catch {
      return { ok: false, status: 400, error: 'invalid_json' }
    }
  }
  if (!isPlainObject(body)) return { ok: false, status: 400, error: 'invalid_body' }
  if (JSON.stringify(body).length > MAX_BODY_CHARS) return { ok: false, status: 413, error: 'payload_too_large' }

  const question = typeof body.question === 'string' ? body.question.trim() : ''
  if (!question) return { ok: false, status: 400, error: 'missing_question' }
  if (question.length > MAX_QUESTION_CHARS) return { ok: false, status: 413, error: 'question_too_long' }

  const mode = body.mode == null ? 'chat' : body.mode
  if (!MODES.includes(mode)) return { ok: false, status: 400, error: 'invalid_mode' }
  if (body.context != null && !isPlainObject(body.context)) return { ok: false, status: 400, error: 'invalid_context' }
  if (body.catalog != null && !isPlainObject(body.catalog)) return { ok: false, status: 400, error: 'invalid_catalog' }
  if (body.proposal != null && !isPlainObject(body.proposal)) return { ok: false, status: 400, error: 'invalid_proposal' }
  if (mode === 'explain_proposal' && !body.proposal) return { ok: false, status: 400, error: 'missing_proposal' }

  return {
    ok: true,
    value: {
      question,
      mode,
      context: body.context || {},
      catalog: body.catalog || null,
      proposal: body.proposal || null,
    },
  }
}

export function buildMessages({ question, mode, context, catalog, proposal }) {
  const data = { contexto: context }
  if (mode === 'explain_proposal') data.propostaDoMotor = proposal
  else if (catalog) data.catalogo = catalog
  return [
    { role: 'system', content: mode === 'explain_proposal' ? `${SYSTEM_PROMPT}\n\n${EXPLAIN_PROMPT}` : SYSTEM_PROMPT },
    { role: 'system', content: `Dados do usuário (JSON):\n${JSON.stringify(data)}` },
    { role: 'user', content: question },
  ]
}

function clip(value, max) {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

/** Converte o texto do modelo em { resposta, proposta|null } ou null se inválido. */
export function parseModelOutput(text, { allowProposal = true } = {}) {
  if (typeof text !== 'string' || !text.trim()) return null
  let raw = text.trim()
  const fenced = raw.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i)
  if (fenced) raw = fenced[1]
  if (!raw.startsWith('{')) {
    const start = raw.indexOf('{')
    const end = raw.lastIndexOf('}')
    if (start < 0 || end <= start) return null
    raw = raw.slice(start, end + 1)
  }
  let parsed
  try {
    parsed = JSON.parse(raw)
  } catch {
    return null
  }
  if (!isPlainObject(parsed)) return null
  const resposta = clip(parsed.resposta, MAX_RESPOSTA_CHARS)
  if (!resposta) return null

  let proposta = null
  if (allowProposal && isPlainObject(parsed.proposta) && Array.isArray(parsed.proposta.mudancas)) {
    const mudancas = parsed.proposta.mudancas
      .filter((m) => isPlainObject(m) && CHANGE_TYPES.includes(String(m.tipo || '').toLowerCase()))
      .slice(0, MAX_CHANGES)
      .map((m) => ({
        tipo: String(m.tipo).toLowerCase(),
        dia: typeof m.dia === 'number' ? m.dia : clip(String(m.dia ?? ''), 60),
        de: clip(m.de, 120),
        para: clip(m.para, 120),
        motivo: clip(m.motivo, 240),
      }))
    if (mudancas.length) proposta = { titulo: clip(parsed.proposta.titulo, 120) || 'Ajuste da planilha', mudancas }
  }
  return { resposta, proposta }
}

const buckets = new Map()

/** @returns {{ ok: boolean, retryAfter?: number }} */
export function checkRateLimit(userId, now = Date.now(), store = buckets) {
  const entry = store.get(userId) || { minute: [], dayStart: now, dayCount: 0 }
  if (now - entry.dayStart >= 86400000) {
    entry.dayStart = now
    entry.dayCount = 0
  }
  entry.minute = entry.minute.filter((t) => now - t < 60000)
  if (entry.dayCount >= RATE_PER_DAY) {
    store.set(userId, entry)
    return { ok: false, retryAfter: Math.ceil((entry.dayStart + 86400000 - now) / 1000) }
  }
  if (entry.minute.length >= RATE_PER_MINUTE) {
    store.set(userId, entry)
    return { ok: false, retryAfter: Math.ceil((entry.minute[0] + 60000 - now) / 1000) }
  }
  entry.minute.push(now)
  entry.dayCount += 1
  store.set(userId, entry)
  if (store.size > 5000) {
    for (const [key, value] of store) {
      if (now - value.dayStart >= 86400000) store.delete(key)
    }
  }
  return { ok: true }
}

function send(res, status, payload, headers = {}) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  for (const [key, value] of Object.entries(headers)) res.setHeader(key, value)
  res.end(JSON.stringify(payload))
}

async function fetchWithTimeout(url, options, ms, fetchImpl) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), ms)
  try {
    return await fetchImpl(url, { ...options, signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

function bearer(req) {
  const header = req.headers?.authorization || req.headers?.Authorization || ''
  const match = String(header).match(/^Bearer\s+(.+)$/i)
  return match ? match[1].trim() : ''
}

async function verifyUser(token, config, fetchImpl) {
  const response = await fetchWithTimeout(
    `${config.supabaseUrl}/auth/v1/user`,
    { headers: { apikey: config.supabaseKey, Authorization: `Bearer ${token}` } },
    AUTH_TIMEOUT_MS,
    fetchImpl,
  )
  if (!response.ok) return null
  const user = await response.json().catch(() => null)
  return user?.id ? user : null
}

async function readBody(req) {
  if (req.body !== undefined) return req.body
  let size = 0
  const chunks = []
  for await (const chunk of req) {
    size += chunk.length
    if (size > MAX_BODY_CHARS * 2) return '\u0000too_large'
    chunks.push(chunk)
  }
  return Buffer.concat(chunks).toString('utf8')
}

export function createHandler({ env = process.env, fetchImpl = globalThis.fetch } = {}) {
  return async function handler(req, res) {
    if (req.method !== 'POST') return send(res, 405, { error: 'method_not_allowed' }, { Allow: 'POST' })

    const config = getConfig(env)
    if (!config.apiKey) {
      return send(res, 503, { error: 'ai_not_configured', message: 'O Coach IA ainda não foi configurado no servidor.' })
    }
    if (!config.supabaseUrl || !config.supabaseKey) return send(res, 500, { error: 'server_misconfigured' })

    const token = bearer(req)
    if (!token) return send(res, 401, { error: 'not_authenticated' })

    try {
      let rawBody
      try {
        rawBody = await readBody(req)
      } catch {
        return send(res, 400, { error: 'invalid_json' })
      }
      if (rawBody === '\u0000too_large') return send(res, 413, { error: 'payload_too_large' })
      const checked = validateCoachRequest(rawBody)
      if (!checked.ok) return send(res, checked.status, { error: checked.error })

      let user
      try {
        user = await verifyUser(token, config, fetchImpl)
      } catch {
        return send(res, 503, { error: 'auth_unavailable' })
      }
      if (!user) return send(res, 401, { error: 'not_authenticated' })

      const limit = checkRateLimit(user.id)
      if (!limit.ok) return send(res, 429, { error: 'rate_limited' }, { 'Retry-After': String(limit.retryAfter || 60) })

      const payload = checked.value
      let aiResponse
      try {
        aiResponse = await fetchWithTimeout(
          `${config.baseUrl}/chat/completions`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${config.apiKey}` },
            body: JSON.stringify({
              model: config.model,
              messages: buildMessages(payload),
              temperature: 0.4,
              max_tokens: 900,
              response_format: { type: 'json_object' },
            }),
          },
          AI_TIMEOUT_MS,
          fetchImpl,
        )
      } catch (err) {
        return send(res, err?.name === 'AbortError' ? 504 : 502, {
          error: err?.name === 'AbortError' ? 'ai_timeout' : 'ai_unreachable',
        })
      }

      if (!aiResponse.ok) {
        const busy = aiResponse.status === 429 || aiResponse.status >= 500
        return send(res, busy ? 503 : 502, { error: busy ? 'ai_busy' : 'ai_upstream_error' })
      }

      const data = await aiResponse.json().catch(() => null)
      const content = data?.choices?.[0]?.message?.content
      const parsed = parseModelOutput(content, { allowProposal: payload.mode === 'chat' })
      if (!parsed) return send(res, 502, { error: 'ai_invalid_response' })

      return send(res, 200, parsed)
    } catch {
      return send(res, 500, { error: 'internal_error' })
    }
  }
}

export default createHandler()
