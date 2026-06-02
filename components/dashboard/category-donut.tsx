'use client'

import { useEffect, useState } from 'react'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
} from 'recharts'
import { formatRupiah, formatRupiahShort, formatMonth } from '@/lib/utils'

interface CategoryData {
  categoryId: string
  name: string
  icon: string
  color: string
  total: number
  percentage: number
}

interface CategoryDonutProps {
  month: string
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: CategoryData }> }) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#1a1a2e] px-3 py-2 shadow-xl">
      <p className="text-xs font-semibold text-white">{d.icon} {d.name}</p>
      <p className="text-xs text-white/60 mt-0.5">{formatRupiah(d.total)} · {d.percentage}%</p>
    </div>
  )
}

function CenterLabel({ viewBox, total }: { viewBox?: { cx: number; cy: number }; total: number }) {
  if (!viewBox) return null
  const { cx, cy } = viewBox
  return (
    <g>
      <text x={cx} y={cy - 8} textAnchor="middle" fill="white" style={{ fontSize: 15, fontWeight: 800 }}>
        {formatRupiahShort(total)}
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill="rgba(255,255,255,0.4)" style={{ fontSize: 11 }}>
        total
      </text>
    </g>
  )
}

export function CategoryDonut({ month }: CategoryDonutProps) {
  const [categories, setCategories] = useState<CategoryData[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    setLoading(true)
    fetch(`/api/analytics/by-category?month=${month}`)
      .then((r) => r.json())
      .then((d) => {
        setCategories(d.categories ?? [])
        setTotal(d.total ?? 0)
      })
      .catch(() => { setCategories([]); setTotal(0) })
      .finally(() => setLoading(false))
  }, [month])

  return (
    <div
      className="rounded-2xl border border-white/[0.07] bg-[#13131f] p-5 h-full"
      style={{ animation: 'fadeUp 0.4s ease both', animationDelay: '150ms' }}
    >
      <div className="mb-4">
        <h3 className="font-display text-sm font-bold text-white">Pengeluaran per Kategori</h3>
        <p className="text-xs text-white/40 mt-0.5">{formatMonth(month)}</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-28 h-28 rounded-full border-4 border-white/[0.06] animate-pulse" />
        </div>
      ) : categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 gap-2">
          <span className="text-3xl">💸</span>
          <p className="text-sm text-white/40">Belum ada pengeluaran bulan ini</p>
        </div>
      ) : (
        <div className="flex gap-4 items-center">
          {/* Donut */}
          <div className="shrink-0 w-36 h-36">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categories}
                    dataKey="total"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius="60%"
                    outerRadius="80%"
                    paddingAngle={2}
                    startAngle={90}
                    endAngle={-270}
                  >
                    {categories.map((c) => (
                      <Cell key={c.categoryId} fill={c.color} opacity={0.9} />
                    ))}
                    <CenterLabel total={total} />
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full rounded-full border-4 border-white/[0.06] animate-pulse" />
            )}
          </div>

          {/* Legend */}
          <div className="flex-1 space-y-2 min-w-0">
            {categories.slice(0, 5).map((c) => (
              <div key={c.categoryId} className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: c.color }}
                />
                <span className="text-xs text-white/60 truncate flex-1">{c.icon} {c.name}</span>
                <span className="text-xs font-semibold text-white tabular-nums shrink-0">
                  {c.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
