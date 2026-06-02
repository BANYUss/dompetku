'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Topbar } from '@/components/layout/topbar'
import { SummaryCards } from '@/components/dashboard/summary-cards'
import { CategoryDonut } from '@/components/dashboard/category-donut'
import { MonthlyTrend } from '@/components/dashboard/monthly-trend'
import { RecentTransactions } from '@/components/dashboard/recent-transactions'
import { currentMonth, formatMonth, prevMonth } from '@/lib/utils'

// Build dropdown options: current month + 11 months back
function getMonthOptions() {
  const options: string[] = []
  for (let i = 0; i < 12; i++) {
    let m = currentMonth()
    for (let j = 0; j < i; j++) m = prevMonth(m)
    options.push(m)
  }
  return options
}

export default function DashboardPage() {
  const [month, setMonth] = useState(currentMonth)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const monthOptions = getMonthOptions()

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Dashboard">
        {/* Month selector */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen((o) => !o)}
            className="flex items-center gap-2 h-8 px-3 rounded-xl border border-white/[0.07] bg-white/[0.03] text-xs font-semibold text-white/70 hover:border-white/[0.12] hover:text-white transition-all"
          >
            {formatMonth(month)}
            <ChevronDown size={12} className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
              <div className="absolute right-0 top-9 z-20 w-44 rounded-xl border border-white/[0.07] bg-[#13131f] shadow-2xl overflow-hidden py-1">
                {monthOptions.map((m) => (
                  <button
                    key={m}
                    onClick={() => { setMonth(m); setDropdownOpen(false) }}
                    className={`w-full text-left px-3 py-2 text-xs transition-colors ${
                      m === month
                        ? 'bg-violet-500/10 text-violet-400 font-semibold'
                        : 'text-white/60 hover:bg-white/[0.04] hover:text-white'
                    }`}
                  >
                    {formatMonth(m)}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </Topbar>

      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* Summary cards */}
        <SummaryCards month={month} />

        {/* Charts row */}
        <div className="grid grid-cols-[1fr_1.6fr] gap-5">
          <CategoryDonut month={month} />
          <MonthlyTrend />
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-[1.4fr_1fr] gap-5">
          <RecentTransactions />

          {/* AI Insight placeholder */}
          <div
            className="rounded-2xl border border-dashed border-violet-500/20 bg-violet-500/[0.03] p-5 flex flex-col items-center justify-center gap-3"
            style={{ animation: 'fadeUp 0.4s ease both', animationDelay: '350ms' }}
          >
            <div className="w-10 h-10 rounded-2xl bg-violet-500/10 flex items-center justify-center">
              <span className="text-xl">🤖</span>
            </div>
            <div className="text-center">
              <p className="text-xs font-semibold text-violet-400">AI Insight</p>
              <p className="text-[11px] text-white/30 mt-0.5">Coming in CHUNK-10</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
