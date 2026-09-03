// ============================================================
//  PANDIT ENGINE — North Indian / Punjabi pandit style checks
//  Yogas, Manglik, Kaal Sarp, Pitra Dosha, Sade Sati, Dhaiya,
//  Gochara, Gemstones, Remedies (upay), Lucky factors
// ============================================================

import { RASHI, computeTransits } from './ephemeris.js'

const IX = Object.fromEntries(RASHI.map((r, i) => [r, i]))
const EXALT = { Surya: 0, Chandra: 1, Mangal: 9, Budh: 5, Guru: 3, Shukra: 11, Shani: 6 }
const DEBIL = { Surya: 6, Chandra: 7, Mangal: 3, Budh: 11, Guru: 9, Shukra: 5, Shani: 0 }
const OWN = { Surya: [4], Chandra: [3], Mangal: [0, 7], Budh: [2, 5], Guru: [8, 11], Shukra: [1, 6], Shani: [9, 10] }
const RASHI_LORD = ['Mangal', 'Shukra', 'Budh', 'Chandra', 'Surya', 'Budh', 'Shukra', 'Mangal', 'Guru', 'Shani', 'Shani', 'Guru']
const GRAHA_EL = ['Surya', 'Chandra', 'Mangal', 'Budh', 'Guru', 'Shukra', 'Shani']

function grahaMap(chart) {
  const m = {}
  for (const g of chart.vedic.graha_table) m[g.graha] = { r: IX[g.vedic_rashi], h: g.house, retro: g.retrograde }
  return m
}
const conj = (a, b, fn = (x, y) => x.r === y.r) => fn(a, b)
const kendra = (h) => [1, 4, 7, 10].includes(h)
const trikonaFromMoon = (p, moon, list) => {
  const d = ((p.r - moon.r + 12) % 12) + 1
  return list.includes(d)
}

