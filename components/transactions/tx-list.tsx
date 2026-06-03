'use client'

import { useEffect, useRef, useState } from 'react'
import { Search, ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { formatMonth, prevMonth, nextMonth } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { TxItem } from './tx-item'
import type { Transaction } from '@/types/transaction'

interface TxListProps {
  month: string
  onMonthChange: (m: string) => void
  refreshKey: number
  onAddClick: () => void
  onEdit: (tx: Transaction) => void
}

function Skeleton() {
  return (
    <div className="space-y-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3">
          <div className="w-10 h-10 rounded-xl bg-white/[0.05] animate-pulse shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 w-40 rounded bg-white/[0.05] animate-pulse" />
            <div className="h-2.5 w-24 rounded bg-white/[0.04] animate-pulse" />
          </div>
          <div className="h-4 w-20 rounded bg-white/[0.05] animate-pulse shrink-0" />
        </div>
      ))}
    </div>
  )
}

export function TxList({ month, onMonthChange, refreshKey, onAddClick, onEdit }: TxListProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchTransactions = (m: string, s: string) => {
    setLoading(true)
    const params = new URLSearchParams({ month: m })
    if (s) params.set('search', s)
    fetch(`/api/transactions?${params}`)
      .then((r) => r.json())
      .then((data) => setTransactions(Array.isArray(data) ? data : []))
      .catch(() => setTransactions([]))
      .finally(() => setLoading(false))
  }

  // Fetch on month or refreshKey change (immediate)
  useEffect(() => {
    fetchTransactions(month, search)
  }, [month, refreshKey]) // eslint-disable-line react-hooks/exhaustive-deps

  // Debounce search
  const handleSearchChange = (val: string) => {
    setSearch(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchTransactions(month, val), 300)
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Transaksi berhasil dihapus')
        fetchTransactions(month, search)
      } else {
        toast.error('Gagal menghapus transaksi')
      }
    } catch {
      toast.error('Gagal menghapus transaksi')
    }
  }

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#13131f] overflow-hidden">
      {/* Filter bar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.07]">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Cari transaksi..."
            className="w-full h-9 rounded-xl border border-white/[0.07] bg-white/[0.03] pl-8 pr-3 text-sm text-white placeholder-white/20 focus:border-violet-500/50 focus:outline-none"
          />
        </div>

        {/* Month nav */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onMonthChange(prevMonth(month))}
            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all"
          >
            <ChevronLeft size={15} />
          </button>
          <span className="text-xs font-semibold text-white/70 whitespace-nowrap w-28 text-center">
            {formatMonth(month)}
          </span>
          <button
            onClick={() => onMonthChange(nextMonth(month))}
            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="min-h-[200px]">
        {loading ? (
          <Skeleton />
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-14 text-center px-4">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.04] flex items-center justify-center">
              <span className="text-2xl">📭</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-white/60">Belum ada transaksi</p>
              <p className="text-xs text-white/30 mt-0.5">Bulan {formatMonth(month)}</p>
            </div>
            <Button variant="secondary" size="sm" onClick={onAddClick}>
              <Plus size={14} /> Tambah Transaksi
            </Button>
          </div>
        ) : (
          <div className="py-1">
            {transactions.map((tx) => (
              <TxItem key={tx.id} transaction={tx} onEdit={onEdit} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
