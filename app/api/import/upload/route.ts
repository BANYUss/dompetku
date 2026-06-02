import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { parseCSV } from '@/lib/csv-parsers'
import type { BankParserType } from '@/lib/csv-parsers'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const formData = await req.formData()
    const file     = formData.get('file') as File | null
    const bankType = formData.get('bankType') as BankParserType | null

    if (!file)     return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 })
    if (!bankType) return NextResponse.json({ error: 'Bank type wajib diisi' }, { status: 400 })

    const validBanks: BankParserType[] = ['BCA', 'MANDIRI', 'GOPAY']
    if (!validBanks.includes(bankType)) {
      return NextResponse.json({ error: `Bank "${bankType}" belum didukung` }, { status: 400 })
    }

    const text    = await file.text()
    const preview = parseCSV(text, bankType)

    if (preview.length === 0) {
      return NextResponse.json(
        { error: 'Tidak ada transaksi yang berhasil diparse. Pastikan format CSV sesuai.' },
        { status: 400 },
      )
    }

    return NextResponse.json({
      preview,
      totalRows: preview.length,
      bankType,
      filename: file.name,
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 400 })
  }
}
