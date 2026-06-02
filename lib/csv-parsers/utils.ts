// Parse Indonesian/standard bank amount strings to integer.
// Handles all variants:
//   "8.400.000,00 CR" → 8400000
//   "8400000.00 CR"   → 8400000
//   "32.000,00 DB"    → 32000
//   "32000.00"        → 32000
//   "250000"          → 250000
export function parseAmount(raw: string): number {
  if (!raw) return 0
  let s = raw.trim()
  s = s.replace(/[A-Za-z]+/g, '').trim()           // strip CR/DB/etc
  s = s.replace(/,\d*$/, '')                        // strip decimal comma  "8.400.000,00" → "8.400.000"
  s = s.replace(/\.\d*$/, '')                       // strip decimal dot    "8400000.00"   → "8400000"
  s = s.replace(/\./g, '')                          // remove remaining dots (thousands sep)
  s = s.replace(/[^0-9]/g, '')                      // strip any leftover
  return parseInt(s, 10) || 0
}

// Parse "DD/MM/YYYY" or "DD-MM-YYYY" → ISO string at noon WIB (+7)
export function parseDateDMY(raw: string): string | null {
  const trimmed = raw.trim()
  const parts = trimmed.split(/[\/\-]/).map(Number)
  if (parts.length < 3 || parts.some(isNaN)) return null
  const [d, m, y] = parts
  const year = y < 100 ? 2000 + y : y
  if (m < 1 || m > 12 || d < 1 || d > 31) return null
  // noon WIB (UTC+7) = 05:00 UTC
  return new Date(Date.UTC(year, m - 1, d, 5, 0, 0)).toISOString()
}

// Parse "YYYY-MM-DD" → ISO string at noon WIB
export function parseDateYMD(raw: string): string | null {
  const trimmed = raw.trim()
  const parts = trimmed.split(/[\/\-]/).map(Number)
  if (parts.length < 3 || parts.some(isNaN)) return null
  const [y, m, d] = parts
  if (m < 1 || m > 12 || d < 1 || d > 31) return null
  return new Date(Date.UTC(y, m - 1, d, 5, 0, 0)).toISOString()
}

// Find a column value case-insensitively from multiple possible names
export function col(row: Record<string, string>, ...names: string[]): string {
  for (const key of Object.keys(row)) {
    if (names.some(n => key.trim().toLowerCase().includes(n.toLowerCase()))) {
      return (row[key] ?? '').trim()
    }
  }
  return ''
}
