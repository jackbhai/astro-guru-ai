// ============================================================
//  Astro-Guru World Ephemeris
//  REAL calculations (kyunki library input ko Local Mean Time
//  maanti hai, hum civil time -> LMT convert karte hain):
//  - Western (tropical) chart: sun..saturn + houses
//  - Vedic (sidereal, Lahiri ayanamsa): rashi, nakshatra, tithi
//  - Vimshottari Dasha (mahadasha + antardasha, dates ke saath)
//  - Chinese zodiac (animal + element + yin/yang)
//  - Egyptian zodiac
//  - Numerology life path
//  - Aaj ke transits
//  Saara data device pe hi compute hota hai — privacy 100%!
// ============================================================

import pkg from 'circular-natal-horoscope-js/dist/index.js'
const { Origin, Horoscope } = pkg

export const CITIES = [
  { name: 'Delhi', lat: 28.61, lon: 77.21, tz: 5.5 },
  { name: 'Mumbai', lat: 19.08, lon: 72.88, tz: 5.5 },
  { name: 'Kolkata', lat: 22.57, lon: 88.36, tz: 5.5 },
  { name: 'Chennai', lat: 13.08, lon: 80.27, tz: 5.5 },
  { name: 'Bengaluru', lat: 12.97, lon: 77.59, tz: 5.5 },
  { name: 'Hyderabad', lat: 17.38, lon: 78.49, tz: 5.5 },
  { name: 'Lucknow', lat: 26.85, lon: 80.95, tz: 5.5 },
  { name: 'Jaipur', lat: 26.91, lon: 75.78, tz: 5.5 },
  { name: 'Patna', lat: 25.61, lon: 85.14, tz: 5.5 },
  { name: 'Ahmedabad', lat: 23.02, lon: 72.57, tz: 5.5 },
  { name: 'Dubai', lat: 25.20, lon: 55.27, tz: 4 },
  { name: 'London', lat: 51.51, lon: -0.13, tz: 0 },
  { name: 'New York', lat: 40.71, lon: -74.01, tz: -5 },
  { name: 'Moscow', lat: 55.76, lon: 37.62, tz: 3 },
  { name: 'Beijing', lat: 39.90, lon: 116.40, tz: 8 },
  { name: 'Tokyo', lat: 35.68, lon: 139.69, tz: 9 },
  { name: 'Cairo', lat: 30.04, lon: 31.24, tz: 2 },
  { name: 'Custom (lat/lon daalo)', lat: null, lon: null, tz: 5.5 },
]

export const RASHI = ['Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya', 'Tula', 'Vrishchika', 'Dhanu', 'Makara', 'Kumbha', 'Meena']
export const NAKSHATRA = ['Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati']
export const TITHI_NAMES = [
  'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami', 'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami', 'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima',
  'Pratipada (Krishna)', 'Dwitiya (Krishna)', 'Tritiya (Krishna)', 'Chaturthi (Krishna)', 'Panchami (Krishna)', 'Shashthi (Krishna)', 'Saptami (Krishna)', 'Ashtami (Krishna)', 'Navami (Krishna)', 'Dashami (Krishna)', 'Ekadashi (Krishna)', 'Dwadashi (Krishna)', 'Trayodashi (Krishna)', 'Chaturdashi (Krishna)', 'Amavasya',
]
const GRAHA_HINDI = { sun: 'Surya', moon: 'Chandra', mars: 'Mangal', mercury: 'Budh', jupiter: 'Guru', venus: 'Shukra', saturn: 'Shani' }
const DASHA_SEQ = [
  { lord: 'Ketu', years: 7 }, { lord: 'Shukra', years: 20 }, { lord: 'Surya', years: 6 },
  { lord: 'Chandra', years: 10 }, { lord: 'Mangal', years: 7 }, { lord: 'Rahu', years: 18 },
  { lord: 'Guru', years: 16 }, { lord: 'Shani', years: 19 }, { lord: 'Budh', years: 17 },
]
const SUB_YEARS = [7, 20, 6, 10, 7, 18, 16, 19, 17] // same order
const YEAR_MS = 365.25 * 24 * 3600 * 1000

