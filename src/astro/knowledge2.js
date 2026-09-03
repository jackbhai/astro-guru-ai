// ============================================================
//  KNOWLEDGE PACK 2 — 20x expansion
//  North Indian/Punjabi pandit traditions: yogas texts, remedies,
//  gemstones, dasha BPHS-lite, moon-in-rashi, lagna personalities,
//  panchang meanings, transit (gochara) house effects, BaZi ten gods,
//  nakshatra meta (deity/symbol/gana/nadi) — sab AI grounding ke liye
// ============================================================

import { RASHI } from './ephemeris.js'
import { GEMSTONES, REMEDIES } from './pandit.js'

// ---------- Nakshatra deep meta (deity/symbol/gana/nadi/nature) ----------
export const NAK_META = {
  Ashwini: { deity: 'Ashwini Kumars (celestial healers)', symbol: 'Ghode ka sar', nature: 'Swift, healing, action-first — jaldi shuruaat karne wale', gana: 'Deva' },
  Bharani: { deity: 'Yama (dharma/mrityu dev)', symbol: 'Yoni', nature: 'Bharan-poshan — discipline, responsibility, power', gana: 'Manushya' },
  Krittika: { deity: 'Agni', symbol: 'Chhaaku/tez dhara', nature: 'Cut & purify — sharp, leader, caring heat', gana: 'Rakshasa' },
  Rohini: { deity: 'Brahma/Prajapati', symbol: 'Rath', nature: 'Most creative & attractive — growth, beauty, material skill', gana: 'Manushya' },
  Mrigashira: { deity: 'Soma (Chandra)', symbol: 'Hiran ka sar', nature: 'Searcher — curiosity, gentle exploration', gana: 'Deva' },
  Ardra: { deity: 'Rudra (Shiva roop)', symbol: 'Aansu/toofan', nature: 'Storm-born clarity — deep thinker, intense', gana: 'Manushya' },
  Punarvasu: { deity: 'Aditi (dev-mata)', symbol: 'Teer-kaman', nature: 'Return & renewal — philosophic, always bounces back', gana: 'Deva' },
  Pushya: { deity: 'Brihaspati', symbol: 'Doodh-dhenu', nature: 'Nourisher #1 — duty, tradition, care, most auspicious', gana: 'Deva' },
  Ashlesha: { deity: 'Naag dev', symbol: 'Lipta saamp', nature: 'Serpent wisdom — strategic, psychological, hypnotic', gana: 'Rakshasa' },
  Magha: { deity: 'Pitrs (purvaj)', symbol: 'Sinhasan', nature: 'Royal ancestor energy — legacy, authority, parampara', gana: 'Rakshasa' },
  'Purva Phalguni': { deity: 'Bhaga (sukh dev)', symbol: 'Shayya/palang', nature: 'Pleasure creator — romance, arts, relaxation', gana: 'Manushya' },
  'Uttara Phalguni': { deity: 'Aryaman (mitra dev)', symbol: 'Palang ka pichhla hissa', nature: 'Duty-through-bonds — contracts, seva, steady partnerships', gana: 'Manushya' },
  Hasta: { deity: 'Savitri (Surya roop)', symbol: 'Haath', nature: 'Master of hands — skill, healing, clever control', gana: 'Deva' },
  Chitra: { deity: 'Vishwakarma', symbol: 'Chamakta ratan', nature: 'Cosmic architect — design, charisma, shine', gana: 'Rakshasa' },
  Swati: { deity: 'Vayu', symbol: 'Hilti paudhi', nature: 'Independent wind — flexible, business-minded, free', gana: 'Deva' },
  Vishakha: { deity: 'Indra-Agni', symbol: 'Toran/dhanush', nature: 'Goal arch — milestone-focused, determined', gana: 'Rakshasa' },
  Anuradha: { deity: 'Mitra', symbol: 'Kamad', nature: 'Friendship star — devoted, disciplined, long-term', gana: 'Deva' },
  Jyeshtha: { deity: 'Indra', symbol: 'Baajuband/kundal', nature: 'Elder, protector — responsible senior, sharp mind', gana: 'Rakshasa' },
  Mula: { deity: 'Nirriti', symbol: 'Jad (root)', nature: 'Root-digger — destroys to rebuild, research mind', gana: 'Rakshasa' },
  'Purva Ashadha': { deity: 'Apah (jal)', symbol: 'Pankha', nature: 'Undefeated — willpower, purification, victory drive', gana: 'Manushya' },
  'Uttara Ashadha': { deity: 'Vishvedeva', symbol: 'Hathi-ki-sund/block', nature: 'Lasting victory — dharma-aligned achievement', gana: 'Manushya' },
  Shravana: { deity: 'Vishnu', symbol: 'Teen kadam', nature: 'Listener-learner — knowledge, reputation, careful steps', gana: 'Deva' },
  Dhanishta: { deity: 'Ashta Vasu', symbol: 'Dhol/nagada', nature: 'Rhythm of wealth — music, teams, prosperity', gana: 'Rakshasa' },
  Shatabhisha: { deity: 'Varun', symbol: 'Parda/chakra', nature: '100 healers — secrets, science, mystic veiling', gana: 'Rakshasa' },
  'Purva Bhadrapada': { deity: 'Aja Ekapad', symbol: 'Takht ke do paye', nature: 'Spiritual fire — intense idealism, two-faced depth', gana: 'Manushya' },
  'Uttara Bhadrapada': { deity: 'Ahir Budhnya', symbol: 'Takht ke pichhle paye', nature: 'Deep calm — tapasya, wisdom under surface', gana: 'Manushya' },
  Revati: { deity: 'Pushan (marg-rakshak)', symbol: 'Machhli', nature: 'Completion & care — travel, nurture, gentle endings', gana: 'Deva' },
}

