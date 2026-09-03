# Astro-Guru — Architecture Roadmap

Tumhare document ke architecture ko humare 100% free, browser-only setup pe mapping.
Core principle dono ka same: **"LLM should not be the calculator."**

## Document → App (kya already ban gaya)

| Document ka component | App mein status |
|---|---|
| Calculation Engine (deterministic) | `src/astro/ephemeris.js` — eclipse & 1947 chart pe verified |
| Astrology Rule Engine | `src/astro/rules.js` — rashi lords, dignity (uchcha/neecha), vedic drishti, western aspects, dasha facts |
| Reasoning LLM | WebLLM (browser mein transformer model) — sirf interpretation, calculation nahi |
| Multi-system (Vedic/Western/Chinese/Egyptian/Numerology) | `ephemeris.js` — sab compute hota hai |
| Knowledge / RAG engine (metadata: tradition, topic, key, text) | `src/astro/knowledge.js` — ~150 classical interpretations; intent + chart-entity se selective retrieval (~30 relevant snippets per reading). AI ko grounding deta hai, jawab AI khud likhta hai |
| Intent detection | `rules.js → detectIntent()` — sawaal se focus topic nikalta hai |
| Structured prediction output | Prediction / Aadhaar / Time period / Confidence / Alternative + caveat (prompt mein) |
| Astronomy vs Astrology separation | Do alag tabs: Astronomy Chat vs Kundali & Prediction |
| Tradition mixing warning | Prompt rule 3 — har point pe tradition attribute karna zaroori |
| Predictions ≠ guaranteed science | Prompt rule 8 + footer disclaimer |

## Document ke server-components (Phase 2+, jab server chahiye ho)

Document mein diye stack (FastAPI/PostgreSQL/Qdrant/Neo4j/Redis/S3) ke free options:

- **PostgreSQL + pgvector** → Supabase ya Neon (free tier)
- **Vector/RAG knowledge base** → pehle LanceDB/Qdrant local, scale pe Qdrant Cloud free
- **Knowledge Graph** → Neo4j Aura (free tier) ya pehle sirf JSON rules
- **Backend** → FastAPI on Render/Railway free tier
- **Saved charts / users / history** → Supabase Auth + Postgres

Ye tab jab: users ke savedcharts chahiye, badi knowledge corpus ho, ya server-side heavy LLM chahiye.

## Agla kadam (browser mein hi, free)

1. Navamsha (D9) chart — vedic depth ke liye
2. Do-logo ki kundali matching (ashtakoota) — relationship analysis
3. Aaj-mahine ke transits vs natal chart overlay
4. PWA install + fully offline
5. Fine-tuning (Phase 7 jaisa) — Hinglish style ke liye Colab pe LoRA, phir MLC format mein convert karke HuggingFace se serve

## RAG wala point — ek clarification

Document "RAG/knowledge engine" recommend karta hai. Tumne pehle bola "pre-made answers nahi chahiye".
Dono alag cheezein hain:

- Canned answers = user ko seedha ready jawab dikhana (YE HUMNE NAHI KIYA)
- RAG grounding = LLM ko reference material dena taaki wo khud fresh jawab LIKHE (user ko raw material nahi dikhta)

Document ka matlab dusra wala hai. Ye Phase-wise add kar sakte hain — tab bhi AI har jawab khud hi likhega.