export function lahiri(year) {
  return 23.853 + (year - 2000) * (50.290966 / 3600)
}

// NOTE: library input time = Local Mean Time => LMT = civil - tz + lon/15
export function makeChart({ y, mo, d, h, mi, tz, lat, lon }) {
  const lmtHours = h + mi / 60 - tz + lon / 15
  const base = Date.UTC(y, mo - 1, d) + lmtHours * 3600000
  const dt = new Date(base)
  return {
    horoscope: new Horoscope({
      origin: new Origin({
        year: dt.getUTCFullYear(), month: dt.getUTCMonth(), date: dt.getUTCDate(),
        hour: dt.getUTCHours(), minute: dt.getUTCMinutes(), latitude: lat, longitude: lon,
      }),
      houseSystem: 'whole-sign', zodiacSystem: 'tropical',
      aspectPoints: ['bodies'], aspectWithPoints: ['bodies'], aspectTypes: ['major'],
      customOrbs: {}, zodiacLanguage: 'en', aspectLanguage: 'en',
    }),
    birthUTCms: Date.UTC(y, mo - 1, d, h, mi) - tz * 3600000,
  }
}

function sid(tropical, ayanDeg) {
  return (tropical - ayanDeg + 360) % 360
}

function fmtDate(ms) {
  const d = new Date(ms)
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`
}

// ---------- Rahu/Ketu (mean lunar node — Schlyter) ----------
export function meanNodeLon(utcMs) {
  const d = (utcMs - Date.UTC(1999, 11, 31)) / 86400000
  return (125.1228 - 0.0529538083 * d) % 360
}

// ---------- Navamsha (D9) ----------
export const NAVAMSHA_STARTS = { 0: 0, 1: 9, 2: 6, 3: 3, 4: 0, 5: 9, 6: 6, 7: 3, 8: 0, 9: 9, 10: 6, 11: 3 }
export function navamshaSign(sidLon) {
  const signIx = Math.floor(sidLon / 30)
  const pada = Math.floor((sidLon % 30) / (30 / 9))
  return (NAVAMSHA_STARTS[signIx] + pada) % 12
}

// ---------- Vimshottari Dasha (pure math, verified system) ----------
export function vimshottari(moonSidDeg, birthUTCms, nowMs = Date.now()) {
  const NAK_SPAN = 360 / 27
  const nakIndex = Math.floor(moonSidDeg / NAK_SPAN)
  const frac = (moonSidDeg - nakIndex * NAK_SPAN) / NAK_SPAN
  const startLordIx = nakIndex % 9

  // Mahadasha timeline
  const periods = []
  let t = birthUTCms
  let lordIx = startLordIx
  let remaining = DASHA_SEQ[lordIx].years * (1 - frac)
  for (let i = 0; i < 14; i++) {
    const durMs = remaining * YEAR_MS
    periods.push({ lord: DASHA_SEQ[lordIx].lord, fullYears: DASHA_SEQ[lordIx].years, lordIx, start: t, end: t + durMs })
    t += durMs
    lordIx = (lordIx + 1) % 9
    remaining = DASHA_SEQ[lordIx].years
    if (t > nowMs + 40 * YEAR_MS && periods.length > 4) break
  }

  const currentMahaIx = periods.findIndex((p) => nowMs >= p.start && nowMs < p.end)
  const maha = currentMahaIx >= 0 ? periods[currentMahaIx] : null

  // Antardasha inside current mahadasha (full sequence, tail-truncated first)
  let antar = null
  let antarNext = null
  if (maha) {
    const fullStart = maha.end - maha.fullYears * YEAR_MS
    let st = fullStart
    for (let i = 0; i < 9; i++) {
      const subIx = (maha.lordIx + i) % 9
      const lenMs = (maha.fullYears * SUB_YEARS[subIx]) / 120 * YEAR_MS
      if (nowMs >= st && nowMs < st + lenMs) {
        antar = { lord: DASHA_SEQ[subIx].lord, start: st, end: st + lenMs }
        antarNext = { lord: DASHA_SEQ[(subIx + 1) % 9].lord }
        break
      }
      st += lenMs
    }
  }

  return {
    janma_nakshatra: NAKSHATRA[nakIndex],
    janma_nakshatra_pada: Math.floor(frac * 4) + 1,
    dasha_at_birth_lord: DASHA_SEQ[startLordIx].lord,
    balance_years_at_birth: +(DASHA_SEQ[startLordIx].years * (1 - frac)).toFixed(2),
    periods: periods.map((p) => ({ lord: p.lord, from: fmtDate(p.start), till: fmtDate(p.end) })),
    current_mahadasha: maha ? { lord: maha.lord, from: fmtDate(maha.start), till: fmtDate(maha.end) } : null,
    current_antardasha: antar ? { lord: antar.lord, from: fmtDate(antar.start), till: fmtDate(antar.end) } : null,
    next_mahadasha: currentMahaIx >= 0 && periods[currentMahaIx + 1] ? { lord: periods[currentMahaIx + 1].lord, from: fmtDate(periods[currentMahaIx + 1].start) } : null,
  }
}

// ---------- Chinese Zodiac ----------
const CZ_ANIMALS = ['Rat (Chuha)', 'Ox (Bail)', 'Tiger (Sher)', 'Rabbit (Khargosh)', 'Dragon', 'Snake (Saamp)', 'Horse (Ghoda)', 'Goat (Bakra)', 'Monkey (Bandar)', 'Rooster (Murga)', 'Dog (Kutta)', 'Pig (Suar)']
const CZ_ELEMENTS = ['Wood (Lakdi)', 'Fire (Aag)', 'Earth (Mitti)', 'Metal (Dhaatu)', 'Water (Paani)']
export function chineseZodiac(y, mo, d) {
  // Solar year ~ Feb 4 (Li Chun) se shuru → usse pehle = pichhla year
  const year = mo < 2 || (mo === 2 && d < 4) ? y - 1 : y
  const animal = CZ_ANIMALS[(year - 4 + 1200) % 12]
  const stem = (year - 4 + 600) % 10
  const element = CZ_ELEMENTS[Math.floor(stem / 2)]
  const yinyang = stem % 2 === 0 ? 'Yang' : 'Yin'
  return { year_used: year, animal, element, polarity: yinyang }
}

// ---------- Egyptian Zodiac ----------
const EGYPT = [
  { name: 'The Nile (Neel Nadi)', ranges: [[1, 1, 1, 7], [6, 19, 6, 28], [9, 1, 9, 7], [11, 18, 11, 26]] },
  { name: 'Amon-Ra (Surya Dev)', ranges: [[1, 8, 1, 21], [2, 1, 2, 11]] },
  { name: 'Mut (Mata)', ranges: [[1, 22, 1, 31], [9, 8, 9, 22]] },
  { name: 'Geb (Prithvi Dev)', ranges: [[2, 12, 2, 29], [8, 20, 8, 31]] },
  { name: 'Osiris', ranges: [[3, 1, 3, 10], [11, 27, 12, 18]] },
  { name: 'Isis', ranges: [[3, 11, 3, 31], [10, 18, 10, 29], [12, 19, 12, 31]] },
  { name: 'Thoth (Gyaan Dev)', ranges: [[4, 1, 4, 19], [11, 8, 11, 17]] },
  { name: 'Horus (Aasman Raja)', ranges: [[4, 20, 5, 7], [8, 12, 8, 19]] },
  { name: 'Anubis', ranges: [[5, 8, 5, 27], [6, 29, 7, 13]] },
  { name: 'Seth', ranges: [[5, 28, 6, 18], [9, 28, 10, 2]] },
  { name: 'Bastet', ranges: [[7, 14, 7, 28], [9, 23, 9, 27], [10, 3, 10, 17]] },
  { name: 'Sekhmet (Yoddha Devi)', ranges: [[7, 29, 8, 11], [10, 30, 11, 7]] },
]
export function egyptianSign(mo, d) {
  for (const s of EGYPT) {
    for (const [m1, d1, m2, d2] of s.ranges) {
      if ((mo === m1 && d >= d1) || (mo === m2 && d <= d2)) return s.name
    }
  }
  return 'Unknown'
}

// ---------- Numerology ----------
export function lifePath(y, mo, d) {
  const sum = `${y}${String(mo).padStart(2, '0')}${String(d).padStart(2, '0')}`.split('').reduce((a, c) => a + +c, 0)
  let n = sum
  while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
    n = String(n).split('').reduce((a, c) => a + +c, 0)
  }
  return n
}

// ---------- Poora Kundali compute ----------
export function computeChart({ y, mo, d, h, mi, tz, lat, lon, timeKnown = true }) {
  const { horoscope, birthUTCms } = makeChart({ y, mo, d, h, mi, tz, lat, lon })
  const ay = lahiri(y)
  const bodies = horoscope.CelestialBodies

  const ascTrop = horoscope.Ascendant.ChartPosition.Ecliptic.DecimalDegrees
  const ascTropSign = horoscope.Ascendant.Sign.label
  const ascSidIx = Math.floor(sid(ascTrop, ay) / 30)

  const sunTrop = bodies.sun.ChartPosition.Ecliptic.DecimalDegrees
  const moonTrop = bodies.moon.ChartPosition.Ecliptic.DecimalDegrees
  const moonSid = sid(moonTrop, ay)
  const elong = (moonTrop - sunTrop + 360) % 360
  const tithiIx = Math.floor(elong / 12)

  const grahas = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'].map((k) => {
    const b = bodies[k]
    const tr = b.ChartPosition.Ecliptic.DecimalDegrees
    const s = sid(tr, ay)
    const rashiIx = Math.floor(s / 30)
    return {
      graha: GRAHA_HINDI[k],
      vedic_rashi: RASHI[rashiIx],
      degree_in_rashi: +(s % 30).toFixed(2),
      western_sign: b.Sign.label,
      house: ((rashiIx - ascSidIx + 12) % 12) + 1,
      retrograde: !!b.isRetrograde,
    }
  })

  const rahuSid = sid(meanNodeLon(birthUTCms), ay)
  const ketuSid = (rahuSid + 180) % 360
  for (const [gname, glon] of [['Rahu', rahuSid], ['Ketu', ketuSid]]) {
    const rI = Math.floor(glon / 30)
    grahas.push({
      graha: gname, vedic_rashi: RASHI[rI], degree_in_rashi: +(glon % 30).toFixed(2),
      western_sign: '-', house: ((rI - ascSidIx + 12) % 12) + 1, retrograde: true,
    })
  }

  const dasha = vimshottari(moonSid, birthUTCms)

  const raw_tropical = {}
  for (const k of ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn']) {
    raw_tropical[k] = bodies[k].ChartPosition.Ecliptic.DecimalDegrees
  }
  const raw_sidereal = {}
  for (const k of ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn']) {
    raw_sidereal[k] = sid(raw_tropical[k], ay)
  }
  raw_sidereal.rahu = rahuSid
  raw_sidereal.ketu = ketuSid

  // D9 Navamsha
  const d9 = {
    lagna: timeKnown ? RASHI[navamshaSign(sid(ascTrop, ay))] : 'N/A (time nahi pata)',
    planets: ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'].map((k) => {
      const sl = raw_sidereal[k]
      const d1 = Math.floor(sl / 30)
      const d9s = navamshaSign(sl)
      return { graha: GRAHA_HINDI[k], d1_rashi: RASHI[d1], d9_rashi: RASHI[d9s], vargottama: d1 === d9s }
    }),
  }

  return {
    ayanamsa_lahiri: +ay.toFixed(3),
    time_known: timeKnown,
    tithi: TITHI_NAMES[tithiIx],
    raw_tropical,
    raw_sidereal,
    d9,
    vedic: {
      lagna: timeKnown ? RASHI[ascSidIx] : 'N/A (birth time nahi pata)',
      chandra_rashi: RASHI[Math.floor(moonSid / 30)],
      nakshatra: `${NAKSHATRA[Math.floor(moonSid / (360 / 27))]} (pada ${Math.floor(((moonSid % (360 / 27)) / (360 / 27)) * 4) + 1})`,
      surya_rashi: RASHI[Math.floor(sid(sunTrop, ay) / 30)],
      graha_table: grahas,
    },
    western: {
      sun_sign: bodies.sun.Sign.label,
      moon_sign: bodies.moon.Sign.label,
      ascendant: timeKnown ? ascTropSign : 'N/A',
    },
    chinese: chineseZodiac(y, mo, d),
    egyptian: egyptianSign(mo, d),
    numerology: { life_path: lifePath(y, mo, d) },
    dasha,
  }
}

const VARAS = [
  { name: 'Ravivar (Sunday)', lord: 'Surya' }, { name: 'Somvar (Monday)', lord: 'Chandra' },
  { name: 'Mangalvar (Tuesday)', lord: 'Mangal' }, { name: 'Budhvar (Wednesday)', lord: 'Budh' },
  { name: 'Guruvar (Thursday)', lord: 'Guru' }, { name: 'Shukravar (Friday)', lord: 'Shukra' },
  { name: 'Shanivar (Saturday)', lord: 'Shani' },
]
const KARANA_MOVING = ['Bava', 'Balava', 'Kaulava', 'Taitila', 'Garaja', 'Vanija', 'Vishti']
const NITYA_YOGA = ['Vishkambha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda', 'Sukarma', 'Dhriti', 'Shoola', 'Ganda', 'Vriddhi', 'Dhruva', 'Vyaghata', 'Harshana', 'Vajra', 'Siddhi', 'Vyatipata', 'Variyan', 'Parigha', 'Shiva', 'Siddha', 'Sadhya', 'Shubha', 'Shukla', 'Brahma', 'Indra', 'Vaidhriti']

// ---------- Aaj ke transits (gochara/sade-sati ke liye full data) ----------
export function computeTransits(now = new Date()) {
  const y = now.getUTCFullYear(), mo = now.getUTCMonth() + 1, d = now.getUTCDate()
  const { horoscope } = makeChart({ y, mo, d, h: now.getUTCHours(), mi: now.getUTCMinutes(), tz: 0, lat: 0, lon: 0 })
  const ay = lahiri(y)
  const bodies = horoscope.CelestialBodies
  const sunT = bodies.sun.ChartPosition.Ecliptic.DecimalDegrees
  const moonT = bodies.moon.ChartPosition.Ecliptic.DecimalDegrees
  const raw = { rahu: (360 + meanNodeLon(now.getTime())) % 360 }
  for (const k of ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn']) {
    raw[k] = sid(bodies[k].ChartPosition.Ecliptic.DecimalDegrees, ay)
  }
  raw.rahu = sid(raw.rahu, ay)
  raw.ketu = (raw.rahu + 180) % 360
  const rashiOf = (lon) => RASHI[Math.floor(lon / 30)]
  const elong = (moonT - sunT + 360) % 360
  return {
    date: fmtDate(now.getTime()),
    raw,
    transit_surya_rashi: rashiOf(raw.sun),
    transit_chandra_rashi: rashiOf(raw.moon),
    transit_chandra_nakshatra: NAKSHATRA[Math.floor(raw.moon / (360 / 27))],
    transit_shani_rashi: rashiOf(raw.saturn),
    transit_guru_rashi: rashiOf(raw.jupiter),
    transit_rahu_rashi: rashiOf(raw.rahu),
    transit_western: `${bodies.sun.Sign.label} Sun, ${bodies.moon.Sign.label} Moon`,
    aaj_tithi: TITHI_NAMES[Math.floor(elong / 12)],
  }
}

// ---------- Aaj ka Panchang ----------
export function computePanchang(now = new Date()) {
  const t = computeTransits(now)
  const elong = (t.raw.moon - t.raw.sun + 360) % 360
  const kIdx = Math.floor(elong / 6)
  let karana
  if (kIdx === 0) karana = 'Kimstughna'
  else if (kIdx >= 57) karana = ['Shakuni', 'Chatushpad', 'Naga'][kIdx - 57]
  else karana = KARANA_MOVING[(kIdx - 1) % 7]
  const yoga = NITYA_YOGA[Math.floor(((t.raw.moon + t.raw.sun) % 360) / (360 / 27))]
  return {
    date: t.date,
    vara: VARAS[now.getUTCDay()],
    tithi: t.aaj_tithi,
    karana,
    nitya_yoga: yoga,
    nakshatra_of_day: t.transit_chandra_nakshatra,
  }
}
