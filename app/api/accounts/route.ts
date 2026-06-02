import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const CreateAccountSchema = z.object({
  name: z.string().min(1, 'Nama akun wajib diisi'),
  bankType: z.enum(['BCA', 'MANDIRI', 'GOPAY', 'OVO', 'OTHER']),
  balance: z.number().default(0),
})

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const accounts = await prisma.account.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    })

    // Calculate live balance: initial + income - expense per account
    const result = await Promise.all(
      accounts.map(async (a) => {
        const [incAgg, expAgg] = await Promise.all([
          prisma.transaction.aggregate({
            where: { accountId: a.id, type: 'income' },
            _sum: { amount: true },
          }),
          prisma.transaction.aggregate({
            where: { accountId: a.id, type: 'expense' },
            _sum: { amount: true },
          }),
        ])
        return {
          ...a,
          balance:
            Number(a.balance) +
            Number(incAgg._sum.amount ?? 0) -
            Number(expAgg._sum.amount ?? 0),
        }
      }),
    )

    return NextResponse.json(result)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = CreateAccountSchema.parse(await req.json())

    const account = await prisma.account.create({
      data: {
        userId: session.user.id,
        name: body.name,
        bankType: body.bankType,
        balance: body.balance,
      },
    })

    return NextResponse.json({ ...account, balance: Number(account.balance) }, { status: 201 })
  } catch (err) {
    if (err instanceof Error && err.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: err.message }, { status: 400 })
    }
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
