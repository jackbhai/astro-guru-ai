// ============================================================
//  BaZi — Chinese Four Pillars (PROPER implementation)
//  Reference: stellium/katelouie bazi engine + solar-term rules
//  Year pillar: Li Chun (solar longitude 315°) se shuru
//  Month pillar: Jie Qi (solar terms, tropical sun 15° steps) + Five Tigers
//  Day pillar: Julian day cycle (calibrated with sxtwl reference data)
//  Hour pillar: 2-hour branches + Five Rats
// ============================================================

import { makeChart } from './ephemeris.js'

export const HEAVENLY_STEMS = [
  { hanzi: '甲', pinyin: 'Jia', element: 'Wood', yy: 'Yang' },
  { hanzi: '乙', pinyin: 'Yi', element: 'Wood', yy: 'Yin' },
  { hanzi: '丙', pinyin: 'Bing', element: 'Fire', yy: 'Yang' },
  { hanzi: '丁', pinyin: 'Ding', element: 'Fire', yy: 'Yin' },
  { hanzi: '戊', pinyin: 'Wu', element: 'Earth', yy: 'Yang' },
  { hanzi: '己', pinyin: 'Ji', element: 'Earth', yy: 'Yin' },
  { hanzi: '庚', pinyin: 'Geng', element: 'Metal', yy: 'Yang' },
  { hanzi: '辛', pinyin: 'Xin', element: 'Metal', yy: 'Yin' },
  { hanzi: '壬', pinyin: 'Ren', element: 'Water', yy: 'Yang' },
  { hanzi: '癸', pinyin: 'Gui', element: 'Water', yy: 'Yin' },
]
export const EARTHLY_BRANCHES = [
  { hanzi: '子', pinyin: 'Zi', animal: 'Rat', element: 'Water', yy: 'Yang' },
  { hanzi: '丑', pinyin: 'Chou', animal: 'Ox', element: 'Earth', yy: 'Yin' },
  { hanzi: '寅', pinyin: 'Yin', animal: 'Tiger', element: 'Wood', yy: 'Yang' },
  { hanzi: '卯', pinyin: 'Mao', animal: 'Rabbit', element: 'Wood', yy: 'Yin' },
  { hanzi: '辰', pinyin: 'Chen', animal: 'Dragon', element: 'Earth', yy: 'Yang' },
  { hanzi: '巳', pinyin: 'Si', animal: 'Snake', element: 'Fire', yy: 'Yin' },
  { hanzi: '午', pinyin: 'Wu', animal: 'Horse', element: 'Fire', yy: 'Yang' },
  { hanzi: '未', pinyin: 'Wei', animal: 'Goat', element: 'Earth', yy: 'Yin' },
  { hanzi: '申', pinyin: 'Shen', animal: 'Monkey', element: 'Metal', yy: 'Yang' },
  { hanzi: '酉', pinyin: 'You', animal: 'Rooster', element: 'Metal', yy: 'Yin' },
  { hanzi: '戌', pinyin: 'Xu', animal: 'Dog', element: 'Earth', yy: 'Yang' },
  { hanzi: '亥', pinyin: 'Hai', animal: 'Pig', element: 'Water', yy: 'Yin' },
]

function solarLongitudeTrop(utcMs) {
  const dt = new Date(utcMs)
  const { horoscope } = makeChart({
    y: dt.getUTCFullYear(), mo: dt.getUTCMonth() + 1, d: dt.getUTCDate(),
    h: dt.getUTCHours(), mi: dt.getUTCMinutes(), tz: 0, lat: 0, lon: 0,
  })
  return horoscope.CelestialBodies.sun.ChartPosition.Ecliptic.DecimalDegrees
}