// ---------- Moon-in-rashi emotional style ----------
export const MOON_STYLE = {
  Mesha: 'Mann tez aur impulsive — emotions fast aate-jaate hain; action se peace milti hai.',
  Vrishabha: 'Mann stable aur comfort-seeker — routine, achha khana, nature se shanti.',
  Mithuna: 'Mann curious aur restless — baat karke,t padhke, multiple interests se relaxed.',
  Karka: 'Mann deep-nurturing — ghar, maa, memories se emotional anchoring; sensitivity high.',
  Simha: 'Mann proud-creative — recognition chahiye, respect milti hai to warmth overflow.',
  Kanya: 'Mann analytical — perfection-chhaap worry bhi; service aur order se sukoon.',
  Tula: 'Mann harmony-first — relationships se balance, decision mein evaluate bahut karta.',
  Vrishchika: 'Mann intense-secretive — gehra feel karta hai, bharosa banane mein waqt, loyal deep.',
  Dhanu: 'Mann optimistic-explorer — meaning chahiye, travel/teaching se mind expand.',
  Makara: 'Mann disciplined-practical — emotions control mein, kaam se validation milti hai.',
  Kumbha: 'Mann detached-humanitarian — logical processing, groups/causes se judna.',
  Meena: 'Mann dreamy-compassionate — intuition high, borders soft, creative escape zaroori.',
}

// ---------- Lagna personality (outer personality) ----------
export const LAGNA_PERSONALITY = {
  Mesha: 'Simhaast-ewar: energetic, bold, direct — hero-type entry, forehead prominent vibe; initiator.',
  Vrishabha: 'Solid-luxury: patient, charming, sensuous — stable presence, voice attractive; finisher.',
  Mithuna: 'Smart-twin: witty, expressive, youthful — talker/connector, hands expressive.',
  Karka: 'Caring-moonface: soft, protective, family-first — round aura, memory bank.',
  Simha: 'Royal-walk: dignified, dramatic, generous — chest-out confidence, born stage-presence.',
  Kanya: 'Perfect-helper: neat, precise, observant — detail nazar, clean presentation.',
  Tula: 'Charming-judge: balanced, beautiful, social — pleasant face, fair-minded approach.',
  Vrishchika: 'Magnetic-mystery: intense eyes, private, powerful aura — depth personality.',
  Dhanu: 'Happy-teacher: open, tall-energy, philosophical — laughter + guidance combo.',
  Makara: 'Serious-builder: structured, mature-beyond-age, ambitious-quiet — responsibility face.',
  Kumbha: 'Quirky-humanist: different-style, gadget-lover, cause-driven — unique dressing/thinking.',
  Meena: 'Soft-dreamer: gentle, artistic, cosmic — dreamy eyes, healing presence.',
}

