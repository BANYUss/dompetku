import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const CreateCategorySchema = z.object({
  name: z.string().min(1),
  icon: z.string().default('💰'),
  color: z.string().default('#7c6af7'),
  type: z.enum(['income', 'expense', 'both']).default('expense'),
})

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const categories = await prisma.category.findMany({
      where: {
        OR: [{ userId: session.user.id }, { userId: null }],
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(categories)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = CreateCategorySchema.parse(await req.json())

    const category = await prisma.category.create({
      data: { ...body, userId: session.user.id },
    })

    return NextResponse.json(category, { status: 201 })
  } catch (err) {
    if (err instanceof Error && err.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: err.message }, { status: 400 })
    }
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
