import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { MODELS, hasWebGPU, loadEngine, SYSTEM_PROMPT, ASTROLOGER_PROMPT } from './ai/webllm.js'
import { PROVIDERS, GROQ_MODELS, streamCloud, streamGemini, streamGroq } from './ai/providers.js'
import { computeChart, computeTransits, computePanchang, CITIES } from './astro/ephemeris.js'
import { buildRuleLayer, detectIntent } from './astro/rules.js'
import { buildKnowledgeContext } from './astro/knowledge.js'
import { buildPanditContext, buildBaziContext } from './astro/knowledge2.js'
import { panditAnalysis } from './astro/pandit.js'
import { fourPillars } from './astro/bazi.js'
import { ashtakoota, moonIndices } from './astro/ashtakoota.js'
import {
  MoonIcon, StarIcon, SparkIcon, CrystalIcon, TelescopeIcon, SendIcon,
  CalendarIcon, PinIcon, WarnIcon, LockIcon, ScrollIcon, OrbitIcon, HourglassIcon,
  LampIcon, HeartIcon, RingsIcon, OmIcon, SlidersIcon, PlusIcon, MenuIcon,
} from './components/icons.jsx'

const SUGGESTIONS = [
  { b: 'Black hole kya hota hai?', s: 'Event horizon se spaghettification tak' },
  { b: 'Aryabhata kaun the aur kya khoja?', s: 'Ancient India ka astronomy genius' },
  { b: 'Chandrayaan-3 ne kya achieve kiya?', s: 'ISRO ka south pole landing' },
  { b: 'Shani ke ring kis cheez ke bane hain?', s: 'Ice, dust aur shepherd moons' },
  { b: 'Mayan log Venus kaise track karte the?', s: 'Dresden Codex ke secrets' },
  { b: 'Big Bang ke proof kya hain?', s: 'CMB se redshift tak' },
]

const QUICK_READINGS = [
  'Aaj ka din kaisa rahega?',
  'Meri personality kya kehti hai?',
  'Career mein kya likha hai?',
  'Love aur relationships ka reading do',
  'Manglik/Kaal Sarp/Sade Sati check karo',
  'Detailed life reading do',
]

const GREETING = {
  role: 'assistant',
  source: 'system',
  content:
    'Namaste. Main **Astro-Guru** hoon — tumhara Hinglish astronomy + jyotish AI.\n\n' +
    'Koi bhi space/astronomy sawaal pucho, ya sidebar se **Kundali** / **Kundali Milan** tab kholo — Vedic, BaZi, pandit checks sab milega.\n\n' +
    'Pehla sawaal bhejo — model pehli baar download hoga (Wi-Fi pe ~1GB), phir offline bhi chalega.',
}

const TAB_META = {
  chat: { title: 'Astronomy Chat', sub: 'World astronomy · AI answers' },
  jyotish: { title: 'Kundali & Prediction', sub: 'Vedic · BaZi · Pandit checks' },
  match: { title: 'Kundali Milan', sub: 'Ashtakoota 36 guna' },
}

function cityOf(name) {
  return CITIES.find((c) => c.name === name) || CITIES[0]
}

