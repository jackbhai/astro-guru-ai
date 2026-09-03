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
    id: 'groq',
    label: 'Groq — DeepSeek R1 / Llama 70B (free key)',
    desc: 'Sabse FAST cloud AI — reasoning wala DeepSeek R1 bhi free! console.groq.com se key.',
  },
  {
    id: 'gemini',
    label: 'Gemini 2.5 Flash — BEST quality (free key)',
    desc: 'Google AI Studio se 30 sec mein FREE key — sabse smart jawab, daily free limit boht badi.',
  },
  {
    id: 'local',
    label: 'On-Device — Offline (sirf desktop)',
    desc: 'Model download hota hai; strong PC/laptop ke liye. Mobile pe crash ho sakta hai.',
  },
]

export const GROQ_MODELS = [
  { id: 'deepseek-r1-distill-llama-70b', label: 'DeepSeek R1 · 70B (Reasoning)', desc: 'Soch kar jawab deta hai — thinking bhi dikhti hai' },
  { id: 'llama-3.3-70b-versatile', label: 'Llama 3.3 · 70B (All-rounder)', desc: 'Meta ka bada model — strong general answers' },
  { id: 'qwen/qwen3-32b', label: 'Qwen 3 · 32B (Multilingual)', desc: 'Hinglish/multilingual strong' },
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
  // try 1: POST (stream ya simple, dono handle)
  const res = await fetch(POLLI, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, model: 'openai-fast', stream: true, private: true, max_tokens: maxTokens, referrer: 'astro-guru-ai' }),
  })
  if (res.ok) {
    const raw = await res.text()
    // SSE?
    if (raw.includes('data:')) {
      let full = ''
      for (const line of raw.split('\n')) {
        const t = line.trim()
        if (!t.startsWith('data:') || t.includes('[DONE]')) continue
        try {
          const j = JSON.parse(t.slice(5).trim())
          full += j.choices?.[0]?.delta?.content || j.choices?.[0]?.message?.content || ''
        } catch { /* skip */ }
        if (full) onDelta(full)
      }
      if (full) return full
    }
    // plain JSON / plain text
    try {
      const j = JSON.parse(raw)
      const out = j.choices?.[0]?.message?.content || raw
      if (out) { onDelta(out); return out }
    } catch {
      if (raw && raw.length > 5) { onDelta(raw); return raw }
    }
  }
  // try 2: GET (short prompts only)
  const sys = messages.filter((m) => m.role === 'system').map((m) => m.content).join('\n').slice(0, 400)
  const usr = messages.map((m) => m.content).join('\n\n')
  if (usr.length < 1600) {
    const res2 = await fetch(`https://text.pollinations.ai/${encodeURIComponent(usr)}?model=openai-fast&system=${encodeURIComponent(sys)}`)
    if (res2.ok) {
      const out = await res2.text()
      if (out && !out.includes('"error"')) { onDelta(out); return out }
    }
  }
  throw new Error('Cloud AI connect nahi hua — Groq (free key) ya Gemini mode try karo')
}

// ---------- GROQ (free key — DeepSeek R1 reasoning + Llama 70B, ultra fast) ----------
export async function streamGroq(messages, key, model, onDelta, maxTokens = 1100) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model, messages, stream: true, max_completion_tokens: maxTokens, temperature: 0.6 }),
  })
  if (!res.ok || !res.body) {
    const t = await res.text().catch(() => '')
    throw new Error(t.includes('invalid_api_key') || t.includes('Incorrect API key') ? 'Groq key galat hai — dobara check karo' : 'Groq connect nahi hua (' + res.status + ')')
  }
  const full = await readSSE(res, (j) => j.choices?.[0]?.delta?.content || '')
  if (!full) throw new Error('empty')
  onDelta(full)
  return full
}
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
