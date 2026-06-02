'use client'

import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts'
import { formatRupiah, formatRupiahShort } from '@/lib/utils'

interface MonthData {
  month: string
  monthFull: string
  income: number
  expense: number
}

const CustomTooltip = ({
  active, payload, label,
}: {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
}) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#1a1a2e] px-3 py-2.5 shadow-xl space-y-1">
      <p className="text-[11px] font-bold text-white/50 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="text-xs font-semibold" style={{ color: p.color }}>
          {p.name === 'income' ? 'Pemasukan' : 'Pengeluaran'}: {formatRupiah(p.value)}
        </p>
      ))}
    </div>
  )
}

export function MonthlyTrend() {
  const [data, setData] = useState<MonthData[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    fetch('/api/analytics/monthly-trend?months=6')
      .then((r) => r.json())
      .then((d) => setData(Array.isArray(d) ? d : []))
      .catch(() => setData([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div
      className="rounded-2xl border border-white/[0.07] bg-[#13131f] p-5 h-full"
      style={{ animation: 'fadeUp 0.4s ease both', animationDelay: '250ms' }}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-display text-sm font-bold text-white">Tren Bulanan</h3>
          <p className="text-xs text-white/40 mt-0.5">6 bulan terakhir</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-[11px] text-white/50">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />Pemasukan
          </span>
          <span className="flex items-center gap-1.5 text-[11px] text-white/50">
            <span className="w-2 h-2 rounded-full bg-red-400" />Pengeluaran
          </span>
        </div>
      </div>

      {loading ? (
        <div className="flex items-end gap-2 h-44 px-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-lg bg-white/[0.05] animate-pulse"
              style={{ height: `${30 + Math.random() * 60}%` }}
            />
          ))}
        </div>
      ) : (
        <div className="h-44">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} barSize={10} barGap={3}>
                <defs>
                  <linearGradient id="incGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34d399" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.7} />
                  </linearGradient>
                  <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f87171" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity={0.7} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10 }}
                  tickFormatter={(v) => formatRupiahShort(v)}
                  width={48}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)', radius: 6 } as object} />
                <Bar dataKey="income" fill="url(#incGrad)" radius={[4, 4, 0, 0]}>
                  {data.map((_, i) => <Cell key={i} />)}
                </Bar>
                <Bar dataKey="expense" fill="url(#expGrad)" radius={[4, 4, 0, 0]}>
                  {data.map((_, i) => <Cell key={i} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-end gap-2 h-full px-2">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="flex-1 rounded-t-lg bg-white/[0.05] animate-pulse" style={{ height: '60%' }} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
