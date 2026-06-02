import { Pencil, Trash2 } from 'lucide-react'
import { cn, formatRupiah, formatDate } from '@/lib/utils'
import type { Transaction } from '@/types/transaction'

interface TxItemProps {
  transaction: Transaction
  onEdit: (tx: Transaction) => void
  onDelete: (id: string) => void
}

export function TxItem({ transaction: tx, onEdit, onDelete }: TxItemProps) {
  const isIncome = tx.type === 'income'
  const label = tx.description || tx.category?.name || '—'
  const sub = [tx.category?.name, formatDate(tx.date)].filter(Boolean).join(' · ')

  const handleDelete = () => {
    if (window.confirm(`Hapus transaksi "${label}"?`)) {
      onDelete(tx.id)
    }
  }

  return (
    <div className="group flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/[0.03] transition-all">
      {/* Category icon */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
        style={{ backgroundColor: `${tx.category?.color ?? '#7c6af7'}1f` }}
      >
        {tx.category?.icon ?? '💳'}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate">{label}</p>
        <p className="text-xs text-white/40 truncate">{sub}</p>
      </div>

      {/* Amount */}
      <span
        className={cn(
          'text-sm font-bold tabular-nums shrink-0',
          isIncome ? 'text-emerald-400' : 'text-red-400',
        )}
      >
        {isIncome ? '+' : '-'}{formatRupiah(tx.amount)}
      </span>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button
          onClick={() => onEdit(tx)}
          className="p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/5 transition-all"
          title="Edit"
        >
          <Pencil size={13} />
        </button>
        <button
          onClick={handleDelete}
          className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all"
          title="Hapus"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )
}