export default function App() {
  const [tab, setTab] = useState('chat')
  const [drawer, setDrawer] = useState(false)

  // ---------- shared ----------
  const [provider, setProvider] = useState(() => localStorage.getItem('ag_provider') || 'cloud')
  const [geminiKey, setGeminiKey] = useState(() => localStorage.getItem('ag_gemini_key') || '')
  const [groqKey, setGroqKey] = useState(() => localStorage.getItem('ag_groq_key') || '')
  const [groqModel, setGroqModel] = useState(() => localStorage.getItem('ag_groq_model') || GROQ_MODELS[0].id)
  const [modelId, setModelId] = useState(MODELS[0].id)
  const [engineState, setEngineState] = useState('off')
  const [progress, setProgress] = useState({ text: '', pct: null })
  const engineRef = useRef(null)
  const webgpuOk = useMemo(() => hasWebGPU(), [])
  const panchang = useMemo(() => computePanchang(), [])

  // ---------- chat ----------
  const [messages, setMessages] = useState([GREETING])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const bottomRef = useRef(null)

  // ---------- jyotish ----------
  const [form, setForm] = useState({ name: '', dob: '', tob: '12:00', timeUnknown: false, city: 'Delhi', lat: '', lon: '', tz: '5.5' })
  const [chartData, setChartData] = useState(null)
  const [chartErr, setChartErr] = useState('')
  const [reading, setReading] = useState('')
  const [readingBusy, setReadingBusy] = useState(false)
  const [question, setQuestion] = useState('')

  // ---------- matching ----------
  const [mA, setMA] = useState({ name: 'Ladka', dob: '', tob: '12:00', city: 'Delhi' })
  const [mB, setMB] = useState({ name: 'Ladki', dob: '', tob: '12:00', city: 'Delhi' })
  const [match, setMatch] = useState(null)
  const [matchErr, setMatchErr] = useState('')
  const [matchReading, setMatchReading] = useState('')
  const [matchBusy, setMatchBusy] = useState(false)

  const chatHasUser = messages.some((m) => m.role === 'user')

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, busy])

  const changeProvider = (p) => {
    setProvider(p)
    localStorage.setItem('ag_provider', p)
  }
  const saveGeminiKey = (k) => {
    setGeminiKey(k)
    if (k) localStorage.setItem('ag_gemini_key', k)
    else localStorage.removeItem('ag_gemini_key')
  }
  const saveGroqKey = (k) => {
    setGroqKey(k)
    if (k) localStorage.setItem('ag_groq_key', k)
    else localStorage.removeItem('ag_groq_key')
  }
  const changeGroqModel = (m) => {
    setGroqModel(m)
    localStorage.setItem('ag_groq_model', m)
  }

  const goTab = (t) => { setTab(t); setDrawer(false) }

  const handleLoadModel = useCallback(async () => {
    if (engineState === 'ready') return true
    if (engineState === 'loading') return false
    if (!webgpuOk) { setEngineState('unsupported'); return false }
    setEngineState('loading')
    setProgress({ text: 'Model shuru ho raha hai…', pct: 0 })
    try {
      if (engineRef.current?.unload) {
        try { await engineRef.current.unload() } catch { /* noop */ }
        engineRef.current = null
      }
      const engine = await loadEngine(modelId, (p) => setProgress(p))
      engineRef.current = engine
      setEngineState('ready')
      return true
    } catch (e) {
      console.error(e)
      setEngineState('error')
      setProgress({ text: 'Model load nahi hua. Chrome/Edge ka naya version try karo.', pct: null })
      return false
    }
  }, [engineState, modelId, webgpuOk])

  // streamAI — provider ke hisaab se route: cloud | gemini | local
  const streamAI = useCallback(async (msgs, maxTokens, onDelta) => {
    if (provider === 'local') {
      const stream = await engineRef.current.chat.completions.create({ stream: true, messages: msgs, temperature: 0.7, max_tokens: maxTokens })
      let full = ''
      for await (const chunk of stream) {
        const delta = chunk.choices?.[0]?.delta?.content || ''
        if (delta) { full += delta; onDelta(full) }
      }
      return full
    }
    if (provider === 'gemini') {
      return streamGemini(msgs, geminiKey, onDelta, maxTokens)
    }
    if (provider === 'groq') {
      // R1 reasoning model thinking mein extra tokens khata hai — limit badhao
      const effective = groqModel.includes('r1') ? Math.max(maxTokens, 1800) : maxTokens
      return streamGroq(msgs, groqKey, groqModel, onDelta, effective)
    }
    return streamCloud(msgs, onDelta, maxTokens)
  }, [provider, geminiKey, groqKey, groqModel])

  function enrich(data, civilHH, civilMI, tz) {
    const [yy, mm, dd] = data.meta.dob.split('-').map(Number)
    const birthMs = Date.UTC(yy, mm - 1, dd, civilHH, civilMI) - tz * 3600000
    try { data.pandit = panditAnalysis(data) } catch (e) { console.warn('pandit', e) }
    try { data.bazi = fourPillars(birthMs, civilHH, civilMI) } catch (e) { console.warn('bazi', e) }
    return data
  }

  function chartFromBasic(f) {
    const [y, mo, d] = f.dob.split('-').map(Number)
    if (!y || !mo || !d || y < 1900 || y > 2026) throw new Error('Sahi DOB daalo (1900–2026)')
    const c = cityOf(f.city)
    const [hh, mi] = (f.tob || '12:00').split(':').map(Number)
    const data = computeChart({ y, mo, d, h: hh, mi, tz: c.tz, lat: c.lat || 28.6, lon: c.lon || 77.2, timeKnown: true })
    data.meta = { name: f.name || '—', dob: f.dob, city: f.city }
    return enrich(data, hh, mi, c.tz)
  }

  function newChat() {
    setMessages([GREETING])
    setDrawer(false)
    goTab('chat')
  }

  async function send(text) {
    const q = (text ?? input).trim()
    if (!q || busy) return
    setInput('')
    setBusy(true)
    setMessages((m) => [...m, { id: Date.now(), role: 'user', content: q }])
    try {
      if (provider === 'gemini' && !geminiKey.trim()) {
        setMessages((m) => [...m, { id: Date.now() + 1, role: 'assistant', source: 'system', content: '**Gemini free key chahiye** — sidebar ke Settings mein key daalo (aistudio.google.com se 30 sec mein free milti hai), ya Cloud mode par switch kar lo.' }])
        setBusy(false)
        return
      }
      if (provider === 'groq' && !groqKey.trim()) {
        setMessages((m) => [...m, { id: Date.now() + 1, role: 'assistant', source: 'system', content: '**Groq free key chahiye** — Settings mein key daalo (console.groq.com → API Keys, 30 sec, FREE), ya Cloud mode par switch kar lo.' }])
        setBusy(false)
        return
      }
      if (provider === 'local' && engineState !== 'ready') {
        const loadMsgId = Date.now() + 1
        setMessages((m) => [...m, { id: loadMsgId, role: 'assistant', source: 'system', content: '**AI model load ho raha hai…** Pehli baar download hoga (Wi-Fi pe karo), phir cached rahega.' }])
        const ok = await handleLoadModel()
        setMessages((m) => m.filter((x) => x.id !== loadMsgId))
        if (!ok) {
          setMessages((m) => [...m, { id: Date.now() + 2, role: 'assistant', source: 'system', content: 'AI model is device/browser pe nahi chal paya. Chrome ya Edge ka latest version try karo — phir main khud jawab bana paunga.' }])
          setBusy(false)
          return
        }
      }
      const hist = [...messages.filter((x) => x.role === 'user' || (x.role === 'assistant' && x.source !== 'system')).slice(-6), { role: 'user', content: q }]
      const msgs = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...hist.map((m) => ({ role: m.role, content: m.content.replace(/\*\*/g, '') })),
      ]
      const id = Date.now() + 3
      setMessages((m) => [...m, { id, role: 'assistant', source: 'ai', content: '…' }])
      await streamAI(msgs, 500, (full) => {
        setMessages((m) => m.map((msg) => (msg.id === id ? { ...msg, content: full } : msg)))
      })
    } catch (e) {
      console.error(e)
      setMessages((m) => [...m, { id: Date.now() + 4, role: 'assistant', source: 'system', content: 'Kuch error aa gaya. Dobara try karo.' }])
    } finally {
      setBusy(false)
    }
  }

  function handleCompute() {
    setChartErr('')
    setReading('')
    try {
      const city = cityOf(form.city)
      const isCustom = !city.lat
      const lat = isCustom ? parseFloat(form.lat) : city.lat
      const lon = isCustom ? parseFloat(form.lon) : city.lon
      const tz = isCustom ? parseFloat(form.tz) : city.tz
      if (Number.isNaN(lat) || Number.isNaN(lon) || Number.isNaN(tz)) throw new Error('Custom city ke liye lat/lon/tz sahi daalo')
      const [y, mo, d] = form.dob.split('-').map(Number)
      if (!y || !mo || !d || y < 1900 || y > 2026) throw new Error('Sahi date of birth daalo (1900–2026)')
      const [hh, mm] = (form.timeUnknown ? '12:00' : form.tob).split(':').map(Number)
      const data = computeChart({ y, mo, d, h: hh, mi: mm, tz, lat, lon, timeKnown: !form.timeUnknown })
      data.meta = { name: form.name || 'Aap', dob: form.dob, city: form.city }
      enrich(data, hh, mm, tz)
      setChartData(data)
    } catch (e) {
      setChartErr(e.message || 'Chart compute nahi hua — inputs check karo')
      setChartData(null)
    }
  }

  function handleMatch() {
    setMatchErr('')
    setMatchReading('')
    try {
      const a = chartFromBasic(mA)
      const b = chartFromBasic(mB)
      const koota = ashtakoota(moonIndices(a), moonIndices(b))
      setMatch({ a, b, koota })
    } catch (e) {
      setMatchErr(e.message || 'Match compute nahi hua')
      setMatch(null)
    }
  }

  async function getReading(customQuestion) {
    if (!chartData || readingBusy) return
    if (provider === 'gemini' && !geminiKey.trim()) {
      setReading('Gemini mode chuna hai — sidebar Settings mein free key daalo (ya Cloud mode select karo).')
      return
    }
    if (provider === 'groq' && !groqKey.trim()) {
      setReading('Groq mode chuna hai — sidebar Settings mein free key daalo: console.groq.com → API Keys (ya Cloud mode select karo).')
      return
    }
    if (provider === 'local' && engineState !== 'ready') {
      const ok = await handleLoadModel()
      if (!ok) { setReading('On-device AI load nahi hua — Cloud mode try karo (Settings).'); return }
    }
    setReadingBusy(true)
    setReading('Astro-Guru tumhari kundali padh raha hai…\n')
    try {
      const transits = computeTransits()
      const ruleLayer = buildRuleLayer(chartData)
      const q = (customQuestion ?? question).trim() || 'Meri poori detailed kundali reading do — personality, career, love, aaj ka din, dasha, yogas, remedies — sab kuch.'
      const intent = detectIntent(q)
      const knowledgeCtx = buildKnowledgeContext(chartData, ruleLayer, intent)
      const panditCtx = chartData.pandit ? buildPanditContext(chartData, chartData.pandit, q.toLowerCase()) : ''
      const baziCtx = chartData.bazi ? buildBaziContext(chartData.bazi) : ''
      const payload = {
        user: { naam: chartData.meta.name, dob: chartData.meta.dob, place: chartData.meta.city, birth_time: chartData.time_known ? form.tob : 'approx' },
        intent,
        chart_data: {
          lagna: chartData.vedic.lagna,
          chandra_rashi: chartData.vedic.chandra_rashi,
          janma_nakshatra: chartData.vedic.nakshatra,
          surya_rashi_vedic: chartData.vedic.surya_rashi,
          tithi: chartData.tithi,
          graha_sthiti: chartData.vedic.graha_table.map((g) => `${g.graha}: ${g.vedic_rashi} ${g.degree_in_rashi}° (house ${g.house})${g.retrograde ? ' vakri' : ''}`),
          d9_navamsha: chartData.d9 ? chartData.d9.planets.map((p) => `${p.graha}: ${p.d9_rashi}${p.vargottama ? ' VARGOTTAMA' : ''}`) : [],
        },
        rule_layer: ruleLayer,
        pandit_checks: chartData.pandit ? {
          yogas: chartData.pandit.yogas.map((y) => y.name),
          manglik: chartData.pandit.manglik,
          kaal_sarp: chartData.pandit.kaal_sarp,
          pitra_dosha: chartData.pandit.pitra_dosha,
          gochara: chartData.pandit.gochara,
          lucky: chartData.pandit.lucky,
          weak_grahas: chartData.pandit.weak_grahas,
        } : null,
        bazi_chinese: chartData.bazi ? {
          pillars: chartData.bazi.pillars.map((p) => `${p.name}: ${p.label} [${p.elements}] (stem=${p.ten_god_stem}, branch=${p.ten_god_branch})`),
          day_master: chartData.bazi.day_master,
          strongest: chartData.bazi.strongest,
          weakest: chartData.bazi.weakest,
        } : null,
        world_traditions: {
          western: `Sun ${chartData.western.sun_sign}, Moon ${chartData.western.moon_sign}, Rising ${chartData.western.ascendant}`,
          chinese: `${chartData.chinese.element} ${chartData.chinese.animal} (${chartData.chinese.polarity})`,
          egyptian: chartData.egyptian,
          numerology: `Life Path ${chartData.numerology.life_path}`,
        },
        aaj_ka_panchang: panchang,
        aaj_ke_transits: transits,
        user_ka_sawaal: q,
      }
      const msgs = [
        { role: 'system', content: ASTROLOGER_PROMPT },
        { role: 'user', content: `REFERENCE KNOWLEDGE (grounding — ispe tikaao, APNE words mein bolo):\n${knowledgeCtx}\n${panditCtx}\n${baziCtx}\n\nCHART DATA + RULE LAYER (deterministic engine se):\n${JSON.stringify(payload, null, 1)}\n\nAb structured personalized reading do — Hinglish mein; prediction ke saath aadhaar (kis graha/yoga/gochara se) zaroor batao; kamzori dikhe to saaf-saaf remedy bhi do. Sawaal: ${q}` },
      ]
      await streamAI(msgs, 1100, (full) => setReading(full))
    } catch (e) {
      console.error(e)
      setReading('Reading generate nahi hui — dobara try karo.')
    } finally {
      setReadingBusy(false)
    }
  }

  async function getMatchReading() {
    if (!match || matchBusy) return
    if (provider === 'gemini' && !geminiKey.trim()) {
      setMatchReading('Gemini mode chuna hai — sidebar Settings mein free key daalo (ya Cloud mode select karo).')
      return
    }
    if (provider === 'groq' && !groqKey.trim()) {
      setMatchReading('Groq mode chuna hai — sidebar Settings mein free key daalo: console.groq.com → API Keys (ya Cloud mode select karo).')
      return
    }
    if (provider === 'local' && engineState !== 'ready') {
      const ok = await handleLoadModel()
      if (!ok) { setMatchReading('On-device AI load nahi hua — Cloud mode try karo (Settings).'); return }
    }
    setMatchBusy(true)
    setMatchReading('Astro-Guru milan padh raha hai…\n')
    try {
      const { a, b, koota } = match
      const payload = {
        ladka: { naam: a.meta.name, lagna: a.vedic.lagna, chandra_rashi: a.vedic.chandra_rashi, nakshatra: a.vedic.nakshatra, manglik: a.pandit?.manglik, bazi_day_master: a.bazi?.day_master },
        ladki: { naam: b.meta.name, lagna: b.vedic.lagna, chandra_rashi: b.vedic.chandra_rashi, nakshatra: b.vedic.nakshatra, manglik: b.pandit?.manglik, bazi_day_master: b.bazi?.day_master },
        ashtakoota: { rows: koota.rows.map((r) => `${r.k}: ${r.got}/${r.max} — ${r.detail}`), total: koota.total, doshas: koota.doshas, verdict: koota.verdict },
        note: 'Manglik x Manglik = classical neutralization. 18+ guna acceptable, 28+ uttam.',
      }
      const msgs = [
        { role: 'system', content: ASTROLOGER_PROMPT },
        { role: 'user', content: `KUNDALI MILAN DATA:\n${JSON.stringify(payload, null, 1)}\n\nIs vivah-milan ka Hinglish mein detailed reading do: har important koota ka matlab simple language mein, doshas ke cancellations, manglik status dono ka, aur practical guidance. Pandit ji ka behalf pe jaise bolte hain.` },
      ]
      await streamAI(msgs, 900, (full) => setMatchReading(full))
    } catch (e) {
      console.error(e)
      setMatchReading('Reading nahi bani — dobara try karo.')
    } finally {
      setMatchBusy(false)
    }
  }

  const aiOn = provider === 'local' ? engineState === 'ready' : provider === 'gemini' ? !!geminiKey.trim() : provider === 'groq' ? !!groqKey.trim() : true

  /* =============== SIDEBAR =============== */
  const sidebar = (
    <aside className={`sidebar ${drawer ? 'open' : ''}`}>
      <div className="side-head">
        <span className="side-logo"><MoonIcon size={17} sw={1.7} /></span>
        <div>
          <div className="side-name">Astro-Guru</div>
          <div className="side-sub">Hinglish space + jyotish AI</div>
        </div>
      </div>
      <div className="side-newchat">
        <button className="newchat-btn" onClick={newChat}><PlusIcon size={15} sw={2} /> Naya Chat</button>
      </div>

      <p className="side-section-label">Menu</p>
      <nav className="side-nav">
        <button className={tab === 'chat' ? 'active' : ''} onClick={() => goTab('chat')}>
          <TelescopeIcon size={16} sw={1.7} /> Astronomy Chat
        </button>
        <button className={tab === 'jyotish' ? 'active' : ''} onClick={() => goTab('jyotish')}>
          <CrystalIcon size={16} sw={1.7} /> Kundali &amp; Prediction <small>AI</small>
        </button>
        <button className={tab === 'match' ? 'active' : ''} onClick={() => goTab('match')}>
          <RingsIcon size={16} sw={1.7} /> Kundali Milan <small>36</small>
        </button>
      </nav>

      <div className="side-settings">
        <p className="side-section-label" style={{ padding: '0 4px 6px' }}><SlidersIcon size={11} sw={2} /> AI Settings</p>
        <div className="model-picker">
          <label>AI Mode — phone pe crash nahi hoga</label>
          <select value={provider} onChange={(e) => changeProvider(e.target.value)}>
            {PROVIDERS.map((p) => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>
          <small>{PROVIDERS.find((p) => p.id === provider)?.desc}</small>
        </div>

        {provider === 'gemini' && (
          <div className="model-picker">
            <label>Free key: aistudio.google.com → "Get API Key" (Google login, 30 sec, FREE)</label>
            <div className="key-row">
              <input type="password" value={geminiKey} onChange={(e) => saveGeminiKey(e.target.value.trim())} placeholder="AIza... key yahan paste karo" autoComplete="off" />
            </div>
            <small>{geminiKey ? 'Key saved (sirf tumhare device mein). Clear karne ke liye box khali kar do.' : 'Free tier ~1500 requests/day — personal use ke liye unlimited jaisa.'}</small>
          </div>
        )}

        {provider === 'groq' && (
          <div className="model-picker">
            <label>Free key: console.groq.com → "API Keys" → Create (Google login, 30 sec, FREE)</label>
            <div className="key-row">
              <input type="password" value={groqKey} onChange={(e) => saveGroqKey(e.target.value.trim())} placeholder="gsk_... key yahan paste karo" autoComplete="off" />
            </div>
            <label style={{ marginTop: 4 }}>Groq model choose karo:</label>
            <select value={groqModel} onChange={(e) => changeGroqModel(e.target.value)}>
              {GROQ_MODELS.map((m) => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </select>
            <small>{GROQ_MODELS.find((m) => m.id === groqModel)?.desc} — free tier ~1000 requests/day, speed 300+ tok/s.</small>
          </div>
        )}

        {provider === 'local' && (
          <div className="model-picker">
            <label>On-Device model — sirf desktop/strong devices</label>
            <select id="model" value={modelId} onChange={(e) => setModelId(e.target.value)} disabled={engineState === 'loading' || (provider === 'local' && aiOn)}>
              {MODELS.map((m) => (
                <option key={m.id} value={m.id}>{m.label} · {m.size}</option>
              ))}
            </select>
            <small>{MODELS.find((m) => m.id === modelId)?.desc}</small>
            <button className="load-btn" onClick={handleLoadModel} disabled={engineState === 'loading' || (provider === 'local' && aiOn)}>
              {engineState === 'ready' ? 'On-Device AI Ready' : engineState === 'loading' ? 'Loading…' : 'On-Device AI ON Karo'}
            </button>
          </div>
        )}
        {provider === 'local' && engineState === 'loading' && (
          <div className="progress">
            <div className="bar"><div className="fill" style={{ width: `${Math.round((progress.pct ?? 0.03) * 100)}%` }} /></div>
            <small>{progress.text}</small>
          </div>
        )}
        {provider === 'local' && !webgpuOk && (
          <div className="notice soft">
            <span className="notice-icon"><WarnIcon size={14} sw={2} /></span>
            Is browser mein WebGPU nahi — Cloud ya Gemini mode use karo.
          </div>
        )}
        {engineState === 'error' && <div className="notice"><span className="notice-icon"><WarnIcon size={14} sw={2} /></span>{progress.text}</div>}
        {provider === 'cloud' && (
          <p className="hint"><LockIcon size={11} sw={2} /> Cloud mode: sirf tumhare messages process hote hain — app mein koi account/login nahi.</p>
        )}
      </div>

      <div className="side-foot">
        <p>100% free · saara data tumhare device pe · koi upload nahi</p>
      </div>
    </aside>
  )

  return (
    <div className="shell">
      {sidebar}
      {drawer && <div className="backdrop" onClick={() => setDrawer(false)} />}

      <div className="main">
        <header className="topbar">
          <button className="icon-btn" onClick={() => setDrawer(!drawer)} aria-label="Menu"><MenuIcon size={19} sw={1.7} /></button>
          <div>
            <div className="tb-title">{TAB_META[tab].title}</div>
            <div className="tb-sub">{TAB_META[tab].sub}</div>
          </div>
          <span className={`badge ${aiOn ? 'ai' : engineState === 'loading' ? 'loading' : ''}`}>
            <span className="dot" /> {provider === 'cloud' ? 'AI · CLOUD' : provider === 'gemini' ? (geminiKey ? 'AI · GEMINI' : 'KEY CHAHIYE') : provider === 'groq' ? (groqKey ? 'AI · GROQ' : 'KEY CHAHIYE') : aiOn ? 'AI ON' : engineState === 'loading' ? `AI ${Math.round((progress.pct ?? 0) * 100)}%` : 'AI OFF'}
          </span>
        </header>

        {tab === 'chat' && (
          <div className="chatwrap">
            {chatHasUser || messages.length > 1 ? (
              <main className="chatcol">
                {messages.map((m, i) => (
                  <div key={m.id ?? i} className={`msg ${m.role} ${m.source || ''}`}>
                    {m.role === 'assistant' && <span className="avatar"><MoonIcon size={16} sw={1.6} /></span>}
                    <div className="msg-body">{renderRich(m.content, busy && i === messages.length - 1 && m.source === 'ai')}</div>
                  </div>
                ))}
                {busy && <div className="typing">Astro-Guru soch raha hai</div>}
                <div ref={bottomRef} />
              </main>
            ) : (
              <div className="hero">
                <div className="hero-orb"><MoonIcon size={30} sw={1.4} /></div>
                <h2>Kya jaanna chahoge?</h2>
                <p>Space, astronomy, Aryabhata se NASA tak — sawaal likho ya topic choose karo. Main khud jawab banata hoon.</p>
                <div className="hero-grid">
                  {SUGGESTIONS.map((s) => (
                    <button key={s.b} onClick={() => send(s.b)} disabled={busy}>
                      <b>{s.b}</b>{s.s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="composer">
              <div className="composer-inner">
                {chatHasUser && (
                  <div className="chips">
                    {SUGGESTIONS.map((s) => (
                      <button key={s.b} onClick={() => send(s.b)} disabled={busy}>
                        <StarIcon size={11} sw={1.6} /> {s.b}
                      </button>
                    ))}
                  </div>
                )}
                <form className="inputbar" onSubmit={(e) => { e.preventDefault(); send() }}>
                  <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Space ya astronomy ke baare mein pucho…" autoComplete="off" />
                  <button type="submit" className="send-btn" disabled={busy || !input.trim()} aria-label="Send"><SendIcon size={17} /></button>
                </form>
                <p className="composer-note">Astro-Guru AI galtiyan kar sakta hai — important facts dobara check karo</p>
              </div>
            </div>
          </div>
        )}

        {tab === 'jyotish' && (
          <main className="page">
            <div className="card">
              <h3><OmIcon size={16} sw={1.6} /> Aaj ka Panchang · {panchang.date}</h3>
              <div className="panchang-strip">
                <span className="ppill"><b>{panchang.vara.name}</b><small>{panchang.vara.lord} ka din</small></span>
                <span className="ppill"><b>{panchang.tithi}</b><small>Tithi</small></span>
                <span className="ppill"><b>{panchang.karana}</b><small>Karana</small></span>
                <span className="ppill"><b>{panchang.nitya_yoga}</b><small>Nitya Yoga</small></span>
                <span className="ppill"><b>{panchang.nakshatra_of_day}</b><small>Chandra Nakshatra</small></span>
                <span className="ppill"><b>{panchang.transit_chandra_rashi}</b><small>Chandra Rashi</small></span>
              </div>
            </div>

            <div className="card">
              <h3><LampIcon size={16} sw={1.6} /> Apni Kundali Banao — real planetary math</h3>
              <div className="grid">
                <div className="field">
                  <label>Naam</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Tumhara naam" />
                </div>
                <div className="field">
                  <label><CalendarIcon size={11} sw={2} /> Date of Birth</label>
                  <input type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} min="1900-01-01" max="2026-12-31" />
                </div>
                <div className="field">
                  <label>Birth Time</label>
                  <input type="time" value={form.tob} onChange={(e) => setForm({ ...form, tob: e.target.value })} disabled={form.timeUnknown} />
                </div>
                <div className="field checkbox">
                  <label>
                    <input type="checkbox" checked={form.timeUnknown} onChange={(e) => setForm({ ...form, timeUnknown: e.target.checked })} /> Time nahi pata
                  </label>
                </div>
                <div className="field">
                  <label><PinIcon size={11} sw={2} /> Janm Sthaan</label>
                  <select value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}>
                    {CITIES.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                {form.city.startsWith('Custom') && (
                  <>
                    <div className="field"><label>Latitude</label><input value={form.lat} onChange={(e) => setForm({ ...form, lat: e.target.value })} placeholder="e.g. 26.85" /></div>
                    <div className="field"><label>Longitude</label><input value={form.lon} onChange={(e) => setForm({ ...form, lon: e.target.value })} placeholder="e.g. 80.95" /></div>
                    <div className="field"><label>Timezone (UTC+)</label><input value={form.tz} onChange={(e) => setForm({ ...form, tz: e.target.value })} placeholder="India = 5.5" /></div>
                  </>
                )}
              </div>
              <button className="compute-btn" onClick={handleCompute}>Kundali Compute Karo</button>
              {chartErr && <div className="notice"><span className="notice-icon"><WarnIcon size={15} sw={2} /></span>{chartErr}</div>}
              <small className="hint"><LockIcon size={11} sw={2} /> Saara data tumhare device pe hi rehta hai — kahin upload nahi hota.</small>
            </div>

            {chartData && (
              <div className="card">
                <h3><ScrollIcon size={16} sw={1.6} /> {chartData.meta.name} ki Kundali · {chartData.meta.dob} · {chartData.meta.city}</h3>
                <div className="stat-grid">
                  <div className="stat"><span>Lagna</span><b>{chartData.vedic.lagna}</b></div>
                  <div className="stat"><span>Chandra Rashi</span><b>{chartData.vedic.chandra_rashi}</b></div>
                  <div className="stat"><span>Nakshatra</span><b>{chartData.vedic.nakshatra}</b></div>
                  <div className="stat"><span>Surya Rashi</span><b>{chartData.vedic.surya_rashi}</b></div>
                  <div className="stat"><span>Tithi</span><b>{chartData.tithi}</b></div>
                  <div className="stat"><span>Western Sun</span><b>{chartData.western.sun_sign}</b></div>
                  <div className="stat"><span>Western Moon</span><b>{chartData.western.moon_sign}</b></div>
                  <div className="stat"><span>Chinese</span><b>{chartData.chinese.element} {chartData.chinese.animal}</b></div>
                  <div className="stat"><span>Egyptian</span><b>{chartData.egyptian}</b></div>
                  <div className="stat"><span>Life Path</span><b>{chartData.numerology.life_path}</b></div>
                </div>

                <h4><OrbitIcon size={14} sw={1.6} /> Graha Sthiti · Lahiri {chartData.ayanamsa_lahiri}°</h4>
                <div className="table-wrap">
                  <table className="graha-table">
                    <thead><tr><th>Graha</th><th>Rashi</th><th>°</th><th>House</th><th>West</th></tr></thead>
                    <tbody>
                      {chartData.vedic.graha_table.map((g) => (
                        <tr key={g.graha}>
                          <td>{g.graha}{g.retrograde ? ' (v)' : ''}</td><td>{g.vedic_rashi}</td><td>{g.degree_in_rashi}</td><td>{g.house}</td><td>{g.western_sign}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <h4><HourglassIcon size={14} sw={1.6} /> Vimshottari Dasha</h4>
                <div className="dasha-now">
                  Abhi: <b>{chartData.dasha.current_mahadasha?.lord} Mahadasha</b> ({chartData.dasha.current_mahadasha?.from} → {chartData.dasha.current_mahadasha?.till})
                  {chartData.dasha.current_antardasha && <> · <b>{chartData.dasha.current_antardasha.lord} Antardasha</b> (till {chartData.dasha.current_antardasha.till})</>}
                  {chartData.dasha.next_mahadasha && <> · Next: <b>{chartData.dasha.next_mahadasha.lord}</b> ({chartData.dasha.next_mahadasha.from} se)</>}
                </div>
                <div className="dasha-line">
                  {chartData.dasha.periods.slice(0, 8).map((p, i) => (
                    <span key={i} className={chartData.dasha.current_mahadasha?.from === p.from ? 'now' : ''}>
                      {p.lord} <small>{p.from.slice(0, 4)}→{p.till.slice(0, 4)}</small>
                    </span>
                  ))}
                </div>
                {!chartData.time_known && <small className="hint">Birth time unknown tha — lagna skip, dasha approximate.</small>}
              </div>
            )}

            {chartData?.pandit && (
              <div className="card">
                <h3><OmIcon size={16} sw={1.6} /> Pandit Checks — dosha / yoga / gochara</h3>
                <div className="checks-grid">
                  {chartData.pandit.manglik?.manglik
                    ? <span className={`badge-check ${chartData.pandit.manglik.level === 'low' ? 'warn' : 'bad'}`}>Manglik: {chartData.pandit.manglik.level} · Mangal {chartData.pandit.manglik.house}th</span>
                    : <span className="badge-check ok">Manglik Nahi</span>}
                  {chartData.pandit.kaal_sarp?.present
                    ? <span className="badge-check bad">Kaal Sarp: {chartData.pandit.kaal_sarp.type}</span>
                    : <span className="badge-check ok">Kaal Sarp Nahi</span>}
                  {chartData.pandit.pitra_dosha?.present
                    ? <span className="badge-check warn">Pitra Dosha: haan</span>
                    : <span className="badge-check ok">Pitra Dosha Nahi</span>}
                  {chartData.pandit.gochara?.sade_sati
                    ? <span className="badge-check bad">Sade Sati: {chartData.pandit.gochara.sade_sati.phase}</span>
                    : <span className="badge-check ok">Sade Sati Nahi</span>}
                  {chartData.pandit.gochara?.dhaiya && <span className="badge-check warn">Dhaiya chal raha</span>}
                </div>
                {(chartData.pandit.pitra_dosha?.present || chartData.pandit.gochara?.sade_sati || chartData.pandit.gochara?.dhaiya || chartData.pandit.manglik?.manglik) && (
                  <div className="notice soft">
                    <span className="notice-icon"><WarnIcon size={14} sw={2} /></span>
                    {[
                      chartData.pandit.manglik?.manglik ? `Manglik (${chartData.pandit.manglik.level}): ${(chartData.pandit.manglik.cancels || []).join('; ') || 'remedies consider karo'}` : '',
                      chartData.pandit.pitra_dosha?.present ? `Pitra triggers: ${chartData.pandit.pitra_dosha.triggers.join('; ')}` : '',
                      chartData.pandit.gochara?.sade_sati?.text || '',
                      chartData.pandit.gochara?.dhaiya?.text || '',
                    ].filter(Boolean).join(' · ')}
                  </div>
                )}
                {chartData.pandit.lucky && (
                  <p className="lucky-strip">
                    <b>Lucky:</b> {chartData.pandit.lucky.day} · {chartData.pandit.lucky.color} · ank {chartData.pandit.lucky.number}
                    {' · '}<b>Guru gochar:</b> {chartData.pandit.gochara.guru_gochar.rashi} ({chartData.pandit.gochara.guru_gochar.benefic ? 'shubh' : 'mixed'})
                    {' · '}<b>Shani:</b> {chartData.pandit.gochara.shani_gochar.rashi}
                  </p>
                )}
                {chartData.pandit.yogas.length > 0 && (
                  <>
                    <h4><SparkIcon size={14} sw={1.6} /> Yogas detected</h4>
                    <div className="yogas-list">
                      {chartData.pandit.yogas.map((y) => (
                        <div key={y.name} className="yoga-item">
                          <div className="yoga-head"><b>{y.name}</b><span className={`chip-strength ${y.strength}`}>{y.strength}</span></div>
                          <p>{y.text}</p>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {chartData?.d9 && (
              <div className="card">
                <h3><StarIcon size={16} sw={1.6} /> D9 Navamsha — bhagya/partnership ka chart</h3>
                <p className="lucky-strip">D9 lagna: <b>{chartData.d9.lagna}</b> · Vargottama grah extra strong hote hain</p>
                <div className="table-wrap">
                  <table className="graha-table">
                    <thead><tr><th>Graha</th><th>D9 Rashi</th><th>Vargottama</th></tr></thead>
                    <tbody>
                      {chartData.d9.planets.map((p) => (
                        <tr key={p.graha}><td>{p.graha}</td><td>{p.d9_rashi}</td><td>{p.vargottama ? '★ Haan' : '—'}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {chartData?.bazi && (
              <div className="card">
                <h3><LampIcon size={16} sw={1.6} /> BaZi — Chinese Four Pillars</h3>
                <div className="pillars-grid">
                  {chartData.bazi.pillars.map((p) => (
                    <div key={p.name} className="pillar">
                      <span className="p-name">{p.name}</span>
                      <span className="p-hanzi">{p.stemInfo.hanzi}{p.branchInfo.hanzi}</span>
                      <span className="p-label">{p.label.split(' (')[0]}</span>
                      <small>{p.elements}</small>
                      <small>{p.branchInfo.animal}</small>
                      <small className="p-god">{p.ten_god_stem}</small>
                    </div>
                  ))}
                </div>
                <p className="lucky-strip">
                  Day Master: <b>{chartData.bazi.day_master}</b> · strongest: <b>{chartData.bazi.strongest}</b> · weakest: <b>{chartData.bazi.weakest}</b>
                </p>
                <p className="hint">{chartData.bazi.approx_note}</p>
              </div>
            )}

            {chartData && (
              <div className="card">
                <h3><SparkIcon size={16} sw={1.6} /> AI Reading — saari traditions + pandit checks combine</h3>
                <div className="chips">
                  {QUICK_READINGS.map((qr) => (
                    <button key={qr} onClick={() => { setQuestion(qr); getReading(qr) }} disabled={readingBusy}>
                      <StarIcon size={11} sw={1.6} /> {qr}
                    </button>
                  ))}
                </div>
                <div className="field question-field">
                  <label>Ya apna sawaal likho:</label>
                  <div className="inputbar">
                    <input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="e.g. 2026 mein career change ka yog hai?" autoComplete="off" />
                    <button onClick={() => getReading()} className="send-btn" disabled={readingBusy || !question.trim()} aria-label="Ask"><CrystalIcon size={16} /></button>
                  </div>
                </div>
                {reading && <div className="reading-box">{renderRich(reading, readingBusy)}</div>}
                {!reading && <small className="hint">Reading ke liye AI mode on hoga — pehli baar model download, phir offline.</small>}
              </div>
            )}
          </main>
        )}

        {tab === 'match' && (
          <main className="page">
            <div className="card">
              <h3><RingsIcon size={16} sw={1.6} /> Kundali Milan — Ashtakoota 36 Guna (pandit style)</h3>
              <div className="match-grid">
                <MatchForm title="Ladka / Person A" value={mA} onChange={setMA} />
                <MatchForm title="Ladki / Person B" value={mB} onChange={setMB} />
              </div>
              <button className="compute-btn" onClick={handleMatch}><HeartIcon size={14} sw={1.6} /> Milan Compute Karo</button>
              {matchErr && <div className="notice"><span className="notice-icon"><WarnIcon size={14} sw={2} /></span>{matchErr}</div>}
              <small className="hint">Varna · Vashya · Tara · Yoni · Maitri · Gana · Bhakoot · Nadi — classical tables</small>
            </div>

            {match && (
              <div className="card">
                <h3><HeartIcon size={16} sw={1.6} /> {match.a.meta.name} × {match.b.meta.name} — Milan Report</h3>
                <div className="score-hero">
                  <span className={`score-pill ${match.koota.vClass}`}><b>{match.koota.total}</b>/36</span>
                  <p>{match.koota.verdict}</p>
                </div>
                {match.koota.doshas.length > 0 && (
                  <div className="checks-grid" style={{ marginBottom: 12 }}>
                    {match.koota.doshas.map((d) => <span key={d} className="badge-check bad">Dosha: {d}</span>)}
                    {match.a.pandit?.manglik?.manglik && <span className="badge-check warn">A Manglik ({match.a.pandit.manglik.level})</span>}
                    {match.b.pandit?.manglik?.manglik && <span className="badge-check warn">B Manglik ({match.b.pandit.manglik.level})</span>}
                    {match.a.pandit?.manglik?.manglik && match.b.pandit?.manglik?.manglik && <span className="badge-check ok">Manglik × Manglik = neutralized</span>}
                  </div>
                )}
                <div className="table-wrap">
                  <table className="koota-table">
                    <thead><tr><th>Koota</th><th>Score</th><th></th><th>Detail</th></tr></thead>
                    <tbody>
                      {match.koota.rows.map((r) => (
                        <tr key={r.k} className={r.dosha ? 'dosha-row' : ''}>
                          <td><b>{r.k}</b><small className="sub">{r.dosha ? ' · dosha!' : ''}</small></td>
                          <td>{r.got}/{r.max}</td>
                          <td><div className="kbar"><div className={`kfill ${r.got === 0 && r.max >= 6 ? 'zero' : ''}`} style={{ width: `${(r.got / r.max) * 100}%` }} /></div></td>
                          <td className="detail">{r.detail}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="match-mini">
                  <span>A: {match.a.vedic.lagna} lagna · {match.a.vedic.chandra_rashi} · {match.a.vedic.nakshatra}</span>
                  <span>B: {match.b.vedic.lagna} lagna · {match.b.vedic.chandra_rashi} · {match.b.vedic.nakshatra}</span>
                </div>
                <button className="load-btn" style={{ width: 'auto', padding: '10px 20px' }} onClick={getMatchReading} disabled={matchBusy}>
                  {matchBusy ? 'Padh raha hai…' : 'AI Milan Reading (pandit tone)'}
                </button>
                {matchReading && <div className="reading-box">{renderRich(matchReading, matchBusy)}</div>}
              </div>
            )}
          </main>
        )}
      </div>

      <nav className="bottomnav">
        <button className={tab === 'chat' ? 'active' : ''} onClick={() => goTab('chat')}>
          <span className="bn-ind" /><TelescopeIcon size={19} sw={1.7} /> Chat
        </button>
        <button className={tab === 'jyotish' ? 'active' : ''} onClick={() => goTab('jyotish')}>
          <span className="bn-ind" /><CrystalIcon size={19} sw={1.7} /> Kundali
        </button>
        <button className={tab === 'match' ? 'active' : ''} onClick={() => goTab('match')}>
          <span className="bn-ind" /><RingsIcon size={19} sw={1.7} /> Milan
        </button>
        <button onClick={() => setDrawer(true)}>
          <span className="bn-ind" /><SlidersIcon size={19} sw={1.7} /> Settings
        </button>
      </nav>
    </div>
  )
}

function MatchForm({ title, value, onChange }) {
  return (
    <div className="match-side">
      <h4>{title}</h4>
      <div className="field"><label>Naam</label><input value={value.name} onChange={(e) => onChange({ ...value, name: e.target.value })} placeholder="Naam" /></div>
      <div className="field"><label>DOB</label><input type="date" value={value.dob} onChange={(e) => onChange({ ...value, dob: e.target.value })} min="1900-01-01" max="2026-12-31" /></div>
      <div className="field"><label>Time</label><input type="time" value={value.tob} onChange={(e) => onChange({ ...value, tob: e.target.value })} /></div>
      <div className="field"><label>City</label>
        <select value={value.city} onChange={(e) => onChange({ ...value, city: e.target.value })}>
          {CITIES.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
        </select>
      </div>
    </div>
  )
}

// <think>...</think> reasoning ko alag block mein todta hai (DeepSeek R1 style)
function splitThink(text) {
  const openIx = text.indexOf('<think>')
  if (openIx === -1) return { think: '', answer: text, thinkingLive: false }
  const closeIx = text.indexOf('</think>')
  if (closeIx === -1) return { think: text.slice(openIx + 7), answer: text.slice(0, openIx), thinkingLive: true }
  return { think: text.slice(openIx + 7, closeIx), answer: text.slice(0, openIx) + text.slice(closeIx + 8), thinkingLive: false }
}

// thinking block + streaming caret + answer render
function renderRich(text, streaming = false) {
  if (!text) return null
  const { think, answer, thinkingLive } = splitThink(text)
  return (
    <>
      {think.trim() && (
        <details className={`thinkblock ${thinkingLive ? 'live' : ''}`} open={thinkingLive}>
          <summary>{thinkingLive ? 'Astro-Guru soch raha hai… (reasoning)' : 'Soch dekhni hai? (reasoning)'}</summary>
          <div className="thinkbody">{renderContent(think.trim())}</div>
        </details>
      )}
      {renderContent(answer || (streaming ? '' : text))}
      {streaming && <span className="caret" />}
    </>
  )
}

function renderContent(text) {
  return (text || '').split('\n').map((line, i) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
      part.startsWith('**') && part.endsWith('**') ? <strong key={j}>{part.slice(2, -2)}</strong> : <span key={j}>{part}</span>,
    )
    return <p key={i} className={line.trim() === '' ? 'spacer' : ''}>{parts}</p>
  })
}
