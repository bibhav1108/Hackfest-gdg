# GenericRx 💊
> **Make the cost of medicine visible before it is paid.**

[![React 19](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC.svg)](https://tailwindcss.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-Multimodal_AI-orange.svg)](https://ai.google.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Microservice-009688.svg)](https://fastapi.tiangolo.com/)
[![Firebase](https://img.shields.io/badge/Firebase-v13-FFCA28.svg)](https://firebase.google.com/)
[![PWA Ready](https://img.shields.io/badge/PWA-Offline_First-green.svg)](https://web.dev/progressive-web-apps/)

**GenericRx** is an intelligent, offline-capable Progressive Web Application (PWA) designed to bridge the gap between expensive brand-name prescriptions and affordable, government-certified Jan Aushadhi (PMBJP) generic alternatives. Patients can decode doctor handwriting, scan prescription slips or medicine packaging, verify chemist pricing against NPPA ceilings, and uncover savings of up to 90%.

---

## 🚀 Key Features

### 1. 🔍 The "Decode → Check → Act" Patient Journey
* **Blank-Fill Decoder (Handwriting-Aware Matching):**
  * Type the letters you can read and place `?` for unreadable letters (e.g., `D?lo 6?0` matches *Dolo 650*).
  * Built with handwriting-weighted Levenshtein matrices tailored to typical doctor calligraphy confusions (`cl/d`, `rn/m`, `a/o/e`, `h/b/k`).
* **Say-It & Hindi-Script Phonetic Search:**
  * Speak or type drug names in Hindi / Devanagari script (e.g., `डोलो`).
  * Phonetic transliteration automatically resolves sound-alike pharmaceutical names (e.g., *Kalpol* ↔ *Calpol*).
* **Salt Match Engine:**
  * Detects exact molecular compositions and strengths (e.g., `Augmentin 625` → *Amoxicillin 500mg + Potassium Clavulanate 125mg*).
  * Automatically finds every certified Jan Aushadhi generic with matching salts and ranks by unit price.

### 2. ⚡ Counter Mode & Pricing Protection
* **Counter Mode:** Enter the price quoted by the chemist to get an instant verdict against Jan Aushadhi generic rates and statutory NPPA price caps.
* **Price Ladder & Equivalence Proof:** Visual ladder comparing all market brand equivalents with their biological equivalence checklists (active molecule, strength, dosage form).
* **Counter Card:** Generate a clean, bilingual card to present across the pharmacy counter.
* **Rupee Receipt:** Shareable visual breakdown proving exact prescription savings (e.g., *"₹212 saved on this prescription"*).

### 3. 🤖 Multimodal AI & Real-Time Intelligence
* **Prescription Scanner:** Powered by Gemini Vision to OCR and extract multi-medicine regimens from camera photos.
* **Medicine Strip Scanner:** Point camera at strip blisters or box labels to detect active ingredients.
* **Gemini Pharmacist Assistant:** Context-aware clinical chatbot explaining usage instructions, precautions, and side effects.
* **Live Voice Consultation (WebSockets):** Full-duplex real-time voice streaming with the AI pharmacist.
* **Google Maps & Search Grounding:** Pinpoints nearby Pradhan Mantri Bhartiya Janaushadhi Kendras (PMBJP) with live availability and navigation.

### 4. 📱 Offline-First Progressive Web App (PWA)
* Installable on iOS, Android, and Desktop with zero app store friction.
* Complete offline support via Service Workers for core medicine search and dosage references.

---

## 🛠️ Tech Stack

| Domain | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite 8 | Ultra-fast single-page application |
| **Styling** | Tailwind CSS v4, Lucide Icons, Motion | Modern, responsive, accessible UI |
| **AI / Multimodal** | `@google/genai` (Gemini 2.x/3.x SDK) | Vision OCR, Voice dictation, Grounding & WebSockets |
| **Server** | Node.js, Express, `ws` | Integrated API proxy, WebSockets & SPA server (`server.ts`) |
| **Microservice** | Python 3, FastAPI, Uvicorn, Pydantic | Jan Aushadhi store locator & salt catalog API (`backend/`) |
| **Database & Auth** | Firebase Auth & Cloud Firestore | User prescriptions, saved medicines, expense tracker |
| **PWA & Offline** | Workbox, Service Workers, Web Manifest | Offline cache and native installation |

---

## 📁 Project Structure

```text
├── backend/                  # FastAPI Python microservice
│   ├── main.py               # Jan Aushadhi store matcher and location API
│   └── requirements.txt      # Python dependencies (FastAPI, Uvicorn, Pydantic)
├── public/                   # Static assets, PWA icons, manifest, service worker
│   ├── manifest.json         # PWA Manifest configuration
│   └── sw.js                 # Service worker for offline caching
├── scripts/                  # Build & icon generation utilities
├── src/
│   ├── components/           # React UI & feature components
│   │   ├── ai/               # Gemini chatbots, voice, and grounding modals
│   │   ├── counter/          # Counter Mode & NPPA quote verification
│   │   ├── dashboard/        # Analytics, expense cards, medicine tables
│   │   ├── decode/           # Blank-Fill handwriting decoder modal
│   │   ├── ladder/           # Price Ladder comparison view
│   │   ├── maps/             # Jan Aushadhi Kendra Google Maps locator
│   │   ├── pwa/              # Install button & offline indicators
│   │   ├── receipt/          # Rupee Receipt shareable savings card
│   │   └── scanner/          # Vision-based prescription scanner
│   ├── data/                 # Curated medicine datasets & Jan Aushadhi catalogs
│   ├── engine/               # Core algorithms: salt composition, fuzzy matcher, translit
│   ├── hooks/                # Custom React hooks (Firebase, Auth, DarkMode, PWA)
│   ├── i18n/                 # Multi-language translations (English & Hindi)
│   ├── types/                # TypeScript interface definitions
│   ├── App.tsx               # Main application controller
│   ├── firebase.ts           # Firebase SDK initialization
│   └── main.tsx              # React DOM entrypoint
├── firebase-blueprint.json   # Firestore data schema blueprints
├── firestore.rules           # Security rules for Cloud Firestore
├── server.ts                 # Express + Vite + WebSocket unified server
├── vite.config.ts            # Vite & Tailwind CSS v4 build configuration
└── package.json              # Node dependencies and project scripts
```

---

## ⚡ Getting Started

### Prerequisites
* **Node.js**: v18.0.0 or later (v20+ recommended)
* **npm**: Included with Node.js
* **Gemini API Key**: Obtain a key from [Google AI Studio](https://aistudio.google.com/)
* *(Optional)* **Python 3.10+**: For the standalone store-matching FastAPI service

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/bibhav1108/Hackfest-gdg.git
cd Hackfest-gdg
```

### Step 2: Environment Setup
Copy the sample environment file to `.env`:
```bash
cp .env.example .env
```

Edit `.env` and fill in your Gemini API key:
```env
GEMINI_API_KEY="your-gemini-api-key-here"
APP_URL="http://localhost:3000"
PORT=3000
```

### Step 3: Install Dependencies
```bash
npm install
```

### Step 4: Run the Development Server
```bash
npm run dev
```
Open your browser and navigate to:
```
http://localhost:3000
```
> The development server mounts both the Express API / WebSocket endpoints and the Vite React frontend under a single port.

---

## 🐍 (Optional) Running the FastAPI Microservice

To run the dedicated Jan Aushadhi store locator backend:

```bash
cd backend
python -m venv venv

# On Windows:
.\venv\Scripts\Activate.ps1
# On macOS/Linux:
# source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
Interactive Swagger API documentation will be available at:
`http://localhost:8000/docs`

---

## 📦 Building for Production

```bash
# Build the production assets
npm run build

# Start the production Node server
npm start
```

---

## 🛡️ Medical Disclaimer
> **Important:** GenericRx is an educational and cost-transparency tool. It does **not** provide clinical diagnosis or independent substitution advice. Always confirm generic equivalents and dosage instructions with a qualified doctor or licensed pharmacist before switching medications.

---

## 📜 License
Distributed under the MIT License. See `LICENSE` for more information.
