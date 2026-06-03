'use client'

import { useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Topbar } from '@/components/layout/topbar'
import { SummaryCards } from '@/components/dashboard/summary-cards'
import { CategoryDonut } from '@/components/dashboard/category-donut'
import { MonthlyTrend } from '@/components/dashboard/monthly-trend'
import { RecentTransactions } from '@/components/dashboard/recent-transactions'
import { AiInsightCard } from '@/components/dashboard/ai-insight-card'
import { currentMonth, formatMonth, prevMonth } from '@/lib/utils'

function getMonthOptions(base: string) {
  const options: string[] = []
  let m = base
  for (let i = 0; i < 12; i++) {
    options.push(m)
    m = prevMonth(m)
  }
  return options
}

function PageSkeleton() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07]">
        <div className="h-5 w-28 rounded bg-white/[0.06] animate-pulse" />
        <div className="h-8 w-28 rounded-xl bg-white/[0.04] animate-pulse" />
      </div>
      <div className="p-6 space-y-5">
        <div className="grid grid-cols-3 gap-4">
          {[0,1,2].map(i => (
            <div key={i} className="rounded-2xl border border-white/[0.07] bg-[#13131f] p-5">
              <div className="h-3 w-24 rounded bg-white/[0.06] animate-pulse mb-3" />
              <div className="h-7 w-36 rounded bg-white/[0.08] animate-pulse" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-[1fr_1.6fr] gap-5">
          <div className="h-64 rounded-2xl border border-white/[0.07] bg-[#13131f] animate-pulse" />
          <div className="h-64 rounded-2xl border border-white/[0.07] bg-[#13131f] animate-pulse" />
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  // Init as null — set in useEffect so server/client always agree (no hydration mismatch)
  const [month, setMonth] = useState<string | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  useEffect(() => {
    setMonth(currentMonth())
  }, [])

  // Show skeleton until client-side month is determined
  if (!month) return <PageSkeleton />

  const monthOptions = getMonthOptions(month)

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Dashboard">
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
        <SummaryCards month={month} />

        <div className="grid grid-cols-[1fr_1.6fr] gap-5">
          <CategoryDonut month={month} />
          <MonthlyTrend />
        </div>

        <div className="grid grid-cols-[1.4fr_1fr] gap-5">
          <RecentTransactions />

          <AiInsightCard month={month} />
        </div>
      </div>
    </div>
  )
}
