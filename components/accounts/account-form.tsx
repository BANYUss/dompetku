'use client'

import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { BANK_CONFIG, type BankType } from '@/lib/bank-config'
import { cn } from '@/lib/utils'

interface AccountFormProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

const BANK_TYPES = Object.keys(BANK_CONFIG) as BankType[]

export function AccountForm({ open, onClose, onSuccess }: AccountFormProps) {
  const [name, setName] = useState('')
  const [bankType, setBankType] = useState<BankType>('OTHER')
  const [displayBalance, setDisplayBalance] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const formatThousands = (raw: string) =>
    raw ? raw.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : ''

  const handleClose = () => {
    setName('')
    setBankType('OTHER')
    setDisplayBalance('')
    setError(null)
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { setError('Nama akun wajib diisi'); return }

    setSubmitting(true)
    setError(null)

    try {
      const balance = displayBalance ? Number(displayBalance.replace(/\./g, '')) : 0
      const res = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), bankType, balance }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error ?? 'Gagal menyimpan akun')
      }
      toast.success('Akun bank berhasil ditambahkan')
      onSuccess()
      handleClose()
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Terjadi kesalahan'
      setError(msg)
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative w-full max-w-md rounded-2xl border border-white/[0.07] bg-[#13131f] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/[0.07]">
          <h2 className="font-display text-base font-bold text-white">Tambah Akun Bank</h2>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/5 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Nama akun */}
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">Nama Akun</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="cth: BCA Utama"
              required
              className="w-full h-10 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 text-sm text-white placeholder-white/20 focus:border-violet-500/50 focus:outline-none"
            />
          </div>

          {/* Bank type grid */}
          <div>
            <label className="block text-xs font-medium text-white/50 mb-2">Tipe Bank</label>
            <div className="grid grid-cols-3 gap-2">
              {BANK_TYPES.map((type) => {
                const cfg = BANK_CONFIG[type]
                const selected = bankType === type
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setBankType(type)}
                    className={cn(
                      'relative flex flex-col items-center justify-center gap-1.5 h-16 rounded-xl border text-xs font-semibold transition-all overflow-hidden',
                      selected
                        ? 'border-white/40 ring-1 ring-white/30 scale-[1.03]'
                        : 'border-white/[0.07] hover:border-white/20',
                    )}
                  >
                    {selected && (
                      <div className={`absolute inset-0 bg-gradient-to-br ${cfg.gradient} opacity-80`} />
                    )}
                    <span className={cn(
                      'relative z-10 w-7 h-7 rounded-lg flex items-center justify-center text-sm font-black',
                      selected ? 'bg-white/20 text-white' : 'bg-white/[0.05] text-white/60',
                    )}>
                      {cfg.logo}
                    </span>
                    <span className={cn('relative z-10 text-[10px]', selected ? 'text-white font-bold' : 'text-white/40')}>
                      {cfg.name}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Saldo awal */}
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">
              Saldo Awal <span className="text-white/20">(opsional)</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-white/40">Rp</span>
              <input
                type="text"
                inputMode="numeric"
                value={displayBalance}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, '')
                  setDisplayBalance(formatThousands(digits))
                }}
                placeholder="0"
                className="w-full h-10 rounded-xl border border-white/[0.07] bg-white/[0.03] pl-9 pr-3 text-sm text-white focus:border-violet-500/50 focus:outline-none"
              />
            </div>
            <p className="mt-1.5 text-[11px] text-white/30">
              Saldo saat ini di akun bank. Kosongkan jika ingin mulai dari 0.
            </p>
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
              {error}
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="secondary" size="md" className="flex-1" onClick={handleClose} disabled={submitting}>
              Batal
            </Button>
            <Button type="submit" variant="primary" size="md" className="flex-1" disabled={submitting}>
              {submitting && <Loader2 size={14} className="animate-spin" />}
              {submitting ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
