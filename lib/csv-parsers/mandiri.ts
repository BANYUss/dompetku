import Papa from 'papaparse'
import { parseAmount, parseDateDMY, col } from './utils'
import type { ParsedTransaction } from './types'

export function parseMandiri(csvText: string): ParsedTransaction[] {
  const lines = csvText.split('\n')

  const headerIdx = lines.findIndex((l) => {
    const lower = l.toLowerCase()
    return lower.includes('tanggal') && (lower.includes('debet') || lower.includes('kredit'))
  })
  if (headerIdx === -1) throw new Error('Format CSV Mandiri tidak dikenali — baris header tidak ditemukan')

  const relevant = lines.slice(headerIdx).join('\n')
  const { data } = Papa.parse<Record<string, string>>(relevant, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  })

  const results: ParsedTransaction[] = []

  for (const row of data) {
    const tanggal = col(row, 'tanggal', 'tgl', 'date')
    const ket     = col(row, 'keterangan', 'ket', 'narasi', 'deskripsi', 'description')
    const debet   = col(row, 'debet', 'debit', 'keluar')
    const kredit  = col(row, 'kredit', 'credit', 'masuk')

    if (!tanggal) continue

    const date = parseDateDMY(tanggal)
    if (!date) continue

    const debetAmt  = parseAmount(debet)
    const kreditAmt = parseAmount(kredit)

    if (debetAmt <= 0 && kreditAmt <= 0) continue

    results.push({
      date,
      description: ket,
      amount: kreditAmt > 0 ? kreditAmt : debetAmt,
      type: kreditAmt > 0 ? 'income' : 'expense',
      categoryId: null,
    })
  }

  return results
}
