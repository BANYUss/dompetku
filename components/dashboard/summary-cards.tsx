'use client'

import { useEffect, useState } from 'react'
import { formatRupiah } from '@/lib/utils'
import type { Summary } from '@/types/transaction'

interface SummaryCardsProps {
  month: string
}

function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#13131f] p-5">
      <div className="h-3 w-24 rounded bg-white/[0.06] animate-pulse mb-3" />
      <div className="h-7 w-36 rounded bg-white/[0.08] animate-pulse" />
    </div>
  )
}

export function SummaryCards({ month }: SummaryCardsProps) {
  const [data, setData] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/transactions/summary?month=${month}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [month])

  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-4">
        <CardSkeleton /><CardSkeleton /><CardSkeleton />
      </div>
    )
  }

  const income = data?.income ?? 0
  const expense = data?.expense ?? 0
  const balance = data?.balance ?? 0
  const surplus = balance >= 0

  const cards = [
    {
      label: 'PEMASUKAN',
      dot: 'bg-emerald-400',
      value: formatRupiah(income),
      valueColor: 'text-emerald-400',
      cardClass: 'border-white/[0.07] bg-[#13131f]',
      delay: 0,
      sub: null,
    },
    {
      label: 'PENGELUARAN',
      dot: 'bg-red-400',
      value: formatRupiah(expense),
      valueColor: 'text-red-400',
      cardClass: 'border-white/[0.07] bg-[#13131f]',
      delay: 100,
      sub: null,
    },
    {
      label: 'SALDO BERSIH',
      dot: 'bg-violet-400',
      value: formatRupiah(Math.abs(balance)),
      valueColor: null, // gradient
      cardClass: 'border-violet-500/30 bg-gradient-to-br from-violet-500/10 to-emerald-500/10',
      delay: 200,
      sub: surplus ? 'Surplus' : 'Defisit',
    },
  ]

  return (
    <div className="grid grid-cols-3 gap-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className={`rounded-2xl border p-5 transition-all duration-200 hover:border-white/[0.15] hover:-translate-y-0.5 ${c.cardClass}`}
          style={{ animation: 'fadeUp 0.4s ease both', animationDelay: `${c.delay}ms` }}
        >
          <div className="flex items-center gap-1.5 mb-3">
            <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
            <span className="text-[10px] font-bold tracking-widest text-white/40">{c.label}</span>
          </div>

          {c.valueColor ? (
            <p className={`font-display text-2xl font-black tracking-tight tabular-nums ${c.valueColor}`}>
              {!balance && balance !== 0 ? '—' : (balance < 0 ? '-' : '')}{c.value}
            </p>
          ) : (
            <p className="font-display text-2xl font-black tracking-tight tabular-nums bg-gradient-to-r from-violet-400 to-emerald-400 bg-clip-text text-transparent">
              {balance < 0 ? '-' : ''}{c.value}
            </p>
          )}

          {c.sub && (
            <span
              className={`mt-2 inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${
                surplus
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'bg-red-500/10 text-red-400'
              }`}
            >
              {c.sub}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}
