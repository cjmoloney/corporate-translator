# Corporate Translator™

> Turning fury into fluency since today™

A Next.js web app that translates your unfiltered workplace frustration into polished, HR-safe corporate speak — powered by Claude AI.

---

## Deploy to Vercel (5 minutes)

### 1. Get your Anthropic API key
- Go to [console.anthropic.com](https://console.anthropic.com/)
- Create an account or sign in
- Navigate to **API Keys** and create a new key
- Copy the key (starts with `sk-ant-...`)

### 2. Push to GitHub
```bash
cd corporate-translator
git init
git add .
git commit -m "Initial commit"
# Create a new repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/corporate-translator.git
git push -u origin main
```

### 3. Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **Add New → Project**
3. Import your `corporate-translator` repository
4. In the **Environment Variables** section, add:
   - Name: `ANTHROPIC_API_KEY`
   - Value: your key from step 1
5. Click **Deploy**

That's it — Vercel gives you a live URL instantly (e.g. `corporate-translator.vercel.app`).

---

## Run locally

```bash
# Install dependencies
npm install

# Add your API key
cp .env.example .env.local
# Edit .env.local and add your ANTHROPIC_API_KEY

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project structure

```
corporate-translator/
├── pages/
│   ├── _app.js          # App wrapper
│   ├── _document.js     # HTML head (fonts, meta)
│   ├── index.js         # Main UI
│   └── api/
│       └── translate.js # Secure API proxy (your key stays server-side)
├── styles/
│   └── globals.css      # Global styles
├── .env.example         # Template for environment variables
├── .gitignore
├── next.config.js
└── package.json
```

## Cost & rate limiting

- Each translation uses ~300–600 Claude API tokens
- At current pricing, that's roughly **$0.001–0.003 per translation**
- The app includes **rate limiting**: 10 requests per IP per minute to prevent abuse
- Monitor your usage at [console.anthropic.com](https://console.anthropic.com/)

## Customising

- **Change the AI model**: Edit `pages/api/translate.js` → `model` field
- **Adjust rate limits**: Edit `RATE_LIMIT` and `WINDOW_MS` in `pages/api/translate.js`
- **Add more mediums**: Edit the `<select>` options in `pages/index.js`
