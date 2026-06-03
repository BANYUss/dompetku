'use client'

import { useEffect, useRef, useState } from 'react'
import { RefreshCw } from 'lucide-react'

interface AiInsightCardProps {
  month: string
}

function InsightSkeleton() {
  return (
    <div className="space-y-3">
      {[80, 60, 90].map((w, i) => (
        <div key={i} className="flex gap-2.5 items-start">
          <div className="w-5 h-5 rounded-full bg-white/[0.06] animate-pulse shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1">
            <div className="h-3 rounded bg-white/[0.05] animate-pulse" style={{ width: `${w}%` }} />
            <div className="h-3 rounded bg-white/[0.04] animate-pulse" style={{ width: '50%' }} />
          </div>
        </div>
      ))}
    </div>
  )
}

export function AiInsightCard({ month }: AiInsightCardProps) {
  const [insights,  setInsights]  = useState<string[]>([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(false)
  // Track which month was last fetched to avoid redundant calls
  const fetchedMonth = useRef<string | null>(null)

  const fetchInsights = (force = false) => {
    // Skip if same month already loaded and not a forced refresh
    if (!force && fetchedMonth.current === month && insights.length > 0) return

    setLoading(true)
    setError(false)

    const url = `/api/ai/insight?month=${month}${force ? '&force=true' : ''}`
    fetch(url)
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.insights) && d.insights.length > 0) {
          setInsights(d.insights)
          fetchedMonth.current = month
        } else {
          setError(true)
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }

  // Only fetch when month changes (not on every render)
  useEffect(() => {
    fetchInsights(false)
  }, [month]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className="rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-emerald-500/5 p-5"
      style={{ animation: 'fadeUp 0.4s ease both', animationDelay: '350ms' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-display text-sm font-bold text-white">AI Insight</h3>
          <span className="bg-gradient-to-r from-violet-500 to-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            Gemini
          </span>
        </div>
        <button
          onClick={() => fetchInsights(true)}
          disabled={loading}
          className="p-1.5 rounded-lg text-white/30 hover:text-violet-400 hover:bg-violet-500/10 transition-all disabled:opacity-30"
          title="Refresh insight (panggil Gemini ulang)"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <InsightSkeleton />
      ) : error ? (
        <p className="text-xs text-white/40 text-center py-4">
          Tidak dapat memuat insight.{' '}
          <button
            onClick={() => fetchInsights(true)}
            className="text-violet-400 hover:underline"
          >
            Coba lagi
          </button>
        </p>
      ) : (
        <ol className="space-y-3">
          {insights.map((insight, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-violet-500/20 text-violet-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </span>
              <p className="text-xs text-white/65 leading-relaxed">{insight}</p>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