// ---------- Dasha extended (BPHS-lite classics) ----------
export const DASHA_EXTENDED = {
  Surya: 'Surya MD (6 saal): self-identity, father, sarkar, authority — status define hota hai. Ego-tests aate hain; health pe heat/eyes ka dhyan. Best karma: integrity ke saath lead karna.',
  Chandra: 'Chandra MD (10 saal): emotions, maa, ghar, public — emotional patterns mature hote hain. Moon strong ho to popularity/peace, weak ho to mood-management seekhna. Best: water-respect, maa seva, mental peace routines.',
  Mangal: 'Mangal MD (7 saal): action, property, courage, siblings/rivals — energy overflow; direction mile to sports/engineering/army-type wins, na mile to conflicts. Best: physical discipline + Hanuman Chalisa tradition.',
  Budh: 'Budh MD (17 saal): intellect, business, communication, study — sabse productive for trade/writing/tech. Speech polis hoti hai. Best:continuous learning, documentation, green remedies Wednesday.',
  Guru: 'Guru MD (16 saal): wisdom, expansion, guru-marg, children — most blessed; marriage/children events aksar yahin. Over-indulgence watch. Best: gratitude practice, teeach/mentor karna, Thursday fast tradition.',
  Shukra: 'Shukra MD (20 saal): SABSE LAMBA — love, marriage, arts, luxury, vehicles, dhan-luxury. Sambandh aur comfort ka 20-saal; balance rakhna warna shirngar > substance. Best: arts practice, respectful partnerships, white daan Friday.',
  Shani: 'Shani MD (19 saal): karma-servant — delay par permanent. Structure banta hai: career-year by year bricks. Respect/service to workers elders — shani soft ho jata. Best: patience, routine, Saturday service.',
  Rahu: 'Rahu MD (18 saal): ambition-iluusion — unconventional rise, foreign, media, tech wow-factor; par fake shortcuts se bachna. Best: discernment practice, meditation, nariyal remedy tradition.',
  Ketu: 'Ketu MD (7 saal): detachment-moksha — spiritual push, sudden shifts, research/occult talent; material bas clarity kam lagti. Best: meditation, Ganesh mantra, letting-go skills.',
}

// ---------- Gochara house effects (Jupiter & Saturn) ----------
export const JUPITER_TRANSIT = {
  1: 'Guru 1st from Moon: self-growth, confidence, naye opportunities — good for starts.',
  2: 'Guru 2nd: dhan, family-sukh, speech-sweetness — saving/income growth phase.',
  3: 'Guru 3rd: courage-courses — skills seekhna, siblings support, writing.',
  4: 'Guru 4th: mixed — ghar/mother pe focus, peace kam-khaarch zyada.',
  5: 'Guru 5th: EXCELLENT — education, children, romance, creativity/purva-punya open.',
  6: 'Guru 6th: work-health — seva spirit, enemies jeeto par routine strict.',
  7: 'Guru 7th: SHUBH — marriage/partnership yog active, business growth.',
  8: 'Guru 8th: research-transformation, sudden gains maybe, health dhyan.',
  9: 'Guru 9th: BEST — luck open, travel, dharma-karya, blessings of elders.',
  10: 'Guru 10th: career-support, boss favor, public work — stress bhi.',
  11: 'Guru 11th: GAINS — income, network, dreams-fulfillment phase.',
  12: 'Guru 12th: kharcha-daan, spiritual travel; expenses control plan banao.',
}
export const SATURN_TRANSIT = {
  1: 'Shani 1st (Sade Sati peak): body-mind discipline test — health/rest priority, ego soft rakho.',
  2: 'Shani 2nd (last phase): money-family speech — budget strict, baat meethee.',
  3: 'Shani 3rd: GOOD — courage, hard-work wins, siblings/colleagues support.',
  4: 'Shani 4th (Dhaiya): home-mother-vehicle — repairs/kharch, peace routine banao.',
  5: 'Shani 5th: mixed — education/children responsibility, romance delay.',
  6: 'Shani 6th: GOOD — enemies/debts/health issues PE jeet, service strong.',
  7: 'Shani 7th: partnerships test — marriage/business patience, contracts careful.',
  8: 'Shani 8th (Dhaiya): patience-research — health watch, joint assets careful, occult interest badhta.',
  9: 'Shani 9th: dharma-test — father/guru issues, travel delays, faith deeper hota.',
  10: 'Shani 10th: workload heavy par reward directed — reputation build hota slowly.',
  11: 'Shani 11th: BEST — gains, networking, long-term goals solidify.',
  12: 'Shani 12th (Sade Sati start): expenses/sleep/foreign — introspection phase, donate.',
}

