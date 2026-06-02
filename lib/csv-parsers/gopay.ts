import Papa from 'papaparse'
import { parseAmount, parseDateYMD, parseDateDMY, col } from './utils'
import type { ParsedTransaction } from './types'

export function parseGoPay(csvText: string): ParsedTransaction[] {
  const lines = csvText.split('\n')

  const headerIdx = lines.findIndex((l) => {
    const lower = l.toLowerCase()
    return (lower.includes('date') || lower.includes('tanggal')) &&
           (lower.includes('amount') || lower.includes('nominal') || lower.includes('jumlah'))
  })
  if (headerIdx === -1) throw new Error('Format CSV GoPay tidak dikenali — baris header tidak ditemukan')

  const relevant = lines.slice(headerIdx).join('\n')
  const { data } = Papa.parse<Record<string, string>>(relevant, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  })

  const results: ParsedTransaction[] = []

  for (const row of data) {
    const dateRaw = col(row, 'date', 'tanggal', 'tgl', 'waktu', 'time')
    const activity = col(row, 'activity', 'keterangan', 'ket', 'deskripsi', 'description', 'narasi', 'detail')
    const amountRaw = col(row, 'amount', 'jumlah', 'nominal')

    if (!dateRaw || !amountRaw) continue

    // Try YYYY-MM-DD first, then DD/MM/YYYY
    const date = parseDateYMD(dateRaw) ?? parseDateDMY(dateRaw)
    if (!date) continue

    const rawNum = amountRaw.replace(/[^0-9.,-]/g, '')
    const isNegative = amountRaw.trim().startsWith('-')
    const amount = parseAmount(rawNum)
    if (amount <= 0) continue

    results.push({
      date,
      description: activity,
      amount,
      type: isNegative ? 'expense' : 'income',
      categoryId: null,
    })
  }

  return results
}
