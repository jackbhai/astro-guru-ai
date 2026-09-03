// ============================================================
//  KNOWLEDGE ENGINE (browser-lite RAG — document ke Phase 2/3)
//  Ye reference texts AI ko "grounding" dete hain — user ko
//  kabhi raw nahi dikhte. AI inhe padh ke APNA jawab khud likhta hai.
//
//  Har entry ke saath metadata hai (doc ke hisaab se):
//  { tradition, system, topic, key, text }
// ============================================================

// ---------- VEDIC: Rashis ----------
const RASHI_MEANING = {
  Mesha: 'Mesha (Agni, Mangal ruled): starter energy, courage, leadership, jaldi-baazi aur initiative ka rashi. Sar/body ka upper part joda jata hai.',
  Vrishabha: 'Vrishabha (Prithvi, Shukra ruled): stability, dhan, family, khana-saundarya, patience aur attachment ka rashi.',
  Mithuna: 'Mithuna (Vayu, Budh ruled): communication, curiosity, adaptability, dual interests, writing-speech ka rashi.',
  Karka: 'Karka (Jal, Chandra ruled): emotions, ghar-mother, care, memory aur nurturing ka rashi. Sensitive par protective.',
  Simha: 'Simha (Agni, Surya ruled): raja jaisa dignity, creativity, pride, leadership aur recognition ki ichha.',
  Kanya: 'Kanya (Prithvi, Budh ruled): analysis, service, health, perfectionism, detail ka rashi. Practical problem solver.',
  Tula: 'Tula (Vayu, Shukra ruled): balance, partnership, justice, arts aur negotiation ka rashi. Harmony-first.',
  Vrishchika: 'Vrishchika (Jal, Mangal ruled): intensity, research, secrets, transformation aur deep emotional power.',
  Dhanu: 'Dhanu (Agni, Guru ruled): philosophy, travel, higher learning, optimism aur truth-seeking ka rashi.',
  Makara: 'Makara (Prithvi, Shani ruled): discipline, karma, career, patience aur long-term structure ka rashi.',
  Kumbha: 'Kumbha (Vayu, Shani ruled): innovation, society, network, humanitarian thinking aur unconventional views.',
  Meena: 'Meena (Jal, Guru ruled): intuition, compassion, imagination, spirituality aur letting-go ka rashi.',
}

// ---------- VEDIC: Grahas essence ----------
const GRAHA_MEANING = {
  Surya: 'Surya = atma, ego, father, authority, sarkar, vitality, recognition. Surya jahan ho, wahan shine chahiye hoti hai.',
  Chandra: 'Chandra = mann, emotions, mother, comfort, public, daily rhythm. Chandra se mental peace aur emotional pattern padha jata hai.',
  Mangal: 'Mangal = energy, courage, action, siblings, property, competition. Mangal jahan ho, wahan drive aur kabhi-kabhi conflict.',
  Budh: 'Budh = buddhi, communication, analysis, business, humor, adaptability. Budh se sochne-samajhne aur bolne ka style.',
  Guru: 'Guru = wisdom, dharma, expansion, blessings, children, guru-figures, wealth growth. Guru jahan ho, wahan growth aur protection.',
  Shukra: 'Shukra = love, attraction, luxury, arts, comforts, vehicles, spouse (especially male chart mein wife). Saundarya aur sambandh.',
  Shani: 'Shani = karma, discipline, delay, effort, service, longevity, structure. Shani slow deta hai par permanent deta hai.',
}

// ---------- VEDIC: Bhavas (houses) ----------
const HOUSE_MEANING = {
  1: '1st house (Lagna/Tanu): personality, body, self-image, life direction — kundali ka foundation.',
  2: '2nd house (Dhana): accumulated wealth, family values, speech, food, face — security zone.',
  3: '3rd house (Sahaj): courage, effort, siblings, skills, short travel, initiative.',
  4: '4th house (Sukha): home, mother, inner peace, vehicles, property, education base.',
  5: '5th house (Putra): intelligence, education, children, romance, creativity, purva-punya.',
  6: '6th house (Ari): enemies, debts, diseases, service, daily work, competition — struggle se strength banta.',
  7: '7th house (Yuvati/Kalatra): marriage, spouse, partnerships, contracts, public dealings.',
  8: '8th house (Randhra): longevity, joint assets, in-laws, research, secrets, sudden change, transformation.',
  9: '9th house (Dharma/Bhagya): luck, dharma, father, guru, higher knowledge, long journeys, blessings.',
  10: '10th house (Karma): career, status, authority, public image — life ka sabse visible karma kshetra.',
  11: '11th house (Labha): gains, income, network, friends, ambitions, achievements.',
  12: '12th house (Vyaya): expenses, losses, foreign lands, isolation, moksha, subconscious, hidden enemies.',
}

