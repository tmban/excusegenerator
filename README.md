# Excuse Generator Pro

Generate the perfect excuse for any situation — from totally plausible to completely unhinged.

## Tech stack

- React + Vite (frontend)
- Vercel (hosting + serverless functions)
- Anthropic Claude (AI excuse generation)

## Project structure

```
excusegenerator/
├── src/
│   ├── App.jsx          ← main app
│   └── main.jsx         ← entry point
├── api/
│   └── verdict.js       ← serverless function (keeps API key safe)
├── public/
│   └── favicon.svg
├── index.html
├── vite.config.js
├── package.json
└── .env.example
```

## Local development

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables
```bash
cp .env.example .env.local
# Add your Anthropic API key to .env.local
```

### 3. Run locally with Vercel dev (recommended — runs the API too)
```bash
npm install -g vercel
vercel dev
```

## Deploy to Vercel

1. Push this repo to GitHub
2. Go to vercel.com → New Project → Import from GitHub
3. Select the repo — Vercel auto-detects Vite
4. Add environment variable: `ANTHROPIC_API_KEY` = your key
5. Click Deploy
