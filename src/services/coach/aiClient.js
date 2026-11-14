/**
 * Cliente do endpoint seguro /api/coach (Vercel). A chave da IA fica só no servidor;
 * aqui vai apenas o access_token do Supabase para o servidor identificar o usuário.
 */
import { supabase } from '../../lib/supabase'

const ENDPOINT = '/api/coach'
const TIMEOUT_MS = 30000

export class CoachAIError extends Error {
  constructor(code, status = 0) {
    super(code)
    this.code = code
    this.status = status
  }
}

async function accessToken() {
  if (!supabase) return null
  try {
    const { data } = await supabase.auth.getSession()
    return data?.session?.access_token || null
  } catch {
    return null
  }
}

/**
 * @param {{ question: string, mode?: 'chat'|'explain_proposal', context: object, catalog?: object, proposal?: object }} payload
 * @returns {Promise<{ resposta: string, proposta: object|null }>}
 */
export async function requestCoachAI(payload) {
  const token = await accessToken()
  if (!token) throw new CoachAIError('not_authenticated', 401)

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  let response
  try {
    response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })
  } catch (err) {
    throw new CoachAIError(err?.name === 'AbortError' ? 'timeout' : 'network_error')
  } finally {
    clearTimeout(timer)
  }

  let data = null
  try {
    data = await response.json()
  } catch {
    throw new CoachAIError('invalid_response', response.status)
  }
  if (!response.ok) throw new CoachAIError(data?.error || 'request_failed', response.status)
  if (!data || typeof data.resposta !== 'string' || !data.resposta.trim()) {
    throw new CoachAIError('invalid_response', response.status)
  }
  return { resposta: data.resposta, proposta: data.proposta || null }
}
