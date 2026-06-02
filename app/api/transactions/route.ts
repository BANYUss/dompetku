import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { CreateTransactionSchema } from '@/lib/validations/transaction'

function getMonthRange(month: string) {
  const [year, mon] = month.split('-').map(Number)
  const start = new Date(year, mon - 1, 1)
  const end = new Date(year, mon, 1) // exclusive upper bound
  return { start, end }
}

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = req.nextUrl
  const month = searchParams.get('month')
  const categoryId = searchParams.get('categoryId')
  const search = searchParams.get('search')

  const where: Record<string, unknown> = { userId: session.user.id }

  if (month) {
    const { start, end } = getMonthRange(month)
    where.date = { gte: start, lt: end }
  }

  if (categoryId) where.categoryId = categoryId

  if (search) {
    where.description = { contains: search, mode: 'insensitive' }
  }

  try {
    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        category: true,
        account: true,
      },
      orderBy: { date: 'desc' },
    })

    return NextResponse.json(
      transactions.map((t) => ({ ...t, amount: Number(t.amount) })),
    )
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = CreateTransactionSchema.parse(await req.json())

    const transaction = await prisma.transaction.create({
      data: {
        userId: session.user.id,
        type: body.type,
        amount: body.amount,
        description: body.description,
        categoryId: body.categoryId,
        accountId: body.accountId,
        date: new Date(body.date),
        source: 'manual',
      },
      include: {
        category: true,
        account: true,
      },
    })

    return NextResponse.json({ ...transaction, amount: Number(transaction.amount) }, { status: 201 })
  } catch (err) {
    if (err instanceof Error && err.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: err.message }, { status: 400 })
    }
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
