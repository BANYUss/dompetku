# CLAUDE.md — Dompetku

Kamu adalah senior fullstack engineer yang membangun **Dompetku**, aplikasi finance tracker berbasis Next.js 14, Neon PostgreSQL, dan Gemini AI.

## Aturan Utama

- Selalu gunakan **TypeScript** di semua file
- Gunakan **App Router** Next.js 14 (bukan Pages Router)
- Semua API route wajib validasi session — unauthorized request return 401
- Gunakan **Prisma** untuk semua query database, jangan raw SQL
- Validasi semua input API dengan **Zod**
- Komponen UI menggunakan **Tailwind CSS**
- Jangan pernah commit `.env` atau credentials apapun

## Tech Stack

| Layer | Teknologi |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Database | Neon PostgreSQL (serverless) |
| ORM | Prisma |
| Auth | NextAuth.js v5 + Google OAuth |
| Styling | Tailwind CSS |
| Charts | Recharts |
| State | Zustand |
| Forms | React Hook Form + Zod |
| AI | Google Gemini API |
| CSV Parser | Papa Parse |
| File Upload | Uploadthing |
| Deploy | Vercel |

## Struktur Folder

```
dompetku/
├── app/
│   ├── (auth)/
│   │   └── login/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx          # Sidebar + nav
│   │   ├── dashboard/page.tsx
│   │   ├── transactions/page.tsx
│   │   ├── accounts/page.tsx
│   │   ├── analytics/page.tsx
│   │   └── import/page.tsx
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── transactions/
│   │   │   ├── route.ts        # GET, POST
│   │   │   ├── [id]/route.ts   # PUT, DELETE
│   │   │   └── summary/route.ts
│   │   ├── accounts/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── categories/route.ts
│   │   ├── import/
│   │   │   ├── upload/route.ts
│   │   │   └── confirm/route.ts
│   │   └── ai/
│   │       ├── categorize/route.ts
│   │       └── insight/route.ts
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                     # Button, Input, Card, Badge, dll
│   ├── dashboard/              # SummaryCard, DonutChart, BarChart, RecentTx
│   ├── transactions/           # TxList, TxForm, TxItem
│   ├── import/                 # DropZone, BankTabs, PreviewTable
│   └── layout/                 # Sidebar, Topbar
├── lib/
│   ├── prisma.ts               # Prisma client singleton
│   ├── auth.ts                 # NextAuth config
│   ├── gemini.ts               # Gemini client
│   ├── csv-parsers/
│   │   ├── bca.ts
│   │   ├── mandiri.ts
│   │   └── gopay.ts
│   └── validations/            # Zod schemas
├── prisma/
│   ├── schema.prisma
│   └── seed.ts                 # Default categories
├── store/                      # Zustand stores
├── types/                      # TypeScript types global
├── .env.local                  # JANGAN DICOMMIT
└── CLAUDE.md
```

## Environment Variables (.env.local)

```env
# Database
DATABASE_URL="postgresql://..."         # dari Neon dashboard

# Auth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate dengan: openssl rand -base64 32"
GOOGLE_CLIENT_ID="..."                  # dari Google Cloud Console
GOOGLE_CLIENT_SECRET="..."             # dari Google Cloud Console

# AI
GEMINI_API_KEY="..."                    # dari Google AI Studio

# Upload
UPLOADTHING_SECRET="..."
UPLOADTHING_APP_ID="..."
```

## Chunk System

Proyek dibangun secara bertahap. Jalankan satu chunk selesai sebelum lanjut ke berikutnya.

| Chunk | Nama | Isi |
|---|---|---|
| CHUNK-01 | Setup & Init | Init project, Tailwind, Prisma, env |
| CHUNK-02 | Database Schema | Schema Prisma 5 tabel + seed |
| CHUNK-03 | Auth | NextAuth + Google OAuth + halaman login |
| CHUNK-04 | Layout & UI Base | Sidebar, Topbar, komponen UI dasar |
| CHUNK-05 | Transaksi API | CRUD API + validasi Zod |
| CHUNK-06 | Transaksi UI | Form input, list, edit, hapus |
| CHUNK-07 | Dashboard | Summary cards + Recharts |
| CHUNK-08 | Akun Bank | CRUD akun bank |
| CHUNK-09 | CSV Import | Upload, parse, preview |
| CHUNK-10 | Gemini AI | Kategorisasi batch + insight |
| CHUNK-11 | Analitik | Breakdown + tren bulanan |
| CHUNK-12 | Polish & Deploy | Dark mode, skeleton, deploy Vercel |

## Konvensi Kode

```typescript
// API Route: selalu cek session dulu
const session = await auth()
if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

// Prisma: selalu filter by userId untuk keamanan
const transactions = await prisma.transaction.findMany({
  where: { userId: session.user.id }
})

// Zod: validasi semua POST body
const body = CreateTransactionSchema.parse(await req.json())
```

## Catatan Penting

- Semua data HARUS difilter by `userId` — jangan sampai user A bisa lihat data user B
- Amount transaksi selalu disimpan sebagai angka **positif**, tipe ditentukan field `type` (income/expense)  
- `source` field membedakan transaksi manual vs dari CSV import
- Default categories di-seed saat setup, user bisa tambah kategori custom
