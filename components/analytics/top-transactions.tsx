'use client'

import { useEffect, useState } from 'react'
import { formatRupiah, formatDate, formatMonth, cn } from '@/lib/utils'
import type { Transaction } from '@/types/transaction'

interface TopTransactionsProps {
  month: string
}

export function TopTransactions({ month }: TopTransactionsProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading,      setLoading]      = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/transactions?month=${month}`)
      .then((r) => r.json())
      .then((d: Transaction[]) => {
        const sorted = [...(Array.isArray(d) ? d : [])]
          .sort((a, b) => b.amount - a.amount)
          .slice(0, 5)
        setTransactions(sorted)
      })
      .catch(() => setTransactions([]))
      .finally(() => setLoading(false))
  }, [month])

  return (
    <div
      className="rounded-2xl border border-white/[0.07] bg-[#13131f] p-5"
      style={{ animation: 'fadeUp 0.4s ease both', animationDelay: '200ms' }}
    >
      <div className="mb-4">
        <h3 className="font-display text-sm font-bold text-white">Transaksi Terbesar</h3>
        <p className="text-xs text-white/40 mt-0.5">{formatMonth(month)}</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[0,1,2,3,4].map(i => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-white/[0.05] animate-pulse shrink-0" />
              <div className="w-9 h-9 rounded-xl bg-white/[0.05] animate-pulse shrink-0" />
              <div className="flex-1 space-y-1">
                <div className="h-3 w-32 rounded bg-white/[0.05] animate-pulse" />
                <div className="h-2 w-20 rounded bg-white/[0.04] animate-pulse" />
              </div>
              <div className="h-3 w-20 rounded bg-white/[0.05] animate-pulse shrink-0" />
            </div>
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-10">
          <span className="text-3xl">📭</span>
          <p className="text-sm text-white/40">Belum ada transaksi bulan ini</p>
        </div>
      ) : (
        <div className="space-y-1">
          {transactions.map((tx, i) => {
            const isIncome = tx.type === 'income'
            const label    = tx.description || tx.category?.name || '—'
            return (
              <div key={tx.id} className="flex items-center gap-3 py-2 px-1 rounded-xl hover:bg-white/[0.02] transition-all">
                {/* Rank */}
                <span className="w-5 h-5 rounded-full bg-white/[0.06] text-[10px] font-bold text-white/40 flex items-center justify-center shrink-0">
                  {i + 1}
                </span>

                {/* Icon */}
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0"
                  style={{ backgroundColor: `${tx.category?.color ?? '#7c6af7'}1f` }}
                >
                  {tx.category?.icon ?? '💳'}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{label}</p>
                  <p className="text-[10px] text-white/35">{formatDate(tx.date)}</p>
                </div>

                {/* Amount */}
                <span className={cn('text-xs font-bold tabular-nums shrink-0', isIncome ? 'text-emerald-400' : 'text-red-400')}>
                  {formatRupiah(tx.amount)}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
