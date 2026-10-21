# The Prescription You Cannot Read: Project Documentation (v3, PWA Edition + Salt Match)

**Tagline:** Make the cost of medicine visible before it is paid.
**Track:** Pharmacy Retail (Problem #3)
**Platform:** Progressive Web App (installable, offline-first, one codebase for phone and web)

> Items marked **[Decide]** are choices your team should confirm against what you actually built.

---

## 1. Overview

A patient is handed a prescription full of brand names and pays whatever the chemist says. For many of those drugs an identical generic exists at a fraction of the price: same molecule, same strength, different name on the box. Jan Aushadhi Kendras stock these generics and publish their prices openly.

This app lets anyone type (or photograph) a brand name and instantly see the generic equivalent, the evidence that it is equivalent, and the saving, in a fast, installable app that works on any phone or computer, even with a weak connection.

**Headline output:** `₹240 → ₹28`

## 2. Problem Statement

| Aspect | Detail |
|---|---|
| Who is affected | Patients, especially those least able to absorb extra cost |
| Pain point | Brand-name prescriptions are paid for without price visibility |
| Root cause | The patient cannot read the molecule, strength or alternatives |
| Constraint | Users are often on low-end phones, small screens and unreliable networks |

## 3. Goals and Non-Goals

**Goals**
- Brand or molecule in, generic name, strength and price comparison out.
- Saving is the visual headline.
- Tolerate misspellings, missing strengths and half-read words.
- Always show a clear disclaimer.
- Work equally well on a phone, a tablet and a desktop browser.
- Be installable and usable offline.
- **Salt Match:** say or type a medicine name plus its strength or volume (e.g. `Dolo 650`, `Benadryl 100 ml`); the app detects the salt composition and lists the cheapest Jan Aushadhi generics with the identical composition.

**Non-Goals**
- Medical advice or substitution decisions (always "confirm with your doctor or pharmacist").
- Language-model-generated drug information.
- Covering the whole market; a curated, accurate subset is preferred.

---

## 4. Features

### 4.1 Core (MVP, build first)
1. Search by brand or molecule.
2. Result card with generic name, strength, form, brand price, generic price, saving.
3. Fuzzy matching for messy input.
4. Always-visible disclaimer.
5. Honest "not found" state.
6. **Salt Match:** name + strength/ml in, detected composition and cheapest identical generic out (section 4A.7).

### 4.2 What makes this stand out: Decode → Check → Act
Most entries will be a search box that returns a cheaper name. This project follows the patient's real journey at the counter, in three steps, and each step has a feature almost nobody else will build. Details are in section 4A.

| Step | Signature feature | One-line description |
|---|---|---|
| **Decode** | Blank-Fill Decoder | Type the letters you can read, put `?` for the ones you can't (`D?lo 6?0`); matching is tuned to how doctors' handwriting actually gets misread |
| **Decode** | Say-it & Hindi-script search | Speak the name or type it in Devanagari (डोलो); sound-alike matching finds it |
| **Check** | Counter Mode | Type the price the chemist quoted and get an instant, polite verdict against the generic price and the NPPA ceiling |
| **Check** | **Salt Match (name + mg/ml → composition → cheapest generic)** | Say or type `Augmentin 625` or `Benadryl 100 ml`; the app reads off the salts and strengths from the dataset and ranks every generic with the same composition by per-unit price, cheapest first |
| **Check** | Price Ladder | Every brand of the same molecule ranked by price, with the generic at the bottom and your brand marked |
| **Check** | Equivalence Proof | Checklist showing molecule, strength, form and pack match; only **Exact** shows a headline saving |
| **Act** | Counter Card | Printable, bilingual card to hand across the counter, so the patient never has to argue |
| **Act** | Rupee Receipt | A shareable image of what the patient saved ("₹212 saved on this prescription") |
| Supporting | Per-unit pricing, yearly projection | Fair like-for-like comparison and long-term saving |

### 4.3 Stretch
- Photograph a printed strip or box and read the name (printed text only).
- Whole prescription at once with a total saving.
- Nearest Jan Aushadhi Kendra.
- Pill identifier by imprint.

---

## 4A. Standout Features in Detail

### 4A.1 Blank-Fill Decoder (handwriting-aware search)
**The insight:** the brief says nobody types a drug name correctly the first time, and users hold "a half-read word off a prescription." Ordinary fuzzy search treats every typo as equally likely. Handwriting errors are not random: some letters are misread for others far more often.

**How it works**
- **Wildcard input:** `?` stands for one unreadable letter and `*` for several. `D?lo 6?0` matches *Dolo 650*.
- **Handwriting-weighted edit distance:** substituting a commonly confused pair costs less than an unrelated substitution. Starter confusion groups **[tune with real examples]**:
  - `a / o / e`, `u / n / v`, `c / e / o`, `l / t / i / 1`, `rn / m`, `cl / d`, `h / b / k`, `g / q / 9`, `0 / 6 / 8`, `5 / 6`
- **Candidate chips:** show the top few matches as tappable chips, each with the letters that differ highlighted, so the user can compare with the paper in their hand.
- **Narrowing aids:** optional "starts with", "ends with" and "number of letters" fields when the user only remembers the shape of the word.

**Why it stands out:** it targets the exact failure mode in the problem statement and can be measured (see 4A.6).

### 4A.2 Say-it and Hindi-script search
Users often hear the name from the doctor or chemist but cannot spell it, and many think in Hindi script.
- **Devanagari input:** transliterate to Latin before matching (डोलो → *dolo*). Keep a small alias table (`aliases[]`) for common brands written in Hindi.
- **Sound-alike matching:** a phonetic key adapted for drug names (so *Kalpol* and *Calpol* meet) combined with the weighted edit distance above.
- **Voice input (optional):** Web Speech API where the browser supports it. Always show the recognised text and let the user correct it before searching.
- **Privacy note:** in some browsers, speech recognition is processed by the browser vendor's servers. Voice is therefore **off by default**, started by an explicit mic tap, with a one-line notice. Typing and Blank-Fill stay fully on-device.

### 4A.3 Counter Mode (the "before it is paid" feature)
The brief's goal is to make cost visible **before it is paid**. Counter Mode is built for the exact moment of payment: one hand, standing at the counter, 10 seconds.

1. User searches the medicine (or opens a recent one).
2. Taps **"Chemist quoted…"** and types the price they were told.
3. The app shows a plain-language verdict, never an accusation:

| Situation | Verdict shown |
|---|---|
| Quote is at or below the generic price | "Matches the generic price range." |
| Quote is above the generic price, at or below the brand price | "A generic with the same molecule and strength is listed at ₹X. You can ask whether it is available." |
| Quote is above the printed brand price or the NPPA ceiling | "This is above the listed price of ₹X. Check the printed MRP on the pack." |
| No reliable data | "We don't have a price for this. Please check the pack or ask the pharmacist." |

- Large number pad, high-contrast verdict card, sticky "Show counter card" button.
- Wording is always "ask" and "check", never "you are being cheated", because prices and stock vary.
- **Quote history** stays on the device, so a user can compare several quotes for the same prescription.

### 4A.4 Price Ladder
A vertical ladder of every brand sharing the same molecule, strength and form, sorted by unit price, with the Jan Aushadhi generic at the base and the user's brand highlighted.
- Instantly answers "where does my brand sit?" even when no generic exists in the data.
- Shows the spread (cheapest vs most expensive) as a single bar for quick scanning.
- Uses only Exact-equivalence entries, with the same disclaimer.

### 4A.5 Counter Card and Rupee Receipt
- **Counter Card:** one page, English plus Hindi, listing molecule names, generic equivalents, indicative prices, a polite script ("Is a generic with the same molecule and strength available?") and the disclaimer.
- **Rupee Receipt:** a clean shareable image summarising the saving for the prescription (total and per-year), with the data date. It makes the impact visible and gives the app a natural way to spread. It contains no patient name or medical history.

### 4A.6 Proving it works (metrics to show the judges)
Build a **golden test set** of messy inputs and report these numbers on a slide and in the README:

| Metric | What it shows |
|---|---|
| Top-1 / Top-3 accuracy, plain fuzzy vs Blank-Fill Decoder | The handwriting-aware weighting is a measurable improvement |
| Accuracy on Hindi-script and sound-alike inputs | Multilingual and phonetic search works |
| False-confident rate | How often the app is confidently wrong (the key safety number; keep it as low as possible) |
| Time from opening the app to a verdict in Counter Mode | Usable under real counter pressure |

Test inputs should include wildcards (`D?lo 6?0`), swapped and dropped letters, Hindi-script names, and deliberate nonsense.

---

### 4A.7 Salt Match (name + strength/ml → composition → cheapest generic)

**The user story:** "I say *Dolo 650* or *Benadryl 100 ml*. The app tells me the salts inside, then shows the cheapest generic in a Jan Aushadhi Kendra with exactly the same composition."

**Inputs accepted** (typed, spoken, or from a Blank-Fill candidate chip)

| User says / types | Parsed as |
|---|---|
| `Dolo 650` | name = Dolo, strength = 650 (unit inferred as mg from the dataset) |
| `Crocin 500 mg tablet` | name, strength 500 mg, form tablet |
| `Benadryl 100 ml` | name, **pack volume** = 100 ml, form syrup |
| `Augmentin 625` | name, strength 625 (combination product) |
| "dolo six fifty" (voice) | number words converted to digits, then as above |

**Step 1: Parse the query.** A small parser (`parseQuery.js`) splits the input into *name*, *number*, *unit* (mg, mcg, g, ml, %, IU) and optional *form*. If the unit is missing it is inferred from the matched brand's data. Number words ("six fifty") and Devanagari numerals are normalised first.

**Step 2: Identify the product.** The brand name goes through the existing Blank-Fill / phonetic matcher. The number then **disambiguates between variants of the same brand** (Dolo 500 vs Dolo 650). If more than one product still fits, the app asks one short question ("Tablet or syrup?") instead of guessing.

**Step 3: Read the salt composition from the data (never from a language model).** Each product carries an `ingredients[]` list such as:
- Dolo 650 → Paracetamol 650 mg
- Augmentin 625 → Amoxicillin 500 mg + Clavulanic acid 125 mg
- Benadryl syrup → Diphenhydramine 14.08 mg / 5 ml (strength is stored **per dose basis**; pack volume is stored separately)

The composition is shown as editable-looking "salt chips" so the user can see what was detected before any price is shown.

**Step 4: Build a canonical composition key.** Salts are lower-cased, aliased (e.g. *Acetaminophen* → *Paracetamol*), sorted alphabetically, and joined with their normalised strength and form:
`amoxicillin:500mg+clavulanic-acid:125mg|tablet`
This key is precomputed for every row at build time, so lookup is a single dictionary read and is instant offline.

**Step 5: Find all generics with the same key.** Every Jan Aushadhi entry whose `composition_key` equals the brand's key is a candidate. Rules:
- Salt set, each strength and the form must all match exactly. A different strength or an extra/missing salt is **not** a candidate.
- Volume-based products (syrups, drops) are compared on strength **per ml**, never on the pack size alone, so a 100 ml bottle is not matched to a different concentration.

**Step 6: Rank by cheapest effective price.** Prices are normalised so unlike pack sizes compare fairly:
- Tablets/capsules: price **per unit**
- Syrups/drops: price **per ml**
- Optional toggle: "price for my quantity" (e.g. 10 tablets, or 100 ml) so the user sees the real rupees to pay.

The cheapest candidate is shown as the hero (`₹240 → ₹28`), followed by a short list of the next-cheapest equivalents. Ties are broken by newer `last_updated`.

**Step 7: Be honest when there is no perfect match.**

| Situation | What the app shows |
|---|---|
| Identical composition found | **Exact** badge, headline saving, cheapest-first list |
| Same salts, different strength or form | **Partial**: listed as "related, not interchangeable", **no saving shown** |
| No generic in the data | "No Jan Aushadhi generic with this composition in our data." |
| Brand not recognised | "Did you mean…?" chips, otherwise the not-found state |

**Result card (illustrative layout)**
```
┌──────────────────────────┐
│  Benadryl · 100 ml       │
│  Detected composition:   │
│  [Diphenhydramine        │
│   14.08 mg / 5 ml]       │
│                          │
│  Cheapest generic        │
│  (same composition)      │
│  ₹XX  →  ₹YY  per 100 ml │   ← hero
│  Match: EXACT            │
│                          │
│  Other equivalents       │
│  1. ... ₹ / ml           │
│  2. ... ₹ / ml           │
│                          │
│  [ Counter card ]        │
│  ⚠ Confirm with doctor   │
│    or pharmacist         │
└──────────────────────────┘
```
(Values are placeholders; real numbers come from the dataset.)

**Safety notes**
- Composition and prices come only from the curated dataset; nothing is generated.
- The app never says "switch to this". It says "a generic with the same composition is listed at ₹X, ask your pharmacist."
- Prices are indicative and dated; "Prices as of <date>" stays visible.
- Everything runs on the device. Only the optional voice input may use the browser's speech service.

---

## 5. PWA Specification

### 5.1 Why a PWA
- One codebase serves phone and web; no app-store approval needed during a hackathon.
- Installable to the home screen with an app-like full-screen experience.
- Works offline because the drug dataset is small and ships with the app.
- Instant to share: a link is the install.

### 5.2 Requirements checklist
| Requirement | Detail |
|---|---|
| HTTPS | Required for service workers (localhost is exempt in development) |
| Web App Manifest | `manifest.webmanifest` with name, icons, colours, display mode |
| Service Worker | Precaches the app shell and the dataset; handles updates |
| Icons | 192×192 and 512×512 PNG, plus a **maskable** icon |
| Responsive viewport | `<meta name="viewport" content="width=device-width, initial-scale=1">` |
| Offline fallback | Full functionality offline; friendly notice if a network-only feature is used |

### 5.3 Manifest (example)
```json
{
  "name": "Prescription Price Finder",
  "short_name": "RxPrice",
  "description": "Find the generic and see what you save before you pay.",
  "start_url": "/?source=pwa",
  "scope": "/",
  "display": "standalone",
  "orientation": "portrait-primary",
  "background_color": "#FFF8E7",
  "theme_color": "#1F2A44",
  "lang": "en-IN",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ],
  "shortcuts": [
    { "name": "Search a medicine", "url": "/?focus=search" },
    { "name": "Scan a strip", "url": "/scan" }
  ]
}
```

### 5.4 Caching strategy
| Asset | Strategy | Reason |
|---|---|---|
| App shell (HTML, JS, CSS, fonts, icons) | Precache | Instant load and full offline use |
| Drug dataset (`drugs.json`) | Precache + versioned | Core functionality must work offline |
| Kendra locations (stretch) | Stale-while-revalidate | Fine if slightly old |
| Map tiles or external APIs (stretch) | Network-first with fallback | Needs connectivity |

### 5.5 Update flow
- Service worker detects a new version in the background.
- Show a small, non-blocking banner: **"New data available. Refresh."**
- Dataset carries a version and date, shown in the footer: *"Prices as of <date>."*

### 5.6 Install experience
- **Android / Chrome / Edge:** listen for `beforeinstallprompt`, show a custom "Install app" button after the user has completed one search (never on first load).
- **iOS Safari:** no install event exists. Show a short hint: *Share → Add to Home Screen*.
- **Desktop:** the same install button appears in Chromium browsers.

### 5.7 Tooling **[Decide]**
- Vite + `vite-plugin-pwa` (Workbox under the hood) is the quickest route.
- Audit with Lighthouse (PWA, Performance, Accessibility, Best Practices).

---

## 6. Responsive UI/UX Specification

### 6.1 Design principles
1. **Mobile-first.** Design at 360px wide, then scale up.
2. **One job per screen.** Search, result, projection, card.
3. **The saving is the hero.** Largest, highest-contrast element on the result.
4. **Big touch targets.** Minimum 48×48 px, 8 px spacing.
5. **Readable by anyone.** Large type, high contrast, plain words.
6. **Trust by design.** Source, date and disclaimer are visible but never cluttered.

### 6.2 Breakpoints
| Name | Width | Layout |
|---|---|---|
| Phone | < 600 px | Single column, bottom navigation, sticky search |
| Tablet | 600–1023 px | Single column with wider cards, two-column result details |
| Desktop | ≥ 1024 px | Two-pane: search and history left, result right; centred max-width ~1100 px |

Use CSS Grid/Flexbox, relative units (`rem`, `%`, `clamp()`), and container queries where helpful. No horizontal scrolling at any width.

### 6.3 Screens

**Home / Search**
```
┌──────────────────────────┐
│  RxPrice        EN | हिं │
│                          │
│  What was prescribed?    │
│  ┌────────────────────┐  │
│  │ 🔍 Type medicine   │  │
│  └────────────────────┘  │
│  [ 📷 Scan strip ]       │
│                          │
│  Recent searches         │
│  • Dolo 650              │
│  • Metformin             │
│                          │
│  ⓘ Price info only, not  │
│    medical advice        │
└──────────────────────────┘
```

**Result**
```
┌──────────────────────────┐
│  Dolo 650                │
│  Generic: Paracetamol    │
│           650 mg tablet  │
│                          │
│     ₹240  →  ₹28         │   ← hero, largest text
│     You save ₹212        │
│                          │
│  ✔ Same molecule         │
│  ✔ Same strength         │
│  ✔ Same form             │
│  Match: EXACT            │
│                          │
│  [ Yearly saving ]       │
│  [ Make counter card ]   │
│                          │
│  Source · date           │
│  ⚠ Confirm with doctor   │
│    or pharmacist         │
└──────────────────────────┘
```
(The values above are illustrative placeholders.)

**Savings projection:** simple stepper for units per day and a duration chip (30 days / 90 days / 1 year), with the total saving updating live.

**Counter Card:** a clean preview that matches the printed layout, with *Print*, *Share* and *Save as image* buttons.

**Desktop layout:** the same components, arranged as a left search/history pane and a right result pane, so nothing needs a different design, only a different arrangement.

### 6.4 Navigation
- **Phone:** bottom bar with Search, Counter, Prescription, Card (thumb-reachable); About sits in the header menu. **Counter** opens Counter Mode directly.
- **Desktop:** top bar with the same items.
- Search field is always one tap away and autofocuses on desktop only (avoids the keyboard jumping up unexpectedly on phones).

### 6.5 Visual system **[Decide]**
| Element | Guideline |
|---|---|
| Colours | A calm base, one accent for the saving (green family), amber for caution, red only for genuine alerts. Never rely on colour alone; pair with icons and text. |
| Typography | One clear sans-serif family, base 16 px, headline saving 40–56 px, line-height 1.4–1.6 |
| Spacing | 4/8 px scale |
| Corners and elevation | Consistent radius, subtle shadows |
| Dark mode | Support `prefers-color-scheme`; keep contrast ≥ 4.5:1 |
| Motion | Short, subtle; respect `prefers-reduced-motion` |

### 6.6 States to design
- Empty (first launch)
- Loading (skeleton, should be rarely seen because data is local)
- Success: Exact / Partial / None
- Low-confidence match: "Did you mean…?" list
- Not found
- Offline (shown as a small badge, not an error, since the app works offline)
- Error (camera denied, OCR failed) with a fallback to typing

### 6.7 Accessibility
- Semantic HTML, labelled inputs, visible focus rings.
- Full keyboard operation on desktop.
- Screen-reader friendly result summary (`aria-live` for result changes).
- Contrast ≥ 4.5:1 for text; touch targets ≥ 48 px.
- Text scales with the browser font size setting.
- Meaning is never conveyed by colour alone.

### 6.8 Language
- English and Hindi from day one (UI strings in a translation file, e.g. `en.json`, `hi.json`).
- Language toggle in the header, remembered locally.
- Drug names remain in their original form; labels around them are translated.
- Architecture allows adding more Indian languages later.

---

## 7. System Architecture **[Decide]**

```
┌───────────────────────── Browser / Installed PWA ─────────────────────────┐
│                                                                            │
│  UI layer (responsive components, i18n)                                    │
│        │                                                                   │
│  Logic layer                                                               │
│   ├─ Normaliser → Fuzzy matcher → Equivalence engine                       │
│   ├─ Price calculator (per-unit, saving, projection, ceiling alert)        │
│   └─ Counter Card generator (print CSS, Web Share, canvas/image export)    │
│        │                                                                   │
│  Data layer                                                                │
│   ├─ drugs.json (bundled, versioned)  → loaded into memory / IndexedDB     │
│   └─ localStorage: language, recent searches, install-prompt state         │
│        │                                                                   │
│  Service Worker (Workbox): precache shell + data, update notification      │
└────────────────────────────────────────────────────────────────────────────┘
        Optional: static host only (HTTPS). No backend required.
```

**Key decision:** no backend. Everything runs on the device, so it is fast, free to host, works offline, and **typed searches, prices and prescriptions never leave the user's phone**. The only exception is the optional voice input, which depends on the browser's speech service and is off until the user taps the mic (see 4A.2).

### 7.1 Suggested stack **[Decide]**
| Concern | Option |
|---|---|
| Framework | React + Vite (or Svelte / plain JS) |
| PWA | `vite-plugin-pwa` / Workbox |
| Styling | CSS variables + CSS Grid/Flexbox (or Tailwind) |
| Fuzzy matching | `fuse.js` or `rapidfuzz`-style trigram implementation |
| Storage | JSON bundled; IndexedDB (e.g. `idb`) if the dataset grows |
| i18n | Simple JSON dictionaries or `i18next` |
| OCR (stretch) | Tesseract.js, printed text only |
| Camera (stretch) | `getUserMedia` or `<input type="file" accept="image/*" capture="environment">` (the file input is the most reliable fallback) |
| Printing / sharing | Print stylesheet, Web Share API (with a copy/download fallback) |
| Hosting | Netlify, Vercel, Cloudflare Pages or GitHub Pages (all HTTPS) |

### 7.2 Suggested folder structure
```
/public
  /icons                # 192, 512, maskable
  manifest.webmanifest
/src
  /components           # SearchBar, BlankFillInput, CandidateChips, ResultCard, EquivalenceChecklist,
                        # SavingsHero, SaltChips, SaltMatchCard, PriceLadder, CounterMode, CounterCard, RupeeReceipt
  /engine               # normalise.js, translit.js, confusions.js, phonetic.js, match.js,
                        # equivalence.js, pricing.js, quoteVerdict.js, ladder.js,
                        # parseQuery.js, composition.js, cheapestGeneric.js
  /data                 # drugs.json, version.json
  /i18n                 # en.json, hi.json
  /pwa                  # service worker config, install prompt, update banner
  /styles               # tokens.css, layout.css, print.css
/scripts                # data cleaning and validation pipeline
/tests                  # unit tests + golden matching set
```

---

## 8. Data

**Sources:** Jan Aushadhi (PMBJP) product list and prices; National Pharmaceutical Pricing Authority (NPPA) ceiling prices.

**Approach:** a cleaned, curated subset (around 200 common drugs) bundled in the repo. Accuracy beats volume. No runtime language-model generation of drug facts.

**Schema**
| Field | Description |
|---|---|
| `brand_name`, `manufacturer` | As printed on the box |
| `aliases[]` | Common alternative spellings and short forms |
| `molecule` / `ingredients[]` | Generic name(s); list of (molecule, strength) for combinations |
| `strength_value`, `strength_unit` | Parsed for exact comparison |
| `form` | tablet, capsule, syrup, etc. |
| `pack_size`, `units_per_pack` | For per-unit pricing |
| `brand_price_inr`, `generic_price_inr` | Indicative prices |
| `nppa_ceiling_inr` | Where applicable |
| `source`, `last_updated` | Traceability |
| `ingredients[].per_basis` | Strength basis: `per_unit` (tablet/capsule) or `per_5ml` / `per_ml` (liquids) |
| `pack_volume_ml` | Bottle size for syrups, drops, etc. (used for per-ml pricing) |
| `composition_key` | Precomputed canonical key (sorted salts + strengths + form) used by Salt Match |
| `salt_aliases[]` | Alternative salt names (e.g. Acetaminophen = Paracetamol) |

A repeatable script validates the data (no missing molecule, parseable strength, duplicate check, generic price vs brand price sanity check).

---

## 9. Logic Summary

1. **Normalise** input (case, spacing, punctuation, abbreviations like `tab`, `cap`, `mg`; transliterate Devanagari to Latin; expand `?` and `*` wildcards).
2. **Match** against brands, aliases and molecules using handwriting-weighted edit distance plus a phonetic key; score and rank; apply a confidence threshold.
3. **Equivalence** check: molecule + strength + form (+ ingredient set for combinations). Only **Exact** yields the headline saving.
4. **Price**: per-unit comparison, saving, projection, ceiling alert, Price Ladder.
5. **Counter Mode** (optional): compare the user's quoted price with generic, brand and ceiling prices and choose a verdict.
6. **Present**: result card with evidence, source, date and disclaimer; offer the Counter Card and Rupee Receipt.

### 9.1 Salt Match flow (4A.7)
`parseQuery` (name + number + unit + form) → `match` (brand + variant by strength) → read `ingredients[]` → build `composition_key` → lookup all generics with the same key → normalise to per-unit / per-ml price → sort ascending → show cheapest as hero with Exact badge, or the honest Partial/None state.

---

## 10. Safety and Privacy

- Disclaimer on every result: *"This is price and molecule information only, not medical advice. Do not change or substitute any medicine on your own. Confirm with your doctor or pharmacist."*
- No substitution recommendation, no dosage advice. The projection uses only the schedule the user enters.
- Nothing is generated by a language model; all facts come from the shipped data.
- Missing data is stated plainly.
- Prices are labelled indicative, with a date.
- Privacy: typed search, matching, pricing, quote history and OCR (if built) all run locally; no accounts, no tracking of prescriptions. Voice input is optional, off by default, and may use the browser vendor's speech service, so the app says so before first use. If analytics are added, keep them anonymous and exclude searches.
- Counter Mode wording is always "ask" and "check", never an accusation. Prices and stock vary, and the verdict is labelled indicative.
- The Rupee Receipt contains no patient name or medical history.

---

## 11. Performance Budget

| Metric | Target |
|---|---|
| Lighthouse PWA / Accessibility / Best Practices | ≥ 90 each (aim higher) |
| Lighthouse Performance on mobile | ≥ 90 |
| First load on a throttled 3G profile | Usable within a few seconds |
| Result after typing | Effectively instant (local lookup) |
| JS bundle | Keep small; lazy-load OCR only when the scan screen opens |

---

## 12. Testing

**Functional**
- [ ] Exact brand and molecule lookups
- [ ] Wildcard input (`D?lo 6?0`) returns the right candidates
- [ ] Hindi-script and sound-alike inputs resolve
- [ ] Counter Mode gives the right verdict for each price band and never uses accusatory wording
- [ ] Price Ladder lists only Exact-equivalence entries in the correct order
- [ ] Misspellings and abbreviations resolve (golden test set)
- [ ] Missing strength prompts the user
- [ ] Unknown drug shows "not found"
- [ ] Saving and projection arithmetic correct
- [ ] Partial and None matches never show a headline saving
- [ ] Disclaimer present on every result
- [ ] Salt Match: `Dolo 650`, `Augmentin 625`, `Benadryl 100 ml` parse to the right name, number and unit
- [ ] Salt Match: number words ("six fifty") and Devanagari numerals parse correctly
- [ ] Salt Match: detected composition equals the dataset entry for the product
- [ ] Salt Match: only identical salt set + strengths + form are returned; different strength or missing/extra salt never appears as Exact
- [ ] Salt Match: syrups compared per ml; results sorted cheapest first
- [ ] Salt Match: ambiguous names (e.g. two forms of one brand) trigger a clarifying question
- [ ] Salt Match: no-generic and unknown-brand cases show honest states

**Matching quality:** report top-1 accuracy, top-3 accuracy and the **false-confident rate** (confidently wrong answers), the key safety metric.

**PWA**
- [ ] Installs on Android Chrome and desktop Chrome/Edge
- [ ] iOS "Add to Home Screen" works and the hint appears
- [ ] Airplane mode: the full search flow works
- [ ] Update banner appears after a new deployment
- [ ] Lighthouse PWA audit passes

**Responsive / device matrix**
- [ ] 360×640 (small Android), 390×844 (iPhone), 768 (tablet), 1280 and 1920 (desktop)
- [ ] Portrait and landscape
- [ ] No horizontal scroll, no clipped text, targets ≥ 48 px
- [ ] 200% browser zoom and large system font
- [ ] Keyboard-only navigation and a screen-reader pass
- [ ] Print preview of the Counter Card fits one A4 page

---

## 13. Build Order for the Hackathon Clock

| Priority | Task |
|---|---|
| 1 | Responsive search → result with fuzzy matching and the saving hero (MVP) |
| 2 | PWA basics: manifest, icons, service worker, offline test, deploy to HTTPS |
| 3 | Equivalence levels and checklist; per-unit pricing |
| 3b | **Salt Match**: query parser, `composition_key` build script, cheapest-generic ranking (per unit / per ml) |
| 4 | **Blank-Fill Decoder** (wildcards + handwriting-weighted matching) and golden test set with accuracy numbers |
| 5 | **Counter Mode** (quote verdict) |
| 6 | Price Ladder; yearly projection |
| 7 | Counter Card (print + share), English then Hindi; Rupee Receipt |
| 8 | Hindi-script and sound-alike search; optional voice input |
| 9 | Install prompt, update banner, dark mode, accessibility pass |
| 10 | Ceiling alert; stretch items (scan, Kendra locator) |

Rule: **a polished, installable, offline-capable 1 to 5 beats a broken 1 to 10.** If time is short, the two features to protect for the demo are the **Blank-Fill Decoder** and **Counter Mode**; they are what set this project apart. Deploy early and test on a real phone.

---

## 14. Run and Deploy **[Decide]**

```bash
git clone <your-repo-url>
cd <your-repo>
npm install
npm run dev          # local development
npm run build        # production build with service worker
npm run preview      # test the built PWA locally
```

Deploy the `dist/` folder to any static HTTPS host. Test the install flow and offline mode on the deployed URL, not only on localhost.

---

## 15. Demo Script (about 2 minutes)

1. Open the link on a phone; show the install prompt and add it to the home screen.
2. Switch on airplane mode; the app still works.
3. Hold up a prescription with a hard-to-read word. Type `D?lo 6?0` with blanks for the unreadable letters; candidate chips appear and the right one resolves.
4. Say a name aloud or type it in Hindi script; it still resolves.
4b. Type or say `Augmentin 625`; the salt chips appear (Amoxicillin 500 mg + Clavulanic acid 125 mg) and the cheapest identical generic is ranked first. Repeat with `Benadryl 100 ml` to show per-ml pricing.
5. Show the hero saving and the Exact-match checklist, then the Price Ladder.
6. Switch to **Counter Mode**, type a quoted price, and show the verdict card.
7. Show a Partial-match case that honestly refuses to claim a saving.
8. Generate the Counter Card (Hindi and English) and the Rupee Receipt.
9. Open the same URL on a laptop to show the two-pane desktop layout.
10. Close with the accuracy numbers (plain fuzzy vs Blank-Fill) and the line: *"Typing, matching and prices run on your phone. Your prescription stays with you."*

---

## 16. Roadmap

- Larger dataset with an automated refresh pipeline
- More Indian languages and voice input
- Reliable printed-label OCR, then cautious handwriting support
- Kendra locator with directions
- Family profiles stored only on the device

## 17. Team and Credits **[Decide]**

- Team members: _add names and roles_
- Data sources: Jan Aushadhi (PMBJP), NPPA