// ---------- VEDIC: Nakshatras (short) ----------
const NAKSHATRA_MEANING = {
  Ashwini: 'Ashwini (Ketu): speed, healing, quick action — cheezein jaldi shuru karne ki shakti.',
  Bharani: 'Bharani (Shukra): creation aur uthane ki shakti — discipline, responsibility, intense transformation.',
  Krittika: 'Krittika (Surya): agni jaisi purification — sharp, cutting clarity, leadership with warmth.',
  Rohini: 'Rohini (Chandra): beauty, growth, attraction — creative aur nurturing, comfort-loving.',
  Mrigashira: 'Mrigashira (Mangal): searching energy — curious, gentle, explorer mind.',
  Ardra: 'Ardra (Rahu): toofan ke baad clarity — deep thinking, intense emotions, breakthroughs.',
  Punarvasu: 'Punarvasu (Guru): return & renewal — optimism, dobara uthne ki shakti, philosophy.',
  Pushya: 'Pushya (Shani): nourishment ka king nakshatra — duty, care, tradition, steady growth.',
  Ashlesha: 'Ashlesha (Budh): serpent wisdom — psychology, strategy, hidden depths, intuition.',
  Magha: 'Magha (Ketu): ancestors ka throne — dignity, legacy, authority, parampara.',
  'Purva Phalguni': 'Purva Phalguni (Shukra): pleasure, romance, relaxation — creative enjoyment.',
  'Uttara Phalguni': 'Uttara Phalguni (Surya): duty through partnerships — contracts, loyal service.',
  Hasta: 'Hasta (Chandra): haath ka skill — craft, healing, smart handling of life.',
  Chitra: 'Chitra (Mangal): architect of beauty — design, charisma, structure with style.',
  Swati: 'Swati (Rahu): independent wind — flexibility, business sense, freedom.',
  Vishakha: 'Vishakha (Guru): goal arch — single-pointed ambition, milestone chasing.',
  Anuradha: 'Anuradha (Shani): devoted friendship — discipline with heart, long-term sambandh.',
  Jyeshtha: 'Jyeshtha (Budh): seniority & responsibility — protective leadership, sharp mind.',
  Mula: 'Mula (Ketu): roots tak jaana — destruction se renewal, research, truth digging.',
  'Purva Ashadha': 'Purva Ashadha (Shukra): undefeated water — willpower, purification, victory.',
  'Uttara Ashadha': 'Uttara Ashadha (Surya): lasting victory — dharma ke saath achievement.',
  Shravana: 'Shravana (Chandra): listening & learning — knowledge, reputation, careful steps.',
  Dhanishta: 'Dhanishta (Mangal): wealth aur rhythm — music, groups, prosperity in teams.',
  Shatabhisha: 'Shatabhisha (Rahu): 100 healers — healing, secrets, science-occult, veiling.',
  'Purva Bhadrapada': 'Purva Bhadrapada (Guru): intense idealism — spiritual fire, two-faced depth.',
  'Uttara Bhadrapada': 'Uttara Bhadrapada (Shani): deep calm — tapasya, wisdom below surface.',
  Revati: 'Revati (Budh): completion & care — travel, compassion, safe endings.',
}

// ---------- VEDIC: Dasha lords ----------
const DASHA_MEANING = {
  Ketu: 'Ketu Mahadasha: spirituality, detachment, sudden events, purane karmic patterns clear hotay hain — confusion se clarity ki journey.',
  Shukra: 'Shukra Mahadasha: love-marriage, luxuries, arts, vehicles, dhan-luxury rise — sambandh aur comforts ka period.',
  Surya: 'Surya Mahadasha: authority, sarkar, father, status aur ego tests — recognition ka samay, responsibility ke saath.',
  Chandra: 'Chandra Mahadasha: emotions, mother, ghar, public image aur mental peace pe focus — sensitivity badhti hai.',
  Mangal: 'Mangal Mahadasha: action, property, vehicles, competition — energy high, conflicts ko channel karna seekhna.',
  Rahu: 'Rahu Mahadasha: ambition, foreign links, unconventional rise — illusion se bachke, smart risk le kar uplevel.',
  Guru: 'Guru Mahadasha: growth, education, children, grace — sabse blessed periods mein se ek, wisdom expand hoti hai.',
  Shani: 'Shani Mahadasha: hard work, delays, discipline, service — slow par solid, long-term rewards ka builder period.',
  Budh: 'Budh Mahadasha: business, learning, communication, trade, writing — intellect ka peak use period.',
}

