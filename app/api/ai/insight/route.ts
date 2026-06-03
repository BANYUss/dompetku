import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { geminiModel, extractJsonArray } from '@/lib/gemini'
import { formatRupiah } from '@/lib/utils'

// ── In-memory cache ────────────────────────────────────────────────────────
const TTL_MS = 60 * 60 * 1000 // 1 hour

interface CacheEntry { insights: string[]; timestamp: number }
const cache = new Map<string, CacheEntry>()

function getCached(key: string): string[] | null {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() - entry.timestamp > TTL_MS) { cache.delete(key); return null }
  return entry.insights
}
function setCached(key: string, insights: string[]) {
  cache.set(key, { insights, timestamp: Date.now() })
}
// ──────────────────────────────────────────────────────────────────────────

function getMonthRange(month: string) {
  const [year, mon] = month.split('-').map(Number)
  return { start: new Date(year, mon - 1, 1), end: new Date(year, mon, 1) }
}

const FALLBACK = ['Tidak dapat menganalisis data saat ini. Coba lagi nanti.']

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = req.nextUrl
  const now   = new Date()
  const month = searchParams.get('month')
    ?? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const force = searchParams.get('force') === 'true'

  const userId   = session.user.id
  const cacheKey = `${userId}:${month}`

  // Return cached result unless force-refresh requested
  if (!force) {
    const cached = getCached(cacheKey)
    if (cached) {
      return NextResponse.json({ insights: cached, cached: true })
    }
  }

  const { start, end } = getMonthRange(month)

  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId, date: { gte: start, lt: end } },
      include: { category: true },
    })

    if (transactions.length === 0) {
      const empty = ['Belum ada transaksi bulan ini. Mulai catat pengeluaran dan pemasukanmu!']
      setCached(cacheKey, empty)
      return NextResponse.json({ insights: empty })
    }

    let totalIncome  = 0
    let totalExpense = 0
    const byCategory: Record<string, number> = {}

    for (const tx of transactions) {
      const amt = Number(tx.amount)
      if (tx.type === 'income')  totalIncome  += amt
      if (tx.type === 'expense') totalExpense += amt
      if (tx.type === 'expense' && tx.category) {
        const name = tx.category.name
        byCategory[name] = (byCategory[name] ?? 0) + amt
      }
    }

    const balance    = totalIncome - totalExpense
    const topExpense = Object.entries(byCategory)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, amt]) => `${name}: ${formatRupiah(amt)}`)
      .join(', ')

    const prompt = `Kamu adalah asisten keuangan personal yang ramah dan berbahasa Indonesia.
Analisis data keuangan bulan ini dan berikan 3-4 insight yang berguna, jujur, dan actionable.

Data keuangan:
- Total pemasukan: ${formatRupiah(totalIncome)}
- Total pengeluaran: ${formatRupiah(totalExpense)}
- Saldo: ${formatRupiah(balance)} ${balance >= 0 ? '(surplus)' : '(defisit)'}
- Pengeluaran terbesar: ${topExpense || 'tidak ada data kategori'}
- Jumlah transaksi: ${transactions.length}

Berikan insight dalam format JSON array of string. Setiap insight 1-2 kalimat,
pakai bahasa santai tapi informatif. Jangan gunakan markdown formatting atau simbol *.
Format: ["insight1", "insight2", "insight3", "insight4"]`

    const result   = await geminiModel.generateContent(prompt)
    const text     = result.response.text()
    const parsed   = extractJsonArray(text)
    const insights = Array.isArray(parsed) && parsed.length > 0
      ? (parsed as string[]).filter((s) => typeof s === 'string')
      : null

    if (insights) {
      setCached(cacheKey, insights)
      return NextResponse.json({ insights })
    }

    // Gemini returned unparseable response — use fallback but don't cache
    return NextResponse.json({ insights: FALLBACK })
  } catch (err) {
    const msg = (err as Error).message ?? ''
    console.error('[AI Insight]', msg)

    // 429 rate-limit: return stale cache if available, else fallback
    if (msg.includes('429') || msg.toLowerCase().includes('quota')) {
      const stale = cache.get(cacheKey)
      if (stale) return NextResponse.json({ insights: stale.insights, cached: true })
      return NextResponse.json({ insights: ['Gemini API sedang sibuk. Coba lagi dalam beberapa menit.'] })
    }

    return NextResponse.json({ insights: FALLBACK })
  }
}
