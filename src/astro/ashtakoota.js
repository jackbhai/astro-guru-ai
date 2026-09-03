// ============================================================
//  ASHTAKOOTA — 36 Guna Milan (North Indian pandit style)
//  Tables: PyJHora (MIT) classical datasets se extract + verify
//  8 Koota: Varna(1) Vashya(2) Tara(3) Yoni(4) Maitri(5) Gana(6) Bhakoot(7) Nadi(8)
// ============================================================

import { RASHI } from './ephemeris.js'

// Nakshatra → Yoni (14 animals) [PyJHora table]
const YONI_MAP = [0, 1, 2, 3, 3, 4, 5, 2, 5, 6, 6, 7, 8, 9, 8, 9, 10, 10, 4, 11, 12, 11, 13, 0, 13, 7, 1]
export const YONI_NAMES = ['Ghoda (Horse)', 'Haathi (Elephant)', 'Bakri (Sheep)', 'Saamp (Serpent)', 'Kutta (Dog)', 'Billi (Cat)', 'Chuha (Rat)', 'Gai (Cow)', 'Bhains (Buffalo)', 'Baagh (Tiger)', 'Hiran (Deer)', 'Bandar (Monkey)', 'Newla (Mongoose)', 'Sher (Lion)']

// Yoni compatibility matrix 14x14 [PyJHora YoniArray]
const YONI_ARRAY = [
  [4, 2, 2, 3, 2, 2, 2, 1, 0, 1, 1, 3, 2, 1],
  [2, 4, 3, 3, 2, 2, 2, 2, 3, 1, 2, 3, 2, 0],
  [2, 3, 4, 2, 1, 2, 1, 3, 3, 1, 2, 0, 3, 1],
  [3, 3, 2, 4, 2, 1, 1, 1, 1, 2, 2, 2, 0, 2],
  [2, 2, 1, 2, 4, 2, 1, 2, 2, 1, 0, 2, 1, 1],
  [2, 2, 2, 1, 2, 4, 0, 2, 2, 1, 3, 3, 2, 1],
  [2, 2, 1, 1, 1, 0, 4, 2, 2, 2, 2, 2, 1, 2],
  [1, 2, 3, 1, 2, 2, 2, 4, 3, 0, 3, 2, 2, 1],
  [0, 3, 3, 1, 2, 2, 2, 3, 4, 1, 2, 2, 2, 1],
  [1, 1, 1, 2, 1, 1, 2, 0, 1, 4, 1, 1, 2, 1],
  [1, 2, 2, 2, 0, 3, 2, 3, 2, 1, 4, 2, 2, 1],
  [3, 3, 0, 2, 2, 3, 2, 2, 2, 1, 2, 4, 3, 2],
  [2, 2, 3, 0, 1, 2, 1, 2, 2, 2, 2, 3, 4, 2],
  [1, 0, 1, 2, 1, 1, 2, 1, 1, 1, 1, 2, 2, 4],
]

// Varna per rashi: fire=Kshatriya(1), earth=Shudra(3), air=Vaishya(2), water=Brahmin(0) [PyJHora scheme]
const VARNA_OF_RASHI = [1, 3, 2, 0, 1, 3, 2, 0, 1, 3, 2, 0]
export const VARNA_NAMES = ['Brahmin', 'Kshatriya', 'Vaishya', 'Shudra']
const VARNA_ARRAY = [[1, 0, 0, 0], [1, 1, 0, 0], [1, 1, 1, 0], [1, 1, 1, 1]] // [girl][boy] → match

// Vashya per rashi (classical): 0=Chatushpad 1=Manava 2=Jalachar 3=Vanachar 4=Keeta
const VASHYA_OF_RASHI = [0, 0, 1, 2, 3, 1, 1, 4, 1, 2, 1, 2]
const VASHYA_NAMES = ['Chatushpad (Char-paya)', 'Manava (Insaan)', 'Jalachar (Jal-jaanvar)', 'Vanachar (Jangli)', 'Keeta']
const VASHYA_ARRAY = [ // [boy][girl] from Saravali [PyJHora]
  [2.0, 0.5, 1.0, 0.0, 2.0],
  [0.5, 2.0, 0.0, 0.0, 0.0],
  [1.0, 0.0, 2.0, 2.0, 2.0],
  [0.0, 0.0, 2.0, 2.0, 0.0],
  [1.0, 0.0, 1.0, 0.0, 2.0],
]

