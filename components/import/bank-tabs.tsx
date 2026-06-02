'use client'

import { cn } from '@/lib/utils'
import { BANK_CONFIG } from '@/lib/bank-config'
import type { BankParserType } from '@/lib/csv-parsers'

const SUPPORTED: BankParserType[] = ['BCA', 'MANDIRI', 'GOPAY']

interface BankTabsProps {
  selected: BankParserType | null
  onSelect: (bank: BankParserType) => void
}

export function BankTabs({ selected, onSelect }: BankTabsProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {SUPPORTED.map((bank) => {
        const cfg      = BANK_CONFIG[bank]
        const isActive = selected === bank
        return (
          <button
            key={bank}
            onClick={() => onSelect(bank)}
            className={cn(
              'relative flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all overflow-hidden',
              isActive
                ? 'border-violet-400/50 bg-violet-500/10 text-white'
                : 'border-white/[0.07] bg-white/[0.02] text-white/50 hover:border-white/20 hover:text-white/80',
            )}
          >
            <span
              className={cn(
                'w-9 h-9 rounded-xl flex items-center justify-center text-base font-black transition-all',
                isActive
                  ? `bg-gradient-to-br ${cfg.gradient} text-white`
                  : 'bg-white/[0.05] text-white/40',
              )}
            >
              {cfg.logo}
            </span>
            <div className="text-left">
              <p className="text-sm font-semibold">{cfg.name}</p>
              <p className={cn('text-[11px]', isActive ? 'text-violet-300/70' : 'text-white/30')}>
                Mutasi rekening
              </p>
            </div>
            {isActive && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-violet-400" />
            )}
          </button>
        )
      })}
    </div>
  )
}
