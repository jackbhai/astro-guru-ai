# Astro-Guru — Hinglish Astronomy + Jyotish AI

100% free, on-device AI chatbot. Koi server nahi, koi API key nahi, koi paisa nahi.
AI model tumhare browser ke andar chalta hai (WebLLM + WebGPU) — **koi canned answers nahi, AI khud jawab banata hai.**

## Features

**Astronomy Chat**
- Space ke koi bhi sawaal pucho — poori duniya ki astronomy (Bharat, Greek, Arab, China, Mayan, Egypt sab)
- Jawab AI khud generate karta hai, Hinglish mein

**Kundali & Prediction**
- DOB + birth time + city → REAL planetary calculations:
  - Vedic (Bharat): lagna, chandra rashi, nakshatra, tithi, graha sthiti (Lahiri ayanamsa)
  - Vimshottari Mahadasha + Antardasha — dates ke saath
  - Western: sun/moon/rising sign
  - Chinese zodiac: animal + element + yin-yang
  - Egyptian zodiac + Numerology life path
- AI saari traditions combine karke personalized Hinglish reading deta hai
- Aaj ke transits ke hisaab se daily prediction

**Privacy**: Saara data device pe hi rehta hai. Chart calculation bhi local, AI bhi local.

## Tech (yehi "trick" hai jo AI use karta hai)

1. **Real math se chart** (ephemeris — planetary positions, verified on eclipse dates)
2. **Transformer LLM** (WebLLM — wahi ChatGPT-family technology, browser mein)
3. **System prompt engineering** — model ko jyotishi/astronomer role milta hai
4. Chart data + aaj ke transits prompt mein milte hain → AI usi pe base karke jawab sochta hai

## Deploy karo (FREE GitHub Pages)

1. GitHub pe naya repo banao (jaise `astro-guru`)
2. Ye folder push karo:
   ```bash
   git init
   git add .
   git commit -m "Astro-Guru v1"
   git branch -M main
   git remote add origin https://github.com/TUMHARA-USERNAME/astro-guru.git
   git push -u origin main
   ```
3. Repo → **Settings → Pages → Source: GitHub Actions** select karo
4. Push ke baad workflow khud build + deploy karega
5. Site milegi: `https://TUMHARA-USERNAME.github.io/astro-guru/`

(Repo ka naam agar `TUMHARA-USERNAME.github.io` hai to site root pe chalegi — workflow base path khud handle kar leta hai.)

## Local chalana

```bash
npm install
npm run dev
```

## Requirements

- Chrome / Edge (latest) — WebGPU zaroori hai AI mode ke liye
- Android: naya Chrome (achhe phones pe WebGPU on hai)
- Pehli baar model download hoga ek baar (0.4–1.8 GB, model ke hisaab se) — phir browser cache se, offline bhi chalega
- Kundali calculations bina AI ke bhi chalti hain

## Honest note

- Planetary calculations real aur verified hain (eclipse dates pe test kiye gaye)
- Predictions jyotish/astrology parampara ka interpretation hain — scientifically proven nahi. Guidance aur fun ke liye use karo, bade life decisions sirf iske base pe mat lo.
- Chhote AI models (1.5B) kabhi-kabhi galti kar sakte hain — facts double-check karna.

## File map

```
src/
  App.jsx              — main UI (2 tabs: Chat + Kundali)
  ai/webllm.js         — model loader + AI ke prompts (jyotishi/astronomer roles)
  astro/ephemeris.js   — REAL chart math: Vedic, Western, Chinese, Egyptian, Dasha, Numerology
  components/icons.jsx — custom SVG icons (koi emoji nahi)
  styles.css           — AMOLED black + violet-blue witch theme
.github/workflows/     — auto-deploy to GitHub Pages
```
