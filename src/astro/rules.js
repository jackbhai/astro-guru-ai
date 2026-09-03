// ============================================================
//  Astrology Rule Engine (DETERMINISTIC — doc ke principle ke hisaab se:
//  "LLM should not be the calculator")
//  Ye classical rules code mein hain; LLM sirf interpretation karega.
//
//  Relationships (jaise doc ka Knowledge Graph, browser-lite version):
//    Planet → Rashi, Planet → Rashi Lord, Planet → Dignity,
//    Planet → Drishti (Vedic), Planet → Aspect (Western),
//    Nakshatra → Lord, Lagna → Lord
// ============================================================

import { RASHI } from './ephemeris.js'

const RASHI_LORD = ['Mangal', 'Shukra', 'Budh', 'Chandra', 'Surya', 'Budh', 'Shukra', 'Mangal', 'Guru', 'Shani', 'Shani', 'Guru']

// Parashari dignity (rashi index: 0=Mesha ... 11=Meena)
const EXALTED = { Surya: 0, Chandra: 1, Mangal: 9, Budh: 5, Guru: 3, Shukra: 11, Shani: 6 }
const DEBILITATED = { Surya: 6, Chandra: 7, Mangal: 3, Budh: 11, Guru: 9, Shukra: 5, Shani: 0 }
const OWN_SIGNS = { Surya: [4], Chandra: [3], Mangal: [0, 7], Budh: [2, 5], Guru: [8, 11], Shukra: [1, 6], Shani: [9, 10] }

export function dignityOf(graha, rashiIx) {
  if (EXALTED[graha] === rashiIx) return 'Uchcha (exalted) — powerful'
  if (DEBILITATED[graha] === rashiIx) return 'Neecha (debilitated) — kamzor, neecha-bhanga check karna chahiye'
  if (OWN_SIGNS[graha]?.includes(rashiIx)) return 'Swakshetra (own sign) — strong'
  return 'Samaanya sthiti'
}

// Graha Drishti (Vedic): sabhi graha 7th; Mangal 4/8; Guru 5/9; Shani 3/10 (counting inclusive)
const EXTRA_DRISHTI = { Mangal: [4, 8], Guru: [5, 9], Shani: [3, 10], Rahu: [5, 9], Ketu: [5, 9] }
export function vedicDrishti(grahas) {
  const out = {}
  for (const g of grahas) {
    const offsets = [7, ...(EXTRA_DRISHTI[g.graha] || [])]
    out[g.graha] = offsets.map((o) => ((g.house - 1 + o - 1) % 12) + 1).sort((a, b) => a - b)
  }
  return out
}

// Western major aspects (tropical longitudes se)
const WESTERN_ASPECTS = [
  { name: 'Conjunction (yuti)', angle: 0, orb: 8 },
  { name: 'Sextile (support)', angle: 60, orb: 5 },
  { name: 'Square (tension)', angle: 90, orb: 7 },
  { name: 'Trine (harmony)', angle: 120, orb: 8 },
  { name: 'Opposition (polarity)', angle: 180, orb: 8 },
]
const EN_TO_HI = { sun: 'Surya', moon: 'Chandra', mercury: 'Budh', venus: 'Shukra', mars: 'Mangal', jupiter: 'Guru', saturn: 'Shani' }

export function westernAspects(rawTropical) {
  const keys = Object.keys(EN_TO_HI)
  const out = []
  for (let i = 0; i < keys.length; i++) {
    for (let j = i + 1; j < keys.length; j++) {
      let diff = Math.abs(rawTropical[keys[i]] - rawTropical[keys[j]]) % 360
      if (diff > 180) diff = 360 - diff
      for (const a of WESTERN_ASPECTS) {
        if (Math.abs(diff - a.angle) <= a.orb) {
          out.push({
            planets: `${EN_TO_HI[keys[i]]} – ${EN_TO_HI[keys[j]]}`,
            aspect: a.name,
            orb_deg: +Math.abs(diff - a.angle).toFixed(2),
          })
          break
        }
      }
    }
  }
  return out
}

// Poora rule layer — AI payload mein jane ke liye
export function buildRuleLayer(chart) {
  const grahas = chart.vedic.graha_table
  const lagnaIx = chart.vedic.lagna.startsWith('N/A') ? -1 : RASHI.indexOf(chart.vedic.lagna)
  return {
    lagna_lord: lagnaIx >= 0 ? RASHI_LORD[lagnaIx] : 'N/A',
    chandra_rashi_lord: RASHI_LORD[RASHI.indexOf(chart.vedic.chandra_rashi)],
    janma_nakshatra_lord: chart.dasha.dasha_at_birth_lord,
    planet_rules: grahas.map((g) => {
      const ix = RASHI.indexOf(g.vedic_rashi)
      return {
        graha: g.graha,
        rashi: g.vedic_rashi,
        rashi_lord: RASHI_LORD[ix],
        house: g.house,
        dignity: dignityOf(g.graha, ix),
        vakri: g.retrograde,
      }
    }),
    vedic_drishti_houses: vedicDrishti(grahas),
    western_major_aspects: westernAspects(chart.raw_tropical),
    dasha_rule_facts: {
      note: 'Vimshottari: janma nakshatra ke lord se mahadasha shuru hoti hai; 120 saal ka cycle',
      current: chart.dasha.current_mahadasha,
      current_antar: chart.dasha.current_antardasha,
      next: chart.dasha.next_mahadasha,
    },
  }
}

// User ke sawaal ka intent detect karo (prompt ko focus dene ke liye)
export function detectIntent(q) {
  const s = (q || '').toLowerCase()
  const intents = []
  if (/shaadi|marriage|vivah|wedding|spouse|husband|wife/.test(s)) intents.push('marriage')
  if (/love|relationship|partner|pati|patni|pyaar/.test(s)) intents.push('love/relationship')
  if (/career|naukri|job|kaam|business|promotion|startup|study|padhai/.test(s)) intents.push('career/education')
  if (/paisa|money|dhan|wealth|income|finance|loan|debt/.test(s)) intents.push('finance')
  if (/health|sehat|bimari|tabiyat|tandurust/.test(s)) intents.push('health')
  if (/aaj|today|daily|din kaisa/.test(s)) intents.push('daily')
  if (/kab|when|timing|20\d\d|year|saal|month/.test(s)) intents.push('timing')
  if (/bacche|children|santan|pregnancy/.test(s)) intents.push('children')
  if (/videsh|foreign|abroad|travel|settle/.test(s)) intents.push('travel/foreign')
  return intents.length ? intents.join(', ') : 'general life reading'
}
