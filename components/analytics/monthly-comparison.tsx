'use client'

import { useEffect, useState } from 'react'
import { formatRupiah, formatMonth, currentMonth, prevMonth } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface Summary { income: number; expense: number; balance: number }

function getMonthOptions() {
  const opts: string[] = []
  let m = currentMonth()
  for (let i = 0; i < 12; i++) { opts.push(m); m = prevMonth(m) }
  return opts
}

function DiffCell({ a, b, invert = false }: { a: number; b: number; invert?: boolean }) {
  const diff = b - a
  // For expense: spending more (diff > 0) is bad → invert colors
  const isPositive = invert ? diff < 0 : diff > 0
  if (diff === 0) return <span className="text-white/30 text-xs">—</span>
  return (
    <span className={cn('text-xs font-semibold tabular-nums', isPositive ? 'text-emerald-400' : 'text-red-400')}>
      {isPositive ? '↑' : '↓'} {formatRupiah(Math.abs(diff))}
    </span>
  )
}

function MonthSelect({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-7 rounded-lg border border-white/[0.07] bg-[#0a0a0f] px-2 text-[11px] text-white focus:border-violet-500/50 focus:outline-none"
    >
      {options.map((m) => <option key={m} value={m}>{formatMonth(m)}</option>)}
    </select>
  )
}

export function MonthlyComparison() {
  const monthOptions = getMonthOptions()
  const [monthA, setMonthA] = useState(monthOptions[0])
  const [monthB, setMonthB] = useState(monthOptions[1])
  const [dataA,  setDataA]  = useState<Summary | null>(null)
  const [dataB,  setDataB]  = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      fetch(`/api/transactions/summary?month=${monthA}`).then(r => r.json()),
      fetch(`/api/transactions/summary?month=${monthB}`).then(r => r.json()),
    ])
      .then(([a, b]) => { setDataA(a); setDataB(b) })
      .catch(() => { setDataA(null); setDataB(null) })
      .finally(() => setLoading(false))
  }, [monthA, monthB])

  const rows = [
    { label: 'Pemasukan',   keyA: dataA?.income,   keyB: dataB?.income,   invert: false, color: 'text-emerald-400' },
    { label: 'Pengeluaran', keyA: dataA?.expense,  keyB: dataB?.expense,  invert: true,  color: 'text-red-400'     },
    { label: 'Saldo',       keyA: dataA?.balance,  keyB: dataB?.balance,  invert: false, color: 'text-white'       },
  ]

  return (
    <div
      className="rounded-2xl border border-white/[0.07] bg-[#13131f] p-5"
      style={{ animation: 'fadeUp 0.4s ease both', animationDelay: '100ms' }}
    >
      <h3 className="font-display text-sm font-bold text-white mb-4">Perbandingan Bulan</h3>

      {/* Month selectors */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <MonthSelect value={monthA} onChange={setMonthA} options={monthOptions} />
        <span className="text-white/30 text-xs">vs</span>
        <MonthSelect value={monthB} onChange={setMonthB} options={monthOptions} />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[0,1,2].map(i => (
            <div key={i} className="flex gap-3">
              <div className="h-4 w-24 rounded bg-white/[0.05] animate-pulse" />
              <div className="h-4 w-20 rounded bg-white/[0.05] animate-pulse ml-auto" />
              <div className="h-4 w-20 rounded bg-white/[0.05] animate-pulse" />
              <div className="h-4 w-16 rounded bg-white/[0.05] animate-pulse" />
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-white/30">
                <th className="text-left pb-2 font-medium">Kategori</th>
                <th className="text-right pb-2 font-medium">{formatMonth(monthA)}</th>
                <th className="text-right pb-2 font-medium">{formatMonth(monthB)}</th>
                <th className="text-right pb-2 font-medium">Selisih</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {rows.map(({ label, keyA, keyB, invert, color }) => (
                <tr key={label}>
                  <td className="py-2.5 font-semibold text-white/70">{label}</td>
                  <td className={cn('py-2.5 text-right tabular-nums font-semibold', color)}>
                    {keyA != null ? formatRupiah(keyA) : '—'}
                  </td>
                  <td className="py-2.5 text-right tabular-nums text-white/50">
                    {keyB != null ? formatRupiah(keyB) : '—'}
                  </td>
                  <td className="py-2.5 text-right">
                    {keyA != null && keyB != null
                      ? <DiffCell a={keyA} b={keyB} invert={invert} />
                      : <span className="text-white/20">—</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
