'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { formatRupiah, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { Transaction } from '@/types/transaction'

export function RecentTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/transactions?limit=5')
      .then((r) => r.json())
      .then((d) => setTransactions(Array.isArray(d) ? d : []))
      .catch(() => setTransactions([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div
      className="rounded-2xl border border-white/[0.07] bg-[#13131f] p-5"
      style={{ animation: 'fadeUp 0.4s ease both', animationDelay: '300ms' }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-sm font-bold text-white">Transaksi Terbaru</h3>
        <Link
          href="/transactions"
          className="flex items-center gap-1 text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors"
        >
          Lihat semua <ArrowRight size={12} />
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/[0.05] animate-pulse shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-32 rounded bg-white/[0.05] animate-pulse" />
                <div className="h-2 w-20 rounded bg-white/[0.04] animate-pulse" />
              </div>
              <div className="h-3.5 w-16 rounded bg-white/[0.05] animate-pulse shrink-0" />
            </div>
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 gap-2">
          <span className="text-2xl">📭</span>
          <p className="text-xs text-white/40">Belum ada transaksi</p>
        </div>
      ) : (
        <div className="space-y-1">
          {transactions.map((tx) => {
            const isIncome = tx.type === 'income'
            const label = tx.description || tx.category?.name || '—'
            return (
              <div key={tx.id} className="flex items-center gap-3 py-2 px-2 rounded-xl hover:bg-white/[0.03] transition-all">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0"
                  style={{ backgroundColor: `${tx.category?.color ?? '#7c6af7'}1f` }}
                >
                  {tx.category?.icon ?? '💳'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{label}</p>
                  <p className="text-[10px] text-white/35">{formatDate(tx.date)}</p>
                </div>
                <span
                  className={cn(
                    'text-xs font-bold tabular-nums shrink-0',
                    isIncome ? 'text-emerald-400' : 'text-red-400',
                  )}
                >
                  {isIncome ? '+' : '-'}{formatRupiah(tx.amount)}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