export function fourPillars(birthUTCms, civilHours, civilMinutes) {
  // ---- YEAR PILLAR (Li Chun 315° boundary) ----
  const dt = new Date(birthUTCms)
  let year = dt.getUTCFullYear()
  const lam = solarLongitudeTrop(birthUTCms)
  // saal ki shuruaat jab sun 315°+ hota hai Li Chun pe (~4 Feb). Jan/early-Feb pe pichhla pillar.
  if (dt.getUTCMonth() < 1 || (dt.getUTCMonth() === 1 && lam < 315)) year -= 1
  const yearStem = (year - 4) % 10, yearBranch = (year - 4) % 12

  // ---- MONTH PILLAR (Jie Qi boundaries: har 15° — Yin month 315-345) ----
  const monthBranch = Math.floor((((lam - 315) % 360) + 360) % 360 / 30) % 12
  const actualBranchIndex = (2 + monthBranch) % 12 // Yin=2 se shuru
  const firstMonthStem = [2, 4, 6, 8, 0][yearStem % 5] // Five Tigers
  const monthStem = (firstMonthStem + monthBranch) % 10

  // ---- DAY PILLAR (60-day cycle — sxtwl se calibrate hua, 5/5 anchors OK) ----
  const jd = birthUTCms / 86400000 + 2440587.5
  const dayGanZhi = (Math.floor(jd + 0.5) + 49) % 60
  const dayStem = dayGanZhi % 10, dayBranch = dayGanZhi % 12

  // ---- HOUR PILLAR ----
  const hourBranch = Math.floor(((civilHours + 1) % 24) / 2)
  const hourStem = ([0, 2, 4, 6, 8][dayStem % 5] + hourBranch) % 10 // Five Rats

  const pillars = [
    { name: 'Year', stem: yearStem, branch: yearBranch },
    { name: 'Month', stem: monthStem, branch: actualBranchIndex },
    { name: 'Day', stem: dayStem, branch: dayBranch },
    { name: 'Hour', stem: hourStem, branch: hourBranch },
  ].map((p) => ({
    ...p,
    stemInfo: HEAVENLY_STEMS[p.stem],
    branchInfo: EARTHLY_BRANCHES[p.branch],
    label: `${HEAVENLY_STEMS[p.stem].pinyin} ${EARTHLY_BRANCHES[p.branch].pinyin} (${HEAVENLY_STEMS[p.stem].hanzi}${EARTHLY_BRANCHES[p.branch].hanzi})`,
    elements: `${HEAVENLY_STEMS[p.stem].element}/${EARTHLY_BRANCHES[p.branch].element}`,
  }))

  // ---- Element strength + Day Master ----
  const strength = { Wood: 0, Fire: 0, Earth: 0, Metal: 0, Water: 0 }
  for (const p of pillars) {
    strength[p.stemInfo.element] += 1.2
    strength[p.branchInfo.element] += 1
  }
  const dayMaster = HEAVENLY_STEMS[dayStem]
  const sortedStrength = Object.entries(strength).sort((a, b) => b[1] - a[1])

  // ---- Ten Gods (day master ke saath har pillar ka rishta) ----
  const EL_IX = { Wood: 0, Fire: 1, Earth: 2, Metal: 3, Water: 4 }
  const dmIx = EL_IX[dayMaster.element]
  function tenGodOf(tgtEl, tgtYy) {
    const tIx = EL_IX[tgtEl], sameYy = tgtYy === dayMaster.yy
    if (tIx === dmIx) return sameYy ? 'BiJian (Friend)' : 'JieCai (Rival)'
    if ((dmIx + 1) % 5 === tIx) return sameYy ? 'ShiShen (Talent)' : 'ShangGuan (Maverick)'
    if ((dmIx + 2) % 5 === tIx) return sameYy ? 'PianCai (Big Wealth)' : 'ZhengCai (Earned Wealth)'
    if ((dmIx + 3) % 5 === tIx) return sameYy ? 'QiSha (Pressure)' : 'ZhengGuan (Authority)'
    return sameYy ? 'PianYin (Unorthodox Mind)' : 'ZhengYin (Support/Wisdom)'
  }
  for (const p of pillars) {
    p.ten_god_stem = tenGodOf(p.stemInfo.element, p.stemInfo.yy)
    p.ten_god_branch = tenGodOf(p.branchInfo.element, p.branchInfo.yy)
  }

  return {
    pillars,
    day_master: `${dayMaster.element} (${dayMaster.yy})`,
    element_strength: strength,
    strongest: sortedStrength[0][0],
    weakest: sortedStrength[sortedStrength.length - 1][0],
    approx_note: 'Month pillar solar longitude se (solar terms ~1 din boundary tolerance)',
  }
}
