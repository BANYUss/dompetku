'use client'

import { useRef, useState } from 'react'
import { Upload, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BANK_CONFIG } from '@/lib/bank-config'
import type { BankParserType } from '@/lib/csv-parsers'

interface DropZoneProps {
  bankType: BankParserType
  onFileSelect: (file: File) => void
  disabled?: boolean
}

export function DropZone({ bankType, onFileSelect, disabled }: DropZoneProps) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const bankName = BANK_CONFIG[bankType]?.name ?? bankType

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) onFileSelect(file)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onFileSelect(file)
    e.target.value = ''
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      className={cn(
        'relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-12 transition-all cursor-pointer',
        dragging
          ? 'border-violet-400 bg-violet-500/[0.08]'
          : 'border-white/[0.10] hover:border-violet-400/40 hover:bg-violet-500/[0.03]',
        disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
      )}
    >
      <div
        className={cn(
          'w-14 h-14 rounded-2xl flex items-center justify-center transition-all',
          dragging ? 'bg-violet-500/20' : 'bg-white/[0.05]',
        )}
      >
        <Upload size={24} className={cn(dragging ? 'text-violet-400' : 'text-white/30')} />
      </div>

      <div className="text-center space-y-1.5">
        <p className="text-sm font-semibold text-white/70">
          Drop file CSV mutasi <span className="text-white">{bankName}</span> di sini
        </p>
        <p className="text-xs text-white/35">atau klik untuk pilih file</p>
      </div>

      <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-violet-700 text-white text-xs font-semibold shadow-sm">
        <FileText size={13} /> Pilih File CSV
      </div>

      <p className="text-[11px] text-white/25">Format didukung: .csv .xls .xlsx</p>

      <input
        ref={inputRef}
        type="file"
        accept=".csv,.xls,.xlsx,text/csv"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  )
}
