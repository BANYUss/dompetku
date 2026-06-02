'use client'

import { Trash2 } from 'lucide-react'
import { formatRupiah } from '@/lib/utils'
import { BANK_CONFIG, type BankType } from '@/lib/bank-config'
import type { Account } from '@/types/transaction'

interface AccountCardProps {
  account: Account
  onDelete: (id: string) => void
}

export function AccountCard({ account, onDelete }: AccountCardProps) {
  const cfg = BANK_CONFIG[(account.bankType as BankType) ?? 'OTHER'] ?? BANK_CONFIG.OTHER

  return (
    <div
      className={`relative rounded-2xl bg-gradient-to-br ${cfg.gradient} p-5 overflow-hidden flex flex-col min-h-[168px] shadow-lg`}
    >
      {/* Subtle pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.4) 0%, transparent 60%)',
        }}
      />

      {/* Header row */}
      <div className="relative flex items-start justify-between">
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white text-lg font-black select-none">
          {cfg.logo}
        </div>
        <button
          onClick={() => onDelete(account.id)}
          className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/15 transition-all"
          title="Hapus akun"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Account info */}
      <div className="relative mt-3 flex-1">
        <p className="font-display text-lg font-bold text-white leading-tight">{account.name}</p>
        <p className="text-[11px] text-white/60 uppercase tracking-wider mt-0.5">{cfg.name}</p>
      </div>

      {/* Balance */}
      <div className="relative mt-5">
        <p className="text-[10px] text-white/50 uppercase tracking-widest mb-1">Saldo</p>
        <p className="font-display text-2xl font-black text-white tabular-nums">
          {formatRupiah(account.balance)}
        </p>
      </div>
    </div>
  )
}
