// ============================================================
//  CLOUD PROVIDERS — phone pe crash-free AI (koi download nahi)
//  cloud  : Pollinations free anonymous tier (koi key nahi)
//  gemini : Google AI Studio free key — Gemini 2.5 Flash (BEST)
//  local  : WebLLM on-device (sirf strong desktop/devices)
// ============================================================

export const PROVIDERS = [
  {
    id: 'cloud',
    label: 'Free Cloud — NO KEY (bas chalao)',
    desc: 'Kuch daalne ki zaroorat NAHI — na key, na download. Kholo aur chat chalu. Thinking bhi dikhti hai.',
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

// reasoning_content + content ko ek display stream mein jodta hai (<think>...</think> format mein)
export function makeReasoningAssembler(onDelta) {
  let r = '', c = '', inlineThink = false
  const emit = () => {
    if (inlineThink || !r) onDelta(c) // content mein khud <think> hai to wahi chalta rahe
    else if (!c) onDelta(`<think>${r}`) // abhi sirf soch chal rahi
    else onDelta(`<think>${r}</think>${c}`)
  }
  return {
    reasoning(chunk) { if (!inlineThink) { r += chunk; emit() } },
    content(chunk) {
      c += chunk
      if (c.includes('<think')) inlineThink = true
      emit()
    },
    final() { emit() },
  }
}

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

// ---------- CLOUD (Pollinations free anonymous tier — NO KEY) ----------
// NOTE: "openai-fast" alias deprecated (500 deta) — "openai" hi working model hai
async function cloudPostOnce(messages, maxTokens, onDelta, model = 'openai') {
  const res = await fetch(POLLI, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, model, stream: true, private: true, max_tokens: maxTokens, referrer: 'astro-guru' }),
  })
  if (!res.ok) throw new Error('http ' + res.status)
  const raw = await res.text()
  if (raw.includes('data:')) {
    const asm = makeReasoningAssembler(onDelta)
    let got = ''
    for (const line of raw.split('\n')) {
      const t = line.trim()
      if (!t.startsWith('data:') || t.includes('[DONE]')) continue
      try {
        const j = JSON.parse(t.slice(5).trim())
        const d = j.choices?.[0]?.delta || j.choices?.[0]?.message || {}
        if (d.reasoning_content) { got += d.reasoning_content; asm.reasoning(d.reasoning_content) }
        if (d.content) { got += d.content; asm.content(d.content) }
      } catch { /* skip bad line */ }
    }
    asm.final()
    if (got.trim()) return got
  }
  try {
    const j = JSON.parse(raw)
    const out = j.choices?.[0]?.message?.content || ''
    if (out) { onDelta(out); return out }
  } catch {
    if (raw && raw.trim().length > 5) { onDelta(raw.trim()); return raw.trim() }
  }
  throw new Error('empty response')
}

export async function streamCloud(messages, onDelta, maxTokens = 800) {
  const errs = []
  // try 1: POST model=openai (primary — verified 200/SSE working)
  try {
    return await cloudPostOnce(messages, maxTokens, onDelta, 'openai')
  } catch (e) { errs.push('post-openai:' + e.message) }
  // try 2: GET — gen domain (sandbox mein bhi verified, anti-bot loose)
  const sys = messages.filter((m) => m.role === 'system').map((m) => m.content).join('\n').slice(0, 350)
  const usr = messages.map((m) => m.content).join('\n\n')
  const qs = `?model=openai&system=${encodeURIComponent(sys)}`
  if (usr.length < 3200) {
    try {
      const r = await fetch(`https://gen.pollinations.ai/text/${encodeURIComponent(usr)}${qs}`)
      if (r.ok) {
        const out = (await r.text()).trim()
        if (out && !out.includes('"error"')) { onDelta(out); return out }
      }
    } catch (e) { errs.push('gen-get:' + e.message) }
    // try 3: GET legacy text domain
    try {
      const r = await fetch(`https://text.pollinations.ai/${encodeURIComponent(usr)}${qs}`)
      if (r.ok) {
        const out = (await r.text()).trim()
        if (out && !out.includes('"error"')) { onDelta(out); return out }
      }
    } catch (e) { errs.push('text-get:' + e.message) }
  }
  throw new Error('cloud fail [' + errs.join(' | ').slice(0, 60) + ']')
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
  const asm = makeReasoningAssembler(onDelta)
  let full = ''
  const reader = res.body.getReader()
  const dec = new TextDecoder()
  let buf = ''
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
      if (d === '[DONE]') break
      try {
        const j = JSON.parse(d)
        const delta = j.choices?.[0]?.delta || {}
        if (delta.reasoning_content) asm.reasoning(delta.reasoning_content)
        if (delta.content) { full += delta.content; asm.content(delta.content) }
      } catch { /* partial json ignore */ }
    }
  }
  asm.final()
  if (!full.trim()) throw new Error('empty')
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
