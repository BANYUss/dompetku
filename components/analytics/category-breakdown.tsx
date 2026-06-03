'use client'

import { useEffect, useState } from 'react'
import { formatRupiah, formatMonth } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface CategoryData {
  categoryId: string
  name: string
  icon: string
  color: string
  total: number
  percentage: number
}

interface CategoryBreakdownProps {
  month: string
}

function Skeleton() {
  return (
    <div className="space-y-3">
      {[70, 55, 45, 30, 20].map((w, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-white/[0.05] animate-pulse shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 rounded bg-white/[0.05] animate-pulse" style={{ width: `${w}%` }} />
            <div className="h-2 rounded bg-white/[0.04] animate-pulse" style={{ width: '40%' }} />
          </div>
          <div className="h-3 w-20 rounded bg-white/[0.05] animate-pulse shrink-0" />
        </div>
      ))}
    </div>
  )
}

export function CategoryBreakdown({ month }: CategoryBreakdownProps) {
  const [type,       setType]       = useState<'expense' | 'income'>('expense')
  const [categories, setCategories] = useState<CategoryData[]>([])
  const [total,      setTotal]      = useState(0)
  const [loading,    setLoading]    = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/analytics/by-category?month=${month}&type=${type}`)
      .then((r) => r.json())
      .then((d) => { setCategories(d.categories ?? []); setTotal(d.total ?? 0) })
      .catch(() => { setCategories([]); setTotal(0) })
      .finally(() => setLoading(false))
  }, [month, type])

  return (
    <div
      className="rounded-2xl border border-white/[0.07] bg-[#13131f] p-5"
      style={{ animation: 'fadeUp 0.4s ease both' }}
    >
      {/* Header + toggle */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-display text-sm font-bold text-white">Breakdown per Kategori</h3>
          <p className="text-xs text-white/40 mt-0.5">{formatMonth(month)}</p>
        </div>
        <div className="flex rounded-xl border border-white/[0.07] overflow-hidden">
          {(['expense', 'income'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={cn(
                'px-3 py-1.5 text-xs font-semibold transition-all',
                type === t
                  ? t === 'expense'
                    ? 'bg-red-500/10 text-red-400'
                    : 'bg-emerald-500/10 text-emerald-400'
                  : 'text-white/40 hover:text-white/70',
              )}
            >
              {t === 'expense' ? 'Pengeluaran' : 'Pemasukan'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Skeleton />
      ) : categories.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-10">
          <span className="text-3xl">{type === 'expense' ? '💸' : '💰'}</span>
          <p className="text-sm text-white/40">
            Belum ada {type === 'expense' ? 'pengeluaran' : 'pemasukan'} bulan ini
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map((c) => (
            <div
              key={c.categoryId}
              className="group flex items-center gap-3 py-1.5 rounded-xl hover:bg-white/[0.02] transition-all px-1"
            >
              {/* Icon */}
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0"
                style={{ backgroundColor: `${c.color}20` }}
              >
                {c.icon}
              </div>

              {/* Name + bar */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-white truncate">{c.name}</span>
                  <span className="text-[10px] text-white/40 ml-2 shrink-0">{c.percentage}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${c.percentage}%`, backgroundColor: c.color }}
                  />
                </div>
              </div>

              {/* Amount */}
              <span
                className={cn(
                  'text-xs font-bold tabular-nums shrink-0 ml-2',
                  type === 'expense' ? 'text-red-400' : 'text-emerald-400',
                )}
              >
                {formatRupiah(c.total)}
              </span>
            </div>
          ))}

          {/* Total */}
          <div className="mt-3 pt-3 border-t border-white/[0.07] flex justify-between">
            <span className="text-xs text-white/40">Total</span>
            <span
              className={cn(
                'text-xs font-bold tabular-nums',
                type === 'expense' ? 'text-red-400' : 'text-emerald-400',
              )}
            >
              {formatRupiah(total)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