// ---------- Panchang meanings ----------
export const VARA_RULES = {
  'Ravivar (Sunday)': 'Surya ka din: sarkar-kaam, father-time, health-activity, arghya day.',
  'Somvar (Monday)': 'Chandra-Shiva ka din: Shiva-puja, fasting famous; emotional care, maa-time.',
  'Mangalvar (Tuesday)': 'Mangal-Hanuman ka din: courage-tasks, property-work; Hanuman Chalisa classic.',
  'Budhvar (Wednesday)': 'Budh ka din: study, business-deals, communication, green daan upay.',
  'Guruvar (Thursday)': 'Guru ka din: auspicious starts, teacher-respect, yellow vrat classic.',
  'Shukravar (Friday)': 'Shukra-Lakshmi ka din: luxe-shopping, arts, relationship-time, white daan.',
  'Shanivar (Saturday)': 'Shani-Hanuman ka din: service, oil-diya remedies, no big new starts (traditional).',
}
export const YOGA_GOOD_BAD = {
  Siddhi: 'Siddhi yoga — SARVOTTAM: shubh karya ke liye excellent.',
  Shiva: 'Shiva yoga — auspicious: spiritual & good deeds favorable.',
  Brahma: 'Brahma yoga — creation-friendly: naye shubh kaam starts.',
  Saubhagya: 'Saubhagya yoga — luck-high: celebrate/family works.',
  Shubha: 'Shubha yoga — naam hi kaafi: auspicious business/travel.',
  Ayushman: 'Ayushman yoga — health-positive: long-life karya, treatments.',
  Harshana: 'Harshana yoga — khushi yoga: celebrations, success events.',
  Siddha: 'Siddha yoga — completion-friendly: finish pending works.',
  Vriddhi: 'Vriddhi yoga — growth yoga: investments/expansion starts.',
  Dhruva: 'Dhruva yoga — stability: long-term commitments, property.',
  Shukla: 'Shukla yoga — clean-bright: new starts, studies.',
  Shoola: 'Shoola yoga — tedha: disputes/injuries se bachke raho, routine works only.',
  Ganda: 'Ganda yoga — mixed-careful: conflicts possible, important decisions talo.',
  Vajra: 'Vajra yoga — hard-hitting: tough tasks only, try mat karo new.',
  Vyatipata: 'Vyatipata yoga — careful-day: travel/risks avoid, spiritual works best.',
  Variyan: 'Variyan yoga — good: normal auspicious works fine.',
  Parigha: 'Parigha yoga — obstacle-day: obstacles aa sakti, patience se.',
  Siddhi_OK: '',
  Vyaghata: 'Vyaghata yoga — careful: obstacles, avoid major starts.',
  Atiganda: 'AtiGanda yoga — avoid-start: health/safety careful, japa-karma.',
  Sukarma: 'Sukarma yoga — good-works: productive day for starts.',
  Dhriti: 'Dhriti yoga — steadiness: planning, consistency works.',
  Priti: 'Priti yoga — priti-day: relationships, social works, shubh.',
  Vishkambha: 'Vishkambha yoga — support-day: foundations, long-term works.',
  Vaidhriti: 'Vaidhriti yoga — careful-day: avoid heavy risks, spiritual okay.',
}

// ---------- BaZi ten gods meanings ----------
export const TEN_GODS = {
  'BiJian (Friend)': 'BiJian （比肩）: self-element — independence, stability, self-reliance; partnerships mein equality.',
  'JieCai (Rival)': 'JieCai （劫财）: rival-self — competition, bold moves; money mein sharing-complexities.',
  'ShiShen (Talent)': 'ShiShen （食神）: talent-output — creativity, food/art/joy, smooth expressions.',
  'ShangGuan (Maverick)': 'ShangGuan （伤官）: maverick-output — brilliance with rebellion; rules todna seekhna.',
  'PianCai (Big Wealth)': 'PianCai （偏财）: windfall-wealth — opportunity-money, risk-appetite, generosity.',
  'ZhengCai (Earned Wealth)': 'ZhengCai （正财）: earned-wealth — steady income, practicality, value-for-effort.',
  'QiSha (Pressure)': 'QiSha （七杀）: pressure-authority — challenges se power; discipline zyada zaroori.',
  'ZhengGuan (Authority)': 'ZhengGuan （正官）: proper-authority — structure, reputation, responsible leadership.',
  'PianYin (Unorthodox Mind)': 'PianYin （偏印）: alternative-wisdom — intuition, occult/unusual knowledge, mind-detours.',
  'ZhengYin (Support/Wisdom)': 'ZhengYin （正印）: mother-support — learning, care, blessings from elders.',
}
export const PILLAR_DOMAINS = 'BaZi pillars: Year=ancestors/society/early environment, Month=parents/career-structure/season, Day=SELF (stem) + spouse-palace (branch), Hour=children/ideas/future-output.'

