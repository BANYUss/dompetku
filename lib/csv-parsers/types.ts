export interface ParsedTransaction {
  date: string          // ISO string (noon WIB: ...T05:00:00.000Z)
  description: string
  amount: number        // always positive
  type: 'income' | 'expense'
  categoryId?: string | null
}

export type BankParserType = 'BCA' | 'MANDIRI' | 'GOPAY'
