'use client'

import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { Topbar } from '@/components/layout/topbar'
import { Button } from '@/components/ui/button'
import { TxList } from '@/components/transactions/tx-list'
import { TxForm } from '@/components/transactions/tx-form'
import { formatRupiahShort, currentMonth } from '@/lib/utils'
import type { Transaction, Summary } from '@/types/transaction'

function SummaryCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#13131f] px-4 py-3">
      <p className="text-[11px] font-medium text-white/40 mb-1">{label}</p>
      <p className={`text-lg font-bold tabular-nums ${color}`}>
        Rp {formatRupiahShort(Math.abs(value))}
      </p>
    </div>
  )
}

export default function TransactionsPage() {
  const [month, setMonth] = useState(currentMonth)
  const [summary, setSummary] = useState<Summary | null>(null)
  const [openForm, setOpenForm] = useState(false)
  const [editingTx, setEditingTx] = useState<Transaction | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    fetch(`/api/transactions/summary?month=${month}`)
      .then((r) => r.json())
      .then((data) => setSummary(data))
      .catch(() => setSummary(null))
  }, [month, refreshKey])

  const handleAdd = () => {
    setEditingTx(null)
    setOpenForm(true)
  }

  const handleEdit = (tx: Transaction) => {
    setEditingTx(tx)
    setOpenForm(true)
  }

  const handleClose = () => {
    setOpenForm(false)
    setEditingTx(null)
  }

  const handleSuccess = () => {
    setRefreshKey((k) => k + 1)
  }

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Transaksi">
        <Button variant="primary" size="sm" onClick={handleAdd}>
          <Plus size={14} /> Tambah
        </Button>
      </Topbar>

      <div className="p-6 space-y-5 flex-1 overflow-y-auto">
        {/* Summary mini cards */}
        <div className="grid grid-cols-3 gap-3">
          <SummaryCard
            label="Pemasukan"
            value={summary?.income ?? 0}
            color="text-emerald-400"
          />
          <SummaryCard
            label="Pengeluaran"
            value={summary?.expense ?? 0}
            color="text-red-400"
          />
          <SummaryCard
            label="Saldo"
            value={summary?.balance ?? 0}
            color={(summary?.balance ?? 0) >= 0 ? 'text-white' : 'text-red-400'}
          />
        </div>

        {/* Transaction list */}
        <TxList
          month={month}
          onMonthChange={setMonth}
          refreshKey={refreshKey}
          onAddClick={handleAdd}
          onEdit={handleEdit}
        />
      </div>

      {/* Form modal */}
      <TxForm
        open={openForm}
        onClose={handleClose}
        initialData={editingTx}
        onSuccess={handleSuccess}
      />
    </div>
  )
}