// ---------- Manglik / Kaal Sarp / Pitra / Sade Sati explainer texts ----------
export const PANDIT_TEXTS = {
  manglik: 'Manglik dosha (Mangal 1/2/4/7/8/12th house — North Indian): marriage-delay ya partner-clash ka yog. Cancellations: Mangal swakshetra/uchcha, dono charts manglik (manglik × manglik = neutralized), Guru ki sthiti strong. 30+ age mein prabhav ghatta maana jata hai.',
  kaal_sarp: 'Kaal Sarp yog (saare grah Rahu-Ketu axis ke beech): life mein ek intense pattern — periods of blockages phir sudden release. 12 types; remedies: Rudrabhishek, naag-panchami tradition, Rahu-Ketu shanti.',
  pitra: 'Pitra dosha (Surya/Shani/Rahu se 9th/pitra triggers): purvaj-karm ka sanket — pitra-tarpan, Amavasya shraddh, gayatri-japa yahi tradition mein standard upay.',
  sade1: 'Sade Sati 1st phase (Shani 12th from Moon, ~2.5 saal): expenses/sleep/kharcha pe control — planning & saving ka course.',
  sade2: 'Sade Sati 2nd phase (Shani on Moon, ~2.5 saal): body-mind pressure — health routine, family patience, slow steady movement.',
  sade3: 'Sade Sati 3rd phase (Shani 2nd from Moon, ~2.5 saal): dhan-family-speech — wrap-up karmas, financial rebuild.',
  dhaiya: 'Ardha-ashtama Shani/Dhaiya (~2.5 saal, 4th/8th from Moon): choti chunautiyan — patience, vehicle/home care, no rash risks.',
  grahan_yog: 'Grahan yog (Surya/Chandra + Rahu/Ketu yuti): eclipsed luminary — us area mein identity-clarity issues; guru-mantra + daan tradition.',
}

// ---------- Retrograde meanings ----------
export const RETRO_TEXT = {
  Mangal: 'Mangal vakri: energy andar ki taraf — controlled anger seekhna; engines/surgery-related areas mein special karm.',
  Budh: 'Budh vakri: soch deep-double — communication revisions; writing/editing mein talent zyada.',
  Guru: 'Guru vakri: wisdom internalized — apni khud ki philosophy banate ho; formal teaching se practical gyan zyada.',
  Shukra: 'Shukra vakri: relationships-comfort ka re-evaluation; taste/love unique-mature hota.',
  Shani: 'Shani vakri: karma double-check — responsibilities repeat aati hain jab tak complete na ho; overtime justice strong.',
}