// ---------- VEDIC: Dignity ----------
const DIGNITY_MEANING = {
  uchcha: 'Uchcha graha apni peak strength pe hota hai — us graha ke areas mein natural mastery aur asaan results.',
  neecha: 'Neecha graha ke areas mein struggle aata hai, par ye depth aur hidden talent bhi deta hai — neecha-bhanga kyog ho to struggle strength ban jata hai.',
  swakshetra: 'Swakshetra graha apne ghar jaisa — stable, reliable, apna kaam bina drame ke karta hai.',
}

// ---------- VEDIC: Drishti ----------
const DRISHTI_MEANING =
  'Vedic drishti: ek graha jin houses pe drishti dalta hai, un life-areas pe uska direct energy-influence aata hai — jahan ho usse bhi important kabhi-kabhi. Sabhi graha neeche 7th house pe dekhte hain; Mangal (4/8), Guru (5/9), Shani (3/10) extra dekhte hain.'

// ---------- WESTERN: Aspects ----------
const ASPECT_MEANING = {
  Conjunction: 'Conjunction: dono planets ki energies merge — theme combine ho jati hai, intense focus.',
  Sextile: 'Sextile: supportive door — effort ke saath opportunity khulti hai.',
  Square: 'Square: tension angle — friction, par yehi growth engine banta hai.',
  Trine: 'Trine: harmony — natural talent aur asaan flow in related areas.',
  Opposition: 'Opposition: do ends — balance seekhna, partnership ya pull-push dynamic.',
}

// ---------- CHINESE ----------
const CHINESE_MEANING = {
  'Rat (Chuha)': 'Rat: smart, resourceful, quick-witted — opportunities jaldi pakadte hain.',
  'Ox (Bail)': 'Ox: steady, reliable, hard-working — patience se bada kaam.',
  'Tiger (Sher)': 'Tiger: brave, competitive, unpredictable — leader instinct.',
  'Rabbit (Khargosh)': 'Rabbit: gentle, elegant, cautious — diplomacy aur luck.',
  Dragon: 'Dragon: power, luck, ambition — sabse auspicious sign, born leader.',
  'Snake (Saamp)': 'Snake: wise, intuitive, private — deep thinker, strategist.',
  'Horse (Ghoda)': 'Horse: energetic, independent, warm — freedom lover.',
  'Goat (Bakra)': 'Goat: calm, creative, gentle — art aur harmony.',
  'Monkey (Bandar)': 'Monkey: clever, playful, versatile — problem-solver.',
  'Rooster (Murga)': 'Rooster: observant, honest, hard-working — precision aur pride.',
  'Dog (Kutta)': 'Dog: loyal, just, protective — fairness sabse pehle.',
  'Pig (Suar)': 'Pig: generous, sincere, pleasure-loving — dil ke saaf.',
  'Wood (Lakdi)': 'Wood element: growth, creativity, expansion, flexibility.',
  'Fire (Aag)': 'Fire element: passion, energy, leadership, dynamism.',
  'Earth (Mitti)': 'Earth element: stability, practicality, nourishment, reliability.',
  'Metal (Dhaatu)': 'Metal element: strength, determination, persistence, structure.',
  'Water (Paani)': 'Water element: wisdom, adaptability, intuition, flow.',
}

// ---------- EGYPTIAN ----------
const EGYPTIAN_MEANING = {
  'The Nile (Neel Nadi)': 'Nile sign: life-giving flow — practical, nurturing, renewal-oriented.',
  'Amon-Ra (Surya Dev)': 'Amon-Ra: leadership aur creation — powerful presence, protective.',
  'Mut (Mata)': 'Mut: mother energy — care, patience, quiet strength.',
  'Geb (Prithvi Dev)': 'Geb: earth energy — grounded, dependable, growth-oriented.',
  Osiris: 'Osiris: death-rebirth — regeneration, justice, deep purpose.',
  Isis: 'Isis: magic aur devotion — protective, resourceful, emotional depth.',
  'Thoth (Gyaan Dev)': 'Thoth: wisdom-energy — learning, writing, cleverness.',
  'Horus (Aasman Raja)': 'Horus: sky-king — vision, courage, defending goals.',
  Anubis: 'Anubis: guardian — depth, loyalty, guiding through change.',
  Seth: 'Seth: storm energy — disruption se change, unpredictable power.',
  Bastet: 'Bastet: cat goddess — charm, protection, balance of soft-fierce.',
  'Sekhmet (Yoddha Devi)': 'Sekhmet: warrior healer — fierce energy + healing power.',
}

