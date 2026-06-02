export interface Category {
  id: string
  name: string
  icon: string
  color: string
  type: 'income' | 'expense' | 'both'
}

export interface Account {
  id: string
  name: string
  bankType: string
  balance: number
}

export interface Transaction {
  id: string
  userId: string
  type: 'income' | 'expense'
  amount: number
  description?: string | null
  date: string
  source: string
  categoryId?: string | null
  accountId?: string | null
  category?: Category | null
  account?: Account | null
  createdAt: string
  updatedAt: string
}

export interface Summary {
  income: number
  expense: number
  balance: number
  month: string
}
