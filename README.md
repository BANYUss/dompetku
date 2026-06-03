# Dompetku — Personal Finance Tracker

Aplikasi finance tracker pribadi berbasis Next.js 16 dengan AI insight dari Google Gemini.
Dirancang dengan dark-first UI yang rich dan premium, terinspirasi dari Vercel & Linear.

## Fitur

- **Dashboard** — Summary cards, donut chart per kategori, bar chart tren 6 bulan, transaksi terbaru
- **Transaksi** — Tambah, edit, hapus transaksi income/expense dengan kategori
- **Akun Bank** — Manajemen akun bank dengan live balance tracking
- **Import CSV** — Upload mutasi bank (BCA, Mandiri, GoPay) dengan preview & kategorisasi manual
- **AI Insight** — Analisis keuangan bulanan via Google Gemini API (dengan server-side caching)
- **Auto-Kategorisasi AI** — Kategorisasi batch transaksi CSV via Gemini
- **Analitik** — Breakdown per kategori, perbandingan bulan ke bulan, top transaksi
- **Dark/Light Mode** — Toggle tema
- **Google OAuth** — Login aman via Google

## Tech Stack

| Layer | Teknologi |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Database | Neon PostgreSQL (serverless) |
| ORM | Prisma v7 |
| Auth | NextAuth.js v5 + Google OAuth |
| Styling | Tailwind CSS v4 |
| Charts | Recharts |
| Forms | React Hook Form + Zod |
| AI | Google Gemini 2.5 Flash |
| CSV Parser | Papa Parse |
| Notifications | Sonner |
| Theme | next-themes |
| Deploy | Vercel |

## Setup

```bash
# 1. Clone & install
git clone <repo-url>
cd dompetku
npm install

# 2. Setup environment
cp .env.local .env.local
# Isi semua variable di .env.local

# 3. Setup database
npx prisma db push
npx prisma db seed

# 4. Jalankan dev server
npm run dev
```

## Environment Variables

```env
DATABASE_URL="postgresql://..."         # Neon dashboard
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="..."                   # openssl rand -base64 32
GOOGLE_CLIENT_ID="..."                  # Google Cloud Console
GOOGLE_CLIENT_SECRET="..."
GEMINI_API_KEY="..."                    # Google AI Studio
```

## API Keys

- **DATABASE_URL**: [Neon Console](https://console.neon.tech)
- **Google OAuth**: [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials
- **Gemini API**: [Google AI Studio](https://aistudio.google.com/apikey)

## License

MIT
