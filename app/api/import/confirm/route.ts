import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { ParsedTransaction } from '@/lib/csv-parsers'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = session.user.id

  try {
    const { transactions, bankType, filename, accountId } = await req.json() as {
      transactions: ParsedTransaction[]
      bankType: string
      filename: string
      accountId?: string
    }

    if (!transactions?.length) {
      return NextResponse.json({ error: 'Tidak ada transaksi untuk diimpor' }, { status: 400 })
    }

    // Fetch existing CSV-imported transactions for duplicate check
    const existing = await prisma.transaction.findMany({
      where: { userId, source: 'csv_import' },
      select: { date: true, amount: true, description: true },
    })

    const existingKeys = new Set(
      existing.map(
        (t) => `${t.date.toISOString().substring(0, 10)}|${Number(t.amount)}|${(t.description ?? '').trim()}`,
      ),
    )

    const toInsert = transactions.filter((tx) => {
      const key = `${tx.date.substring(0, 10)}|${tx.amount}|${tx.description.trim()}`
      return !existingKeys.has(key)
    })

    const skipped = transactions.length - toInsert.length

    // Create import log
    const csvImport = await prisma.csvImport.create({
      data: { userId, bankType, filename, totalRows: transactions.length, importedRows: 0, status: 'pending' },
    })

    if (toInsert.length > 0) {
      await prisma.transaction.createMany({
        data: toInsert.map((tx) => ({
          userId,
          type: tx.type,
          amount: tx.amount,
          description: tx.description || null,
          date: new Date(tx.date),
          source: 'csv_import',
          categoryId: tx.categoryId || null,
          accountId: accountId || null,
        })),
      })
    }

    await prisma.csvImport.update({
      where: { id: csvImport.id },
      data: { importedRows: toInsert.length, status: 'done' },
    })

    return NextResponse.json({ success: true, imported: toInsert.length, skipped })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
