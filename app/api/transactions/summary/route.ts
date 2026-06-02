import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function getMonthRange(month: string) {
  const [year, mon] = month.split('-').map(Number)
  const start = new Date(year, mon - 1, 1)
  const end = new Date(year, mon, 1)
  return { start, end }
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
  const userId = session.user.id
  const dateFilter = { gte: start, lt: end }

  try {
    const [incomeAgg, expenseAgg] = await Promise.all([
      prisma.transaction.aggregate({
        where: { userId, type: 'income', date: dateFilter },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { userId, type: 'expense', date: dateFilter },
        _sum: { amount: true },
      }),
    ])

    const income = Number(incomeAgg._sum.amount ?? 0)
    const expense = Number(expenseAgg._sum.amount ?? 0)

    return NextResponse.json({
      income,
      expense,
      balance: income - expense,
      month,
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
