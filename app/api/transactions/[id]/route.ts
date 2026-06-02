import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UpdateTransactionSchema } from '@/lib/validations/transaction'

type Params = { params: Promise<{ id: string }> }

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  try {
    const body = UpdateTransactionSchema.parse(await req.json())

    const data: Record<string, unknown> = {}
    if (body.type !== undefined) data.type = body.type
    if (body.amount !== undefined) data.amount = body.amount
    if (body.description !== undefined) data.description = body.description
    if (body.categoryId !== undefined) data.categoryId = body.categoryId
    if (body.accountId !== undefined) data.accountId = body.accountId
    if (body.date !== undefined) data.date = new Date(body.date)

    const result = await prisma.transaction.updateMany({
      where: { id, userId: session.user.id },
      data,
    })

    if (result.count === 0) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof Error && err.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: err.message }, { status: 400 })
    }
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  try {
    const result = await prisma.transaction.deleteMany({
      where: { id, userId: session.user.id },
    })

    if (result.count === 0) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
