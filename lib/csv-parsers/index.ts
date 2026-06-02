export { parseBCA } from './bca'
export { parseMandiri } from './mandiri'
export { parseGoPay } from './gopay'
export type { ParsedTransaction, BankParserType } from './types'

import { parseBCA } from './bca'
import { parseMandiri } from './mandiri'
import { parseGoPay } from './gopay'
import type { ParsedTransaction, BankParserType } from './types'

export function parseCSV(csvText: string, bankType: BankParserType): ParsedTransaction[] {
  switch (bankType) {
    case 'BCA':     return parseBCA(csvText)
    case 'MANDIRI': return parseMandiri(csvText)
    case 'GOPAY':   return parseGoPay(csvText)
    default:        throw new Error(`Bank type "${bankType}" belum didukung`)
  }
}
