'use client'

import { useState } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { formatRupiah, formatDate, cn } from '@/lib/utils'
import type { ParsedTransaction } from '@/lib/csv-parsers'
import type { Category, Account } from '@/types/transaction'

interface PreviewTableProps {
  transactions: ParsedTransaction[]
  categories: Category[]
  accounts: Account[]
  onUpdate: (index: number, updates: Partial<ParsedTransaction>) => void
  onConfirm: (accountId?: string) => void
  onCancel: () => void
  importing?: boolean
}

export function PreviewTable({
  transactions,
  categories,
  accounts,
  onUpdate,
  onConfirm,
  onCancel,
  importing,
}: PreviewTableProps) {
  const [selectedAccount,  setSelectedAccount]  = useState('')
  const [aiLoading,        setAiLoading]         = useState(false)

  const incomeCount  = transactions.filter((t) => t.type === 'income').length
  const expenseCount = transactions.filter((t) => t.type === 'expense').length

  const handleAiCategorize = async () => {
    setAiLoading(true)
    try {
      const descriptions = transactions.map((t) => t.description || '')
      const res  = await fetch('/api/ai/categorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ descriptions }),
      })
      const data = await res.json()
      const ids: (string | null)[] = data.categoryIds ?? []
      const categorized = ids.filter((id) => id !== null).length
      ids.forEach((id, i) => {
        if (id !== null && id !== undefined) {
          onUpdate(i, { categoryId: id })
        }
      })
      toast.success(`AI berhasil mengkategorisasi ${categorized} transaksi`)
    } catch {
      toast.error('Gagal menghubungi AI. Silakan coba lagi.')
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#13131f] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07]">
        <div>
          <h3 className="font-display text-sm font-bold text-white">
            Preview Transaksi — {transactions.length} ditemukan
          </h3>
          <p className="text-xs text-white/40 mt-0.5">
            {incomeCount} pemasukan · {expenseCount} pengeluaran
          </p>
        </div>

        {/* Action bar */}
        <div className="flex items-center gap-3">
          {accounts.length > 0 && (
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="h-8 rounded-xl border border-white/[0.07] bg-[#0a0a0f] px-3 text-xs text-white focus:border-violet-500/50 focus:outline-none"
            >
              <option value="">— Akun (opsional) —</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          )}

          <Button
            variant="secondary"
            size="sm"
            onClick={handleAiCategorize}
            disabled={aiLoading || importing}
            className="gap-1.5"
          >
            {aiLoading
              ? <><Loader2 size={12} className="animate-spin" /> Mengkategorisasi...</>
              : <><Sparkles size={12} className="text-violet-400" /> Auto-Kategori AI ✨</>
            }
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-y-auto max-h-[420px]">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-[#13131f] border-b border-white/[0.07]">
            <tr>
              <th className="text-left px-5 py-2.5 font-semibold text-white/40 w-28">Tanggal</th>
              <th className="text-left px-3 py-2.5 font-semibold text-white/40">Deskripsi</th>
              <th className="text-left px-3 py-2.5 font-semibold text-white/40 w-44">Kategori</th>
              <th className="text-right px-5 py-2.5 font-semibold text-white/40 w-36">Jumlah</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {transactions.map((tx, i) => {
              const filtered = categories.filter(
                (c) => c.type === tx.type || c.type === 'both',
              )
              return (
                <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-2.5 text-white/50 whitespace-nowrap">
                    {formatDate(tx.date)}
                  </td>
                  <td className="px-3 py-2.5 text-white/80 max-w-[200px]">
                    <span className="block truncate">{tx.description || '—'}</span>
                  </td>
                  <td className="px-3 py-2.5">
                    <select
                      key={`cat-${i}-${categories.length}`}
                      value={tx.categoryId ?? ''}
                      onChange={(e) => onUpdate(i, { categoryId: e.target.value || null })}
                      className="w-full h-7 rounded-lg border border-white/[0.07] bg-[#13131f] px-2 text-[11px] text-white focus:border-violet-500/50 focus:outline-none"
                    >
                      <option value="">— Pilih —</option>
                      {filtered.map((c) => (
                        <option key={c.id} value={c.id}>
                          {`${c.icon} ${c.name}`}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td
                    className={cn(
                      'px-5 py-2.5 text-right font-bold tabular-nums',
                      tx.type === 'income' ? 'text-emerald-400' : 'text-red-400',
                    )}
                  >
                    {tx.type === 'income' ? '+' : '-'}{formatRupiah(tx.amount)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-5 py-4 border-t border-white/[0.07]">
        <span className="text-xs text-white/40">{transactions.length} transaksi siap diimpor</span>
        <div className="flex gap-2">
          <Button variant="secondary" size="md" onClick={onCancel} disabled={importing}>
            Batal
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={() => onConfirm(selectedAccount || undefined)}
            disabled={importing}
          >
            {importing ? 'Mengimpor...' : `Simpan ${transactions.length} Transaksi`}
          </Button>
        </div>
      </div>
    </div>
  )
}
