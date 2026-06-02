import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const STEPS = [
  { n: 1, label: 'Pilih Bank' },
  { n: 2, label: 'Upload File' },
  { n: 3, label: 'Kategorisasi' },
  { n: 4, label: 'Konfirmasi' },
]

interface StepIndicatorProps {
  currentStep: 1 | 2 | 3 | 4
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-0">
      {STEPS.map(({ n, label }, i) => {
        const done   = n < currentStep
        const active = n === currentStep
        return (
          <div key={n} className="flex items-center flex-1 last:flex-none">
            {/* Dot + label */}
            <div className="flex flex-col items-center gap-1.5 shrink-0">
              <div
                className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all',
                  done   && 'border-emerald-500 bg-emerald-500/20 text-emerald-400',
                  active && 'border-violet-400 bg-violet-400/10 text-violet-400',
                  !done && !active && 'border-white/20 bg-transparent text-white/30',
                )}
              >
                {done ? <Check size={13} /> : n}
              </div>
              <span
                className={cn(
                  'text-[10px] font-semibold whitespace-nowrap',
                  done   && 'text-emerald-400',
                  active && 'text-violet-400',
                  !done && !active && 'text-white/30',
                )}
              >
                {label}
              </span>
            </div>

            {/* Connector line */}
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-px mx-2 mb-5 transition-all',
                  done ? 'bg-emerald-500/40' : 'bg-white/[0.07]',
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