// ============================================================
//  buildFullContext — knowledge.js base + ye sab (smart selection)
// ============================================================
export function buildPanditContext(chart, panditRes, intentLower) {
  const lines = []
  const push = (tradition, topic, text) => { if (text) lines.push(`[${tradition} · ${topic}] ${text}`) }

  // Lagna & moon style
  push('Vedic', 'lagna_personality', LAGNA_PERSONALITY[chart.vedic.lagna])
  push('Vedic', 'chandra_style', MOON_STYLE[chart.vedic.chandra_rashi])
  const nakKey = chart.vedic.nakshatra.replace(/ \(pada .*/, '')
  const nk = NAK_META[nakKey]
  if (nk) push('Vedic', 'nakshatra_deep', `${nakKey}: deity ${nk.deity}, symbol ${nk.symbol}, nature: ${nk.nature}, gana ${nk.gana}.`)

  // Yogas found
  for (const y of (panditRes?.yogas || [])) push('Vedic', `yoga:${y.name}`, y.text)

  // Pandit checks
  if (panditRes) {
    if (panditRes.manglik?.manglik) push('Vedic', 'manglik', `${PANDIT_TEXTS.manglik} Status: ${panditRes.manglik.level} pravratti, Mangal ${panditRes.manglik.house}th mein. ${(panditRes.manglik.cancels || []).join('. ')}`)
    else push('Vedic', 'manglik', 'Manglik dosha nahi — Mangal safe house mein.')
    if (panditRes.kaal_sarp?.present) push('Vedic', 'kaal_sarp', `${PANDIT_TEXTS.kaal_sarp} Type: ${panditRes.kaal_sarp.type}.`)
    if (panditRes.pitra_dosha?.present) push('Vedic', 'pitra', `${PANDIT_TEXTS.pitra} Triggers: ${panditRes.pitra_dosha.triggers.join('; ')}`)
    if (panditRes.gochara?.sade_sati) {
      const ph = (panditRes.gochara.sade_sati.phase || '').slice(0, 3)
      const extra = ph === '1st' ? PANDIT_TEXTS.sade1 : ph === '2nd' ? PANDIT_TEXTS.sade2 : ph === '3rd' ? PANDIT_TEXTS.sade3 : ''
      push('Vedic', 'sade_sati', `${panditRes.gochara.sade_sati.text} ${extra}`)
    }
    if (panditRes.gochara?.dhaiya) push('Vedic', 'dhaiya', panditRes.gochara.dhaiya.text)
    // Transit house effects
    const g = panditRes.gochara
    if (g?.guru_gochar) push('Gochara', 'guru', JUPITER_TRANSIT[g.guru_gochar.house_from_moon])
    if (g?.shani_gochar) push('Gochara', 'shani', SATURN_TRANSIT[g.shani_gochar.house_from_moon])
  }

  // Dasha extended
  const mdLord = chart.dasha?.current_mahadasha?.lord
  if (mdLord && DASHA_EXTENDED[chart.dasha.current_mahadasha.lord]) push('Vedic', 'dasha_deep', DASHA_EXTENDED[chart.dasha.current_mahadasha.lord])
  if (mdLord) push('Vedic', 'dasha_deep', DASHA_EXTENDED[mdLord])

  // Remedies + gemstones for weak grhas + current dasha lord
  const weak = panditRes?.weak_grahas || []
  for (const g of [...new Set([...weak, mdLord].filter(Boolean))]) {
    if (GEMSTONES[g]) push('Upay', `gemstone:${g}`, `Ratna: ${GEMSTONES[g].stone}, dhaatu ${GEMSTONES[g].metal}, ${GEMSTONES[g].day}, ungli ${GEMSTONES[g].finger}. ${GEMSTONES[g].note}.`)
    if (REMEDIES[g]) push('Upay', `upay:${g}`, `Classical upay ${g} ke liye: ${REMEDIES[g].slice(0, 4).join('; ')}.`)
  }
  if (panditRes?.lucky) push('Vedic', 'lucky', `Lucky din: ${panditRes.lucky.day}, rang ${panditRes.lucky.color}, ank ${panditRes.lucky.number} (chandra rashi ke hisaab se).`)

  // Retro grahas
  for (const gr of chart.vedic.graha_table.filter((x) => x.retrograde && RETRO_TEXT[x.graha])) {
    push('Vedic', `vakri:${gr.graha}`, RETRO_TEXT[gr.graha])
  }
  return lines.join('\n')
}

// BaZi context lines
export function buildBaziContext(bazi) {
  const lines = [push2('Chinese', 'pillars_domains', PILLAR_DOMAINS)]
  function push2(tr, tp, tx) { return `[${tr} · ${tp}] ${tx}` }
  for (const p of bazi.pillars) {
    lines.push(push2('Chinese', `pillar:${p.name}`, `${p.name}: ${p.label} — ${p.elements}; Day Master se rishta: stem ${p.ten_god_stem}, branch ${p.ten_god_branch}.`))
  }
  lines.push(push2('Chinese', 'day_master', `Day Master: ${bazi.day_master}; strongest element ${bazi.strongest}, weakest ${bazi.weakest} — weakest ko balance karne ke liye supportive colors/directions/diet tradition.`))
  for (const p of bazi.pillars) {
    if (TEN_GODS[p.ten_god_stem]) lines.push(push2('Chinese', `tengod`, TEN_GODS[p.ten_god_stem]))
  }
  return [...new Set(lines)].join('\n')
}