// ============================================================
// 1. YOGAS
// ============================================================
export function detectYogas(chart) {
  const G = grahaMap(chart)
  const out = []
  const isKendraFromMoon = (g) => trikonaFromMoon(G[g], G.Chandra, [1, 4, 7, 10])

  // Gajakesari: Guru kendra from Chandra (no malefic conjunction nuance simplified)
  if (G.Guru && isKendraFromMoon('Guru')) {
    out.push({ name: 'Gajakesari Yoga', strength: trikonaFromMoon(G.Guru, G.Chandra, [1]) ? 'strong' : 'normal', text: 'Chandra se kendra mein Guru — fame, respect, sharp intellect, log tumhare kaam ki kadar karte hain.' })
  }
  // Budhaditya: Surya + Budh same rashi
  if (G.Surya && G.Budh && conj(G.Surya, G.Budh)) {
    out.push({ name: 'Budhaditya Yoga', strength: 'normal', text: 'Surya-Budh yuti — intelligence, communication, business aur administrative skills ka classic yoga.' })
  }
  // Chandra-Mangala: Chandra + Mangal same rashi
  if (G.Chandra && G.Mangal && conj(G.Chandra, G.Mangal)) {
    out.push({ name: 'Chandra-Mangala Yoga', strength: 'normal', text: 'Chandra-Mangal yuti — wealth-earning combo; energy ko productive kaam mein lagao to dhan yoga.' })
  }
  // Kemdruma: Chandra ke 2nd/12th mein koi grah nahi (Surya chhod kar)
  if (G.Chandra) {
    const near = GRAHA_EL.filter((g) => g !== 'Chandra' && g !== 'Surya' && trikonaFromMoon(G[g], G.Chandra, [2, 12]))
    if (near.length === 0 && !trikonaFromMoon(G.Surya, G.Chandra, [2, 12])) {
      out.push({ name: 'Kemdruma Yoga', strength: 'dosha', text: 'Chandra ke aas-paas grah nahi — isolation/mood-fluctuation tendencies; Chandra remedies aur routine stability helpful.' })
    }
  }
  // Pancha Mahapurusha: Mangal/Budh/Guru/Shukra/Shani own ya exalted + kendra
  const PMP = { Mangal: 'Ruchaka', Budh: 'Bhadra', Guru: 'Hamsa', Shukra: 'Malavya', Shani: 'Shasha' }
  for (const [g, yname] of Object.entries(PMP)) {
    if (!G[g]) continue
    const strong = EXALT[g] === G[g].r || OWN[g].includes(G[g].r)
    if (strong && kendra(G[g].h)) {
      out.push({ name: `${yname} Yoga (Pancha Mahapurusha)`, strength: EXALT[g] === G[g].r ? 'strong' : 'normal', text: `${g} ${EXALT[g] === G[g].r ? 'uchcha' : 'swakshetra'} + kendra (${G[g].h}th house) — personality ke is area mein rare strength.` })
    }
  }
  // Neecha Bhanga (simplified): debilitated grah + us sign ka lord ya exaltation-lord kendra from lagna/moon
  for (const g of GRAHA_EL) {
    if (G[g] && DEBIL[g] === G[g].r) {
      const signLord = RASHI_LORD[G[g].r]
      const exaltLord = RASHI_LORD[EXALT[g]]
      const cancel = [signLord, exaltLord].some((lg) => lg && G[lg] && (kendra(G[lg].h) || isKendraFromMoon(lg)))
      if (cancel) out.push({ name: `Neecha Bhanga (${g})`, strength: 'reversal', text: `${g} neecha hai par ${signLord} ka prabhav se bhanga — struggle ke baad usi area mein vishal strength.` })
      else out.push({ name: `${g} Neecha (dhyan de)`, strength: 'watch', text: `${g} neecha rashi mein — is graha ke kaam mein extra effort + remedies consider.` })
    }
  }
  // Dhana Yoga (simple): 2nd/5th/9th/11th lords kendra-trikona mein ya 11th house mein strong graha
  const lagnaIx = IX[chart.vedic.lagna] ?? 0
  const lordOf = (h) => RASHI_LORD[(lagnaIx + h - 1) % 12]
  const dhanaLords = [lordOf(2), lordOf(11), lordOf(5), lordOf(9)]
  const strongDhana = dhanaLords.filter((l) => G[l] && (kendra(G[l].h) || [1, 5, 9].includes(((G[l].h - 1) % 12) + 1) || EXALT[l] === G[l].r || OWN[l].includes(G[l].r)))
  if (strongDhana.length >= 2) out.push({ name: 'Dhana Yoga', strength: 'normal', text: `Dhan-bhav ke swami (${[...new Set(strongDhana)].join(', ')}) strong sthiti mein — wealth-building combinations banti hain.` })

  // Raja Yoga (simple): kendra lord + trikona lord same house/conjunction
  const kendraLords = [1, 4, 7, 10].map(lordOf)
  const trikonaLords = [1, 5, 9].map(lordOf)
  outer: for (const k of kendraLords) {
    for (const t of trikonaLords) {
      if (k !== t && G[k] && G[t] && conj(G[k], G[t])) {
        out.push({ name: 'Raja Yoga', strength: 'normal', text: `Kendra swami ${k} + Trikona swami ${t} yuti (${G[k].h}th house) — status-rise ka classic combo.` })
        break outer
      }
    }
  }
  return out
}

// ============================================================
// 2. MANGLIK (North Indian: 1,2,4,7,8,12 houses; some count 2 in north, south counts 2 too — hum north le rahe)
// ============================================================
export function manglikCheck(chart) {
  const G = grahaMap(chart)
  if (!G.Mangal) return { manglik: false }
  const MANGLIK_HOUSES = [1, 2, 4, 7, 8, 12]
  const isM = MANGLIK_HOUSES.includes(G.Mangal.h)
  if (!isM) return { manglik: false, house: G.Mangal.h, note: 'Mangal in non-manglik house — Manglik dosha NAHI hai.' }
  let level = 'high'
  const cancels = []
  if (IX['Mesha'] === G.Mangal.r || IX['Vrishchika'] === G.Mangal.r) cancels.push('Mangal swakshetra — dosha ka prabhav ghata')
  if (EXALT.Mangal === G.Mangal.r) { cancels.push('Mangal uchcha — dosha almost cancel'); level = 'low' }
  if (G.Mangal.h === 1 && IX['Mesha'] === G.Mangal.r) cancels.push('Mesha lagna special rule')
  if (G.Guru && (kendra(G.Guru.h) || Math.abs(((G.Guru.h - G.Mangal.h + 12) % 12)) === 0 || [5, 9].some(() => false))) cancels.push('Guru ka bal — dosha kam')
  if (G.Guru && [1, 4, 7, 10, 5, 9].includes(((G.Guru.h - G.Mangal.h + 12) % 12) + 1)) cancels.push('Guru ki sthiti se mars pe positive prabhav')
  if (cancels.length && level === 'high') level = 'medium'
  return { manglik: true, house: G.Mangal.h, level, cancels, note: `Mangal ${G.Mangal.h}th house mein — Manglik dosha (${chart.vedic.graha_table.find((x)=>x.graha==='Mangal')?.vedic_rashi || ''} rashi).` }
}

