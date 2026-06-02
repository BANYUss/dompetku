import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { MONTHS_SHORT_ID } from '@/lib/utils'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = req.nextUrl
  const monthCount = Math.min(parseInt(searchParams.get('months') ?? '6', 10), 12)
  const userId = session.user.id

  // Build month list (oldest first)
  const months = Array.from({ length: monthCount }, (_, i) => {
    const d = new Date()
    d.setDate(1)
    d.setMonth(d.getMonth() - (monthCount - 1 - i))
    return { year: d.getFullYear(), mon: d.getMonth() + 1 }
  })

  try {
    const results = await Promise.all(
      months.map(({ year, mon }) => {
        const start = new Date(year, mon - 1, 1)
        const end = new Date(year, mon, 1)
        return Promise.all([
          prisma.transaction.aggregate({
            where: { userId, type: 'income', date: { gte: start, lt: end } },
            _sum: { amount: true },
          }),
          prisma.transaction.aggregate({
            where: { userId, type: 'expense', date: { gte: start, lt: end } },
            _sum: { amount: true },
          }),
        ])
      }),
    )

    const data = months.map(({ year, mon }, i) => ({
      month: MONTHS_SHORT_ID[mon - 1],
      monthFull: `${year}-${String(mon).padStart(2, '0')}`,
      income: Number(results[i][0]._sum.amount ?? 0),
      expense: Number(results[i][1]._sum.amount ?? 0),
    }))

    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
