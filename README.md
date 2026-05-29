# FlightDeal — India's post-discount flight comparator

Shows the real price after every card offer, coupon, and platform discount.

---

## Local setup

```bash
# Backend
cd backend
npm install
npx playwright install chromium
cp .env.example .env   # fill in your values
npm run dev            # runs on port 4000

# Frontend (new terminal)
cd frontend
npm install
npm start              # runs on port 3000
```

---

## Deploy to production (free)

### Step 1 — Push to GitHub

```bash
cd ~/flightdeal
git init
echo "node_modules/" >> .gitignore
echo ".env" >> .gitignore
echo "build/" >> .gitignore
git add .
git commit -m "Initial FlightDeal MVP"
```

Create a repo at github.com, then:
```bash
git remote add origin https://github.com/YOUR_USERNAME/flightdeal.git
git push -u origin main
```

### Step 2 — Deploy frontend to Vercel

1. Go to vercel.com → "Add New Project"
2. Import your GitHub repo
3. Set root directory to `frontend`
4. Add environment variable: `REACT_APP_API_URL=https://your-backend.onrender.com`
5. Click Deploy

### Step 3 — Deploy backend to Render

1. Go to render.com → "New Web Service"
2. Connect your GitHub repo
3. Set root directory to `backend`
4. Build command: `npm install && npx playwright install chromium`
5. Start command: `npm start`
6. Add environment variables:
   - `DATABASE_URL` = your Supabase session pooler URL
   - `FRONTEND_URL` = your Vercel URL (e.g. https://flightdeal.vercel.app)
   - `NODE_ENV` = production
   - `USE_MOCK` = false
   - `SCRAPER_API_KEY` = your ScraperAPI key (optional)
7. Click Deploy

### Step 4 — Update frontend API URL

In `frontend/src/hooks/useSearch.js`, the `axios.post('/api/search')` uses the proxy.
For production, create `frontend/.env.production`:
```
REACT_APP_API_URL=https://your-backend.onrender.com
```

And update `useSearch.js`:
```js
const API_URL = process.env.REACT_APP_API_URL || '';
const response = await axios.post(`${API_URL}/api/search`, { ... });
```

---

## Environment variables

| Variable | Required | Description |
|---|---|---|
| DATABASE_URL | Yes | Supabase session pooler connection string |
| FRONTEND_URL | Yes | Your Vercel domain (for CORS) |
| PORT | No | Backend port (default 4000) |
| NODE_ENV | No | Set to `production` on Render |
| USE_MOCK | No | `true` = mock data, `false` = real scrapers |
| SCRAPER_API_KEY | No | ScraperAPI key for anti-bot bypass |

---

## Adding more platforms

1. Create `backend/scrapers/goibibo.js` (copy cleartrip.js as template)
2. Add normaliser in `backend/engine/normaliser.js`
3. Add to scrapers array in `backend/scrapers/orchestrator.js`
4. Add offers to `backend/data/offers.json`
