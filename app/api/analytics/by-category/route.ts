import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function getMonthRange(month: string) {
  const [year, mon] = month.split('-').map(Number)
  return { start: new Date(year, mon - 1, 1), end: new Date(year, mon, 1) }
}

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = req.nextUrl
  const now = new Date()
  const month =
    searchParams.get('month') ??
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  const { start, end } = getMonthRange(month)

  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: session.user.id,
        type: 'expense',
        date: { gte: start, lt: end },
      },
      include: { category: true },
    })

    // Group by category in JS (safer than Prisma groupBy in v7)
    const grouped: Record<string, {
      categoryId: string
      name: string
      icon: string
      color: string
      total: number
    }> = {}

    for (const tx of transactions) {
      const key = tx.categoryId ?? '__none__'
      if (!grouped[key]) {
        grouped[key] = {
          categoryId: key,
          name: tx.category?.name ?? 'Tidak berkategori',
          icon: tx.category?.icon ?? '📦',
          color: tx.category?.color ?? '#94a3b8',
          total: 0,
        }
      }
      grouped[key].total += Number(tx.amount)
    }

    const totalExpense = Object.values(grouped).reduce((s, g) => s + g.total, 0)

    const result = Object.values(grouped)
      .sort((a, b) => b.total - a.total)
      .slice(0, 8)
      .map((g) => ({
        ...g,
        percentage: totalExpense > 0 ? Math.round((g.total / totalExpense) * 100) : 0,
      }))

    return NextResponse.json({ categories: result, total: totalExpense, month })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