// Gana: 0=Deva 1=Manushya 2=Rakshasa (per nakshatra, 1-based lists classical)
const GANA_OF_NAK = (() => {
  const m = new Array(27).fill(1)
  for (const n of [1, 5, 7, 8, 13, 15, 17, 22, 27]) m[n - 1] = 0
  for (const n of [3, 9, 10, 14, 16, 18, 19, 23, 24]) m[n - 1] = 2
  return m
})()
export const GANA_NAMES = ['Deva', 'Manushya', 'Rakshasa']
const GANA_ARRAY = [[6, 6, 0], [5, 6, 0], [1, 0, 6]] // [boy][girl]

// Maitri (rashi lord friendship) [PyJHora raasi_adhipathi_array] planets: 0=Surya 1=Chandra 2=Mangal 3=Budh 4=Guru 5=Shukra 6=Shani
const RASHI_LORD_IX = [2, 5, 3, 1, 0, 3, 5, 2, 4, 6, 6, 4]
const MAITRI_ARRAY = [
  [5.0, 5.0, 5.0, 4.0, 5.0, 0.0, 0.0],
  [5.0, 5.0, 4.0, 1.0, 4.0, 0.5, 0.5],
  [5.0, 4.0, 5.0, 0.5, 5.0, 3.0, 0.5],
  [4.0, 1.0, 0.5, 5.0, 0.5, 5.0, 4.0],
  [5.0, 4.0, 5.0, 0.5, 5.0, 0.5, 3.0],
  [0.0, 0.5, 3.0, 5.0, 0.5, 5.0, 5.0],
  [0.0, 0.5, 0.5, 4.0, 3.0, 5.0, 5.0],
]
export const RASHI_LORD_HI = ['Mangal', 'Shukra', 'Budh', 'Chandra', 'Surya', 'Budh', 'Shukra', 'Mangal', 'Guru', 'Shani', 'Shani', 'Guru']

// Nadi per nakshatra: 0=Adi 1=Madhya 2=Antya
const NADI_OF_NAK = (() => {
  const m = new Array(27).fill(1)
  for (const n of [1, 6, 7, 12, 13, 18, 19, 24, 25]) m[n - 1] = 0
  for (const n of [3, 4, 9, 10, 15, 16, 21, 22, 27]) m[n - 1] = 2
  return m
})()
export const NADI_NAMES = ['Adi', 'Madhya', 'Antya']

const TARA_NAMES = ['Janma', 'Sampat', 'Vipat', 'Kshema', 'Pratyari', 'Sadhak', 'Vadha', 'Mitra', 'Ati-Mitra']
const TARA_GOOD = new Set([2, 4, 6, 8, 0]) // Sampat, Kshema, Sadhak, Mitra, Ati-Mitra (by index remainder)

export const KOOTA_MAX = { varna: 1, vashya: 2, tara: 3, yoni: 4, maitri: 5, gana: 6, bhakoot: 7, nadi: 8 }

