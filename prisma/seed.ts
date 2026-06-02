import { config } from 'dotenv'
import { resolve } from 'path'
import { Pool } from '@neondatabase/serverless'

config({ path: resolve(process.cwd(), '.env') })

const defaultCategories = [
  // Expense
  { name: 'Makanan & Minuman', icon: '🍜', color: '#fbbf24', type: 'expense' },
  { name: 'Transport', icon: '🚗', color: '#7c6af7', type: 'expense' },
  { name: 'Belanja', icon: '🛒', color: '#22d3a5', type: 'expense' },
  { name: 'Tagihan & Utilitas', icon: '💡', color: '#f87171', type: 'expense' },
  { name: 'Kesehatan', icon: '🏥', color: '#34d399', type: 'expense' },
  { name: 'Hiburan', icon: '🎮', color: '#a78bfa', type: 'expense' },
  { name: 'Langganan', icon: '📱', color: '#fb923c', type: 'expense' },
  { name: 'Pendidikan', icon: '📚', color: '#60a5fa', type: 'expense' },
  { name: 'Lainnya', icon: '📦', color: '#94a3b8', type: 'expense' },
  // Income
  { name: 'Gaji', icon: '💼', color: '#22d3a5', type: 'income' },
  { name: 'Freelance', icon: '💻', color: '#34d399', type: 'income' },
  { name: 'Investasi', icon: '📈', color: '#a78bfa', type: 'income' },
  { name: 'Hadiah', icon: '🎁', color: '#f472b6', type: 'income' },
  { name: 'Pemasukan Lain', icon: '💰', color: '#94a3b8', type: 'income' },
]

async function main() {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) throw new Error('DATABASE_URL is not set in .env')

  const pool = new Pool({ connectionString: dbUrl })
  console.log('🌱 Seeding default categories...')

  try {
    for (const cat of defaultCategories) {
      const id = `default-${cat.name}`
      await pool.query(
        `INSERT INTO "Category" (id, "userId", name, icon, color, type)
         VALUES ($1, NULL, $2, $3, $4, $5::"CategoryType")
         ON CONFLICT (id) DO NOTHING`,
        [id, cat.name, cat.icon, cat.color, cat.type]
      )
    }
    console.log(`✅ ${defaultCategories.length} categories seeded`)
  } finally {
    await pool.end()
  }
}

main().catch((e) => {
  console.error('Seed error:', e.message)
  process.exit(1)
})