// ============================================================
// 3. KAAL SARP — saare 7 grah Rahu-Ketu axis ke ek hi taraf
// ============================================================
const HI2EN = { Surya: 'sun', Chandra: 'moon', Mangal: 'mars', Budh: 'mercury', Guru: 'jupiter', Shukra: 'venus', Shani: 'saturn' }

export function kaalSarpCheck(chart) {
  const G = grahaMap(chart)
  if (!G.Rahu || !chart.raw_sidereal) return { present: false }
  const rahuLon = chart.raw_sidereal.rahu
  const inArc = (lon) => ((lon - rahuLon + 360) % 360) <= 180
  const lons = GRAHA_EL.map((g) => chart.raw_sidereal[HI2EN[g]])
  const allInOneSide = lons.every(inArc) || lons.every((l) => !inArc(l))
  if (!allInOneSide) return { present: false }
  const TYPES = ['Anant', 'Kulik', 'Vasuki', 'Shankhpal', 'Padma', 'Mahapadma', 'Takshak', 'Karkotak', 'Shankhachood', 'Ghatak', 'Vishdhar', 'Sheshnag']
  const typeIx = (G.Rahu.h - 1) % 12
  return { present: true, type: `${TYPES[typeIx]} Kaal Sarp`, note: `Rahu ${G.Rahu.h}th, Ketu ${G.Ketu.h}th house axis pe saare grah ek taraf — intensity/release pattern; pandit log remedies shanti ke liye suggest karte hain.` }
}

// ============================================================
// 4. PITRA DOSHA (simple classical triggers)
// ============================================================
export function pitraDoshaCheck(chart) {
  const G = grahaMap(chart)
  const found = []
  if (G.Surya && G.Rahu && conj(G.Surya, G.Rahu)) found.push('Surya-Rahu yuti (Grahan yog) — pitra karz ka classic sanket')
  if (G.Surya && G.Shani && conj(G.Surya, G.Shani)) found.push('Surya-Shani yuti — pitra se karmic tension')
  if (G.Rahu && G.Rahu.h === 9) found.push('Rahu 9th (pitra bhav) mein')
  if (G.Shani && G.Shani.h === 9) found.push('Shani 9th house mein')
  if (G.Surya && G.Surya.h === 9) found.push('Surya 9th mein — pitra bhav strong par sensitive')
  return { present: found.length > 0, triggers: found }
}

