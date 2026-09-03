// ============================================================
//  CLOUD PROVIDERS — phone pe crash-free AI (koi download nahi)
//  cloud  : Pollinations free anonymous tier (koi key nahi)
//  gemini : Google AI Studio free key — Gemini 2.5 Flash (BEST)
//  local  : WebLLM on-device (sirf strong desktop/devices)
// ============================================================

export const PROVIDERS = [
  {
    id: 'cloud',
    label: 'Cloud AI — Instant (koi key nahi)',
    desc: 'Internet chahiye, koi download nahi — phone pe crash nahi. Free anonymous tier.',
  },
  {
    id: 'gemini',
    label: 'Gemini 2.5 Flash — BEST (free key)',
    desc: 'Google AI Studio se 30 sec mein FREE key — sabse smart jawab, daily free limit boht badi.',
  },
  {
    id: 'local',
    label: 'On-Device — Offline (sirf desktop)',
    desc: 'Model download hota hai; strong PC/laptop ke liye. Mobile pe crash ho sakta hai.',
  },
]

const POLLI = 'https://text.pollinations.ai/openai'

// ---------- helpers ----------
async function readSSE(res, extractDelta) {
  const reader = res.body.getReader()
  const dec = new TextDecoder()
  let buf = '', full = ''
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    buf += dec.decode(value, { stream: true })
    const lines = buf.split('\n')
    buf = lines.pop()
    for (const l of lines) {
      const t = l.trim()
      if (!t.startsWith('data:')) continue
      const d = t.slice(5).trim()
      if (d === '[DONE]') return full
      try {
        const delta = extractDelta(JSON.parse(d))
        if (delta) full += delta
      } catch { /* partial json ignore */ }
    }
  }
  return full
}

// ---------- CLOUD (Pollinations free, no key) ----------
export async function streamCloud(messages, onDelta, maxTokens = 800) {
  // try 1: POST streaming
  try {
    const res = await fetch(POLLI, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, model: 'openai-fast', stream: true, private: true, max_tokens: maxTokens, referrer: 'astro-guru' }),
    })
    if (res.ok && res.body && (res.headers.get('content-type') || '').includes('text/event-stream')) {
      const full = await readSSE(res, (j) => j.choices?.[0]?.delta?.content || '')
      if (full) { onDelta(full); return full }
      throw new Error('empty stream')
    }
    // non-stream JSON maybe
    if (res.ok && res.body) {
      const txt = await res.text()
      try {
        const j = JSON.parse(txt)
        const out = j.choices?.[0]?.message?.content || ''
        if (out) { onDelta(out); return out }
      } catch { /* fallthrough */ }
      throw new Error('cloud parse fail')
    }
    throw new Error('cloud http ' + res.status)
  } catch (e) {
    // try 2: GET (short prompts only)
    const sys = messages.filter((m) => m.role === 'system').map((m) => m.content).join('\n').slice(0, 400)
    const usr = messages.map((m) => m.content).join('\n\n')
    if (usr.length < 1600) {
      const url = `https://text.pollinations.ai/${encodeURIComponent(usr)}?model=openai-fast&system=${encodeURIComponent(sys)}`
      const res2 = await fetch(url)
      if (res2.ok) {
        const out = await res2.text()
        if (out && !out.includes('"error"')) { onDelta(out); return out }
      }
    }
    throw e
  }
}

// ---------- GEMINI 2.5 FLASH (free AI Studio key) ----------
export async function streamGemini(messages, key, onDelta, maxTokens = 1100) {
  const sys = messages.filter((m) => m.role === 'system').map((m) => m.content).join('\n')
  const contents = messages
    .filter((m) => m.role !== 'system')
    .slice(-8)
    .map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }))
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse&key=${encodeURIComponent(key)}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: sys }] },
      contents,
      generationConfig: { maxOutputTokens: maxTokens, temperature: 0.7 },
    }),
  })
  if (!res.ok || !res.body) {
    const errTxt = await res.text().catch(() => '')
    throw new Error(errTxt.includes('API_KEY_INVALID') ? 'Key galat hai — dobara check karo' : 'Gemini connect nahi hua (' + res.status + ')')
  }
  const full = await readSSE(res, (j) => j.candidates?.[0]?.content?.parts?.[0]?.text || '')
  if (!full) throw new Error('empty')
  onDelta(full)
  return full
}