export function ashtakoota(boy, girl) {
  // Inputs: { nakIdx: 0-26, rashiIx: 0-11 }
  const rows = []

  // 1. VARNA (max 1) — boy varna >= girl varna
  const bv = VARNA_OF_RASHI[boy.rashiIx], gv = VARNA_OF_RASHI[girl.rashiIx]
  const vScore = VARNA_ARRAY[gv][bv] * 1
  rows.push({ k: 'Varna', got: vScore, max: 1, detail: `Ladka ${VARNA_NAMES[bv]} · Ladki ${VARNA_NAMES[gv]} — ladke ka varna utna ya upar hona chahiye` })

  // 2. VASHYA (max 2)
  const bva = VASHYA_OF_RASHI[boy.rashiIx], gva = VASHYA_OF_RASHI[girl.rashiIx]
  const vaScore = VASHYA_ARRAY[bva][gva]
  rows.push({ k: 'Vashya', got: vaScore, max: 2, detail: `Ladka ${VASHYA_NAMES[bva]} · Ladki ${VASHYA_NAMES[gva]}` })

  // 3. TARA (max 3) — dono taraf se count, favorable taras
  const t1 = (girl.nakIdx - boy.nakIdx + 27) % 27 % 9
  const t2 = (boy.nakIdx - girl.nakIdx + 27) % 27 % 9
  const good1 = TARA_GOOD.has(t1), good2 = TARA_GOOD.has(t2)
  const tScore = good1 && good2 ? 3 : good1 || good2 ? 1.5 : 0
  rows.push({ k: 'Tara', got: tScore, max: 3, detail: `${TARA_NAMES[t1]} / ${TARA_NAMES[t2]} tara — ${good1 && good2 ? 'dono shubh' : good1 || good2 ? 'ek shubh' : 'dono ashubh'}` })

  // 4. YONI (max 4)
  const yb = YONI_MAP[boy.nakIdx], yg = YONI_MAP[girl.nakIdx]
  const yScore = YONI_ARRAY[yb][yg]
  rows.push({ k: 'Yoni', got: yScore, max: 4, detail: `Ladka ${YONI_NAMES[yb]} yoni · Ladki ${YONI_NAMES[yg]} yoni` })

  // 5. MAITRI (max 5) — rashi lord friendship
  const lb = RASHI_LORD_IX[boy.rashiIx], lg = RASHI_LORD_IX[girl.rashiIx]
  const mScore = MAITRI_ARRAY[lb][lg]
  rows.push({ k: 'Maitri', got: mScore, max: 5, detail: `${RASHI_LORD_HI[boy.rashiIx]} × ${RASHI_LORD_HI[girl.rashiIx]} rashi swami maitri` })

  // 6. GANA (max 6)
  const gb = GANA_OF_NAK[boy.nakIdx], gg = GANA_OF_NAK[girl.nakIdx]
  const gScore = GANA_ARRAY[gb][gg]
  rows.push({ k: 'Gana', got: gScore, max: 6, detail: `Ladka ${GANA_NAMES[gb]} gana · Ladki ${GANA_NAMES[gg]} gana` })

  // 7. BHAKOOT (max 7) — rashi distance; 2-12, 5-9, 6-8 = dosha
  const dist = (girl.rashiIx - boy.rashiIx + 12) % 12 + 1
  const bad = [2, 5, 6].includes(dist)
  const bScore = bad ? 0 : 7
  rows.push({ k: 'Bhakoot', got: bScore, max: 7, detail: `Rashi distance ${dist} — ${bad ? (dist === 6 ? 'Shadashtaka (6-8)' : dist === 2 ? 'Dwirdwadasha (2-12)' : 'Nav-Pancham (5-9)') + ' dosha' : `${RASHI[boy.rashiIx]} × ${RASHI[girl.rashiIx]} anukool`}`, dosha: bad })

  // 8. NADI (max 8) — same nadi = Nadi dosha (0)
  const nb = NADI_OF_NAK[boy.nakIdx], ng = NADI_OF_NAK[girl.nakIdx]
  const nScore = nb === ng ? 0 : 8
  rows.push({ k: 'Nadi', got: nScore, max: 8, detail: `Ladka ${NADI_NAMES[nb]} nadi · Ladki ${NADI_NAMES[ng]} nadi${nb === ng ? ' — NADI DOSHA' : ' — anukool'}`, dosha: nb === ng })

  const total = rows.reduce((s, r) => s + r.got, 0)
  const doshas = rows.filter((r) => r.dosha).map((r) => r.k)

  let verdict, vClass
  if (total >= 28) { verdict = 'Uttam Milan — bahut achhi compatibility'; vClass = 'great' }
  else if (total >= 18) { verdict = 'Achha Milan — shaadi yogya score (18+ theek mana jata hai)'; vClass = 'good' }
  else if (total >= 14) { verdict = 'Madhyam — pandit se dosha-shanti ka options puchna uchit'; vClass = 'avg' }
  else { verdict = 'Kamzor Milan — guna kam mil rahe, detailed analysis zaroori'; vClass = 'low' }

  return { rows, total, max: 36, doshas, verdict, vClass }
}

// Chart objects (computeChart output) se nakIdx/rashiIx nikaalne ke liye helper
export function moonIndices(chart) {
  const moonRow = chart.vedic.graha_table.find((g) => g.graha === 'Chandra')
  const rashiIx = RASHI.indexOf(moonRow.vedic_rashi)
  const nakIdx = Math.floor(chart.raw_sidereal.moon / (360 / 27))
  return { nakIdx, rashiIx }
}