// ============================================================
// 5. SADE SATI + Dhaiya (transits se)
// ============================================================
export function gocharaStatus(chart, transits) {
  const moonIx = IX[chart.vedic.chandra_rashi]
  const satIx = Math.floor(transits.raw.saturn / 30)
  const jupIx = Math.floor(transits.raw.jupiter / 30)
  const rel = (a, b) => ((a - b + 12) % 12) + 1
  const d = rel(satIx, moonIx)
  let sade = null
  if (d === 12) sade = { phase: '1st phase (Rising/Opreration start)', text: 'Sade Sati SHURU — saturn tumhari chandra rashi ke 12th mein. Budget, rest aur planning pe dhyan.' }
  if (d === 1) sade = { phase: '2nd phase (Peak)', text: 'Sade Sati PEAK — saturn chandra rashi ke upar. Health, mental peace, family — sabar aur routine ka samay.' }
  if (d === 2) sade = { phase: '3rd phase (Setting)', text: 'Sade Sati LAST phase — release ho raha. Pending kaam wrap-up, naye bandhan soch samajh kar.' }
  let dhaiya = null
  if (d === 4) dhaiya = { text: 'Ardha-Ashtama Shani (4th/Kantak Dhaiya chal raha) — ghar/vehicle/peace pe choti chunautiyan.' }
  if (d === 8) dhaiya = { text: 'Ashtama Shani (8th Dhaiya chal raha) — health/research/patience ka test, bade risk avoid.' }
  const GOOD = { jupiter: [2, 5, 7, 9, 11], saturn: [3, 6, 11], sun: [3, 6, 10, 11], moon: [1, 3, 6, 7, 10, 11], venus: [1, 2, 3, 4, 5, 8, 9, 11, 12], mercury: [2, 4, 6, 8, 10, 11], mars: [3, 6, 11] }
  const mk = (key, lon) => ({ house: rel(Math.floor(lon / 30), moonIx), good: GOOD[key].includes(rel(Math.floor(lon / 30), moonIx)) })
  return {
    moon_rashi: chart.vedic.chandra_rashi,
    shani_gochar: { rashi: transits.transit_shani_rashi, house_from_moon: d },
    guru_gochar: { rashi: transits.transit_guru_rashi, house_from_moon: rel(jupIx, moonIx), benefic: GOOD.jupiter.includes(rel(jupIx, moonIx)) },
    sade_sati: sade,
    dhaiya,
    quick: {
      jupiter: mk('jupiter', transits.raw.jupiter),
      saturn: mk('saturn', transits.raw.saturn),
      sun: mk('sun', transits.raw.sun),
      venus: mk('venus', transits.raw.venus),
      moon_today: transits.transit_chandra_rashi,
    },
  }
}

// ============================================================
// 6. GEMSTONES + REMEDIES (Lal Kitab + classical upay style)
// ============================================================
export const GEMSTONES = {
  Surya: { stone: 'Manik (Ruby)', metal: 'Gold/Sona', day: 'Ravivar', finger: 'Ring finger (Anamika)', note: 'Surya kamzor ho to — par pehle trial karo, har kisi pe suit nahi karta' },
  Chandra: { stone: 'Moti (Pearl)', metal: 'Silver/Chandi', day: 'Somvar', finger: 'Little finger (Kanishtha)', note: 'Chandra weak/afflicted ho to mental shanti ke liye' },
  Mangal: { stone: 'Moonga (Red Coral)', metal: 'Gold/Copper mix', day: 'Mangalvar', finger: 'Ring finger', note: 'Courage/property issues — Manglik ho to pandit se confirm karna' },
  Budh: { stone: 'Panna (Emerald)', metal: 'Gold', day: 'Budhvar', finger: 'Little finger', note: 'Budhi/business/speech ke liye classical' },
  Guru: { stone: 'Pukhraj (Yellow Sapphire)', metal: 'Gold', day: 'Guruvar', finger: 'Index finger (Tarjani)', note: 'Sabse safe mana jata hai — wisdom/marriage/dhan yog ke liye' },
  Shukra: { stone: 'Heera (Diamond)/Opal', metal: 'Silver/Platinum', day: 'Shukravar', finger: 'Middle finger', note: 'Love/luxury/arts — Shukra weak ho to' },
  Shani: { stone: 'Neelam (Blue Sapphire)', metal: 'Iron/Panchdhatu', day: 'Shanivar', finger: 'Middle finger (Madhyama)', note: '⚠ SABSE TESTING STONE — bina proper consultation mat pehno, pehle 3-din trial' },
  Rahu: { stone: 'Gomed (Hessonite)', metal: 'Silver/Panchdhatu', day: 'Shanivar', finger: 'Middle finger', note: 'Rahu dasha/antardasha mein confusion ho to' },
  Ketu: { stone: 'Lehsunia (Cat\'s Eye)', metal: 'Silver/Panchdhatu', day: 'Shanivar/Mangalvar', finger: 'Middle/Little', note: 'Ketu dasha mein spiritual protection' },
}

