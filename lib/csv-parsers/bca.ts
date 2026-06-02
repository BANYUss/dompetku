import Papa from 'papaparse'
import { parseAmount, parseDateDMY, col } from './utils'
import type { ParsedTransaction } from './types'

export function parseBCA(csvText: string): ParsedTransaction[] {
  const lines = csvText.split('\n')

  // Find the header line that has "Tanggal" + "Keterangan" (or "Ket")
  const headerIdx = lines.findIndex((l) => {
    const lower = l.toLowerCase()
    return lower.includes('tanggal') && (lower.includes('keterangan') || lower.includes('ket'))
  })
  if (headerIdx === -1) throw new Error('Format CSV BCA tidak dikenali — baris header tidak ditemukan')

  const relevant = lines.slice(headerIdx).join('\n')
  const { data } = Papa.parse<Record<string, string>>(relevant, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  })

  const results: ParsedTransaction[] = []

  for (const row of data) {
    const tanggal  = col(row, 'tanggal', 'tgl', 'date')
    const ket      = col(row, 'keterangan', 'ket', 'narasi', 'deskripsi', 'description')
    const jumlah   = col(row, 'jumlah', 'nominal', 'amount', 'mutasi')

    if (!tanggal || !jumlah) continue

    const date = parseDateDMY(tanggal)
    if (!date) continue

    const raw = jumlah.toUpperCase()
    const isCR = raw.includes('CR') || raw.includes('K')  // Kredit
    const isDB = raw.includes('DB') || raw.includes('D')  // Debit
    if (!isCR && !isDB) continue

    const amount = parseAmount(jumlah)
    if (amount <= 0) continue

    results.push({
      date,
      description: ket,
      amount,
      type: isCR ? 'income' : 'expense',
      categoryId: null,
    })
  }

  return results
}