// ---------- NUMEROLOGY ----------
const LIFEPATH_MEANING = {
  1: 'Life Path 1: leader — independence, pioneering, ambition.',
  2: 'Life Path 2: diplomat — partnership, sensitivity, balance.',
  3: 'Life Path 3: creative — expression, joy, communication.',
  4: 'Life Path 4: builder — discipline, work, solid foundations.',
  5: 'Life Path 5: freedom — adventure, change, versatility.',
  6: 'Life Path 6: nurturer — responsibility, family, harmony.',
  7: 'Life Path 7: seeker — analysis, spirituality, deep study.',
  8: 'Life Path 8: achiever — power, money, management.',
  9: 'Life Path 9: humanitarian — compassion, completion, giving.',
  11: 'Life Path 11 (Master): intuition — inspirational, sensitive channel.',
  22: 'Life Path 22 (Master): master builder — bade sapne ko reality banana.',
  33: 'Life Path 33 (Master): teacher-healer — seva aur uplifting others.',
}

// ---------- Intent → extra houses (focus retrieval) ----------
const INTENT_HOUSES = {
  marriage: [7, 2, 8],
  love: [5, 7],
  career: [10, 6, 11],
  finance: [2, 11, 9],
  health: [1, 6],
  children: [5, 9],
  travel: [12, 9, 3],
}

// ============================================================
//  RETRIEVAL — is chart ke liye relevant snippets select karo
//  (document ka "intent + entity extraction → retrieval" step)
// ============================================================
export function buildKnowledgeContext(chart, ruleLayer, intent = 'general') {
  const lines = []
  const push = (tradition, topic, text) => {
    if (text) lines.push(`[${tradition} · ${topic}] ${text}`)
  }

  // Core entities
  if (RASHI_MEANING[chart.vedic.lagna]) push('Vedic', `lagna:${chart.vedic.lagna}`, RASHI_MEANING[chart.vedic.lagna])
  push('Vedic', `chandra_rashi:${chart.vedic.chandra_rashi}`, RASHI_MEANING[chart.vedic.chandra_rashi])
  push('Vedic', `surya_rashi:${chart.vedic.surya_rashi}`, RASHI_MEANING[chart.vedic.surya_rashi])

  const nakKey = chart.vedic.nakshatra.replace(/ \(pada .*/, '')
  push('Vedic', `nakshatra:${nakKey}`, NAKSHATRA_MEANING[nakKey])

  // Planets x houses
  for (const p of ruleLayer.planet_rules) {
    push('Vedic', `graha:${p.graha}`, GRAHA_MEANING[p.graha])
    push('Vedic', `house:${p.house}`, HOUSE_MEANING[p.house])
    if (p.dignity.startsWith('Uchcha')) push('Vedic', 'dignity', `${p.graha} ${DIGNITY_MEANING.uchcha}`)
    if (p.dignity.startsWith('Neecha')) push('Vedic', 'dignity', `${p.graha} ${DIGNITY_MEANING.neecha}`)
    if (p.dignity.startsWith('Swakshetra')) push('Vedic', 'dignity', `${p.graha} ${DIGNITY_MEANING.swakshetra}`)
  }

  // Drishti
  push('Vedic', 'drishti', DRISHTI_MEANING)

  // Western aspects — sirf jo actually chart mein mile
  const foundTypes = new Set(ruleLayer.western_major_aspects.map((a) => a.aspect.split(' ')[0]))
  for (const t of foundTypes) push('Western', `aspect:${t}`, ASPECT_MEANING[t])

  // Dasha
  if (ruleLayer.dasha_rule_facts.current) push('Vedic', 'dasha', DASHA_MEANING[ruleLayer.dasha_rule_facts.current.lord])
  if (ruleLayer.dasha_rule_facts.current_antar) push('Vedic', 'dasha_antar', DASHA_MEANING[ruleLayer.dasha_rule_facts.current_antar.lord])

  // World traditions
  push('Chinese', 'zodiac', CHINESE_MEANING[chart.chinese.animal])
  push('Chinese', 'element', CHINESE_MEANING[chart.chinese.element.split(' (')[0]] || CHINESE_MEANING[chart.chinese.element])
  push('Egyptian', 'sign', EGYPTIAN_MEANING[chart.egyptian])
  push('Numerology', 'life_path', LIFEPATH_MEANING[chart.numerology.life_path])

  // Intent-based extra house focus
  const intentLower = (intent || '').toLowerCase()
  for (const [key, houses] of Object.entries(INTENT_HOUSES)) {
    if (intentLower.includes(key)) {
      for (const h of houses) push('Vedic', `intent_house:${h}`, HOUSE_MEANING[h])
    }
  }

  // Dedupe (house texts repeat ho sakti hain)
  return [...new Set(lines)].join('\n')
}