export const REMEDIES = {
  Surya: ['Ravivar ko surya ko arghya (jal) do — subah suryoday pe', 'Om Suryaya Namah / Aditya Hridaya Stotra', 'Pita ki seva, gud (jaggery) daan', 'Tambe ke lotte mein jal + kumkum arghya'],
  Chandra: ['Somvar vrat rakhna', 'Om Chandraya Namah / Shiva mantra', 'Mata ki seva, doodh-chawal daan', 'Shivalingam pe jal chadhana', 'Pani peena silver glass mein (traditional)'],
  Mangal: ['Mangalvar vrat + Hanuman Chalisa', 'Lal masoor dal / gud daan', 'Om Mangalaya Namah', 'Bhai-behen ke saath sambandh improve karo', 'Blood donation bhi ek modern take hai'],
  Budh: ['Budhvar ko hari cheezein daan (palak, hari moong)', 'Om Budhaya Namah / Vishnu mantra', 'Durva ghas Ganesh ji ko', 'Pens/books bachon ko dono'],
  Guru: ['Guruvar vrat, peele vastra', 'Om Gurave Namah / Dakshinamurthy stotram', 'Chana dal + haldi daan', 'Guru/respect elders ki seva', 'Banana plant ki seva (classic)'],
  Shukra: ['Shukravar ko safed cheezein daan (kheer, chawal)', 'Om Shukraya Namah', 'Gau-seva', 'Agarbatti/attar ka use', 'Sundarta/cleanliness maintain karna'],
  Shani: ['Shanivar ko kale kapde/kale till/tail daan', 'Om Shanicharaya Namah + Hanuman Chalisa (classic combo)', 'Gareebon/workers ki seva — Shani seva se banta hai', 'Saturday peepal deepak', 'Sarson ke tel ka diya'],
  Rahu: ['Shanivar ko dhoka/illusion se bachye, saraswati mantra', 'Om Rahave Namah', 'Nariyal daan / jhand mein coconut bahana (classical)', 'Durga Saptashati/Hanuman path'],
  Ketu: ['Om Ketave Namah', 'Tilak/kumkum apply daily', 'Dhari/dogs ki seva (Ketu classical link)', 'Ganesh mantra — Vighnaharta Ketu par'],
}

export const RASHI_LUCKY = {
  Mesha: { day: 'Mangalvar', color: 'Laal (Red)', number: 9 },
  Vrishabha: { day: 'Shukravar', color: 'Safed (White)', number: 6 },
  Mithuna: { day: 'Budhvar', color: 'Hara (Green)', number: 5 },
  Karka: { day: 'Somvar', color: 'Safed/Cream', number: 2 },
  Simha: { day: 'Ravivar', color: 'Sunhera (Gold)', number: 1 },
  Kanya: { day: 'Budhvar', color: 'Hara/Olive', number: 5 },
  Tula: { day: 'Shukravar', color: 'Halka gulabi/peach', number: 6 },
  Vrishchika: { day: 'Mangalvar', color: 'Gahra laal/maroon', number: 9 },
  Dhanu: { day: 'Guruvar', color: 'Peela (Yellow)', number: 3 },
  Makara: { day: 'Shanivar', color: 'Kala/neela (Dark)', number: 8 },
  Kumbha: { day: 'Shanivar', color: 'Neela (Blue)', number: 8 },
  Meena: { day: 'Guruvar', color: 'Peela/sea-green', number: 3 },
}

// ============================================================
// Poora pandit report (chart ke liye)
// ============================================================
export function panditAnalysis(chart) {
  const transits = computeTransits()
  const yogas = detectYogas(chart)
  return {
    yogas,
    manglik: manglikCheck(chart),
    kaal_sarp: kaalSarpCheck(chart),
    pitra_dosha: pitraDoshaCheck(chart),
    gochara: gocharaStatus(chart, transits),
    lucky: RASHI_LUCKY[chart.vedic.chandra_rashi],
    weak_grahas: chart.vedic.graha_table.filter((g) => g.graha in DEBIL && IX[g.vedic_rashi] === DEBIL[g.graha]).map((g) => g.graha),
  }
}
