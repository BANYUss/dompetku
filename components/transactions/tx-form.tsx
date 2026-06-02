'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { Transaction, Category, Account } from '@/types/transaction'

const schema = z.object({
  type: z.enum(['income', 'expense']),
  date: z.string().min(1, 'Tanggal wajib diisi'),
  amount: z.number({ error: 'Jumlah wajib diisi' }).positive('Jumlah harus lebih dari 0'),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  accountId: z.string().optional(),
})
type FormValues = z.infer<typeof schema>

interface TxFormProps {
  open: boolean
  onClose: () => void
  initialData?: Transaction | null
  onSuccess: () => void
}

export function TxForm({ open, onClose, initialData, onSuccess }: TxFormProps) {
  const isEdit = !!initialData
  const [categories, setCategories] = useState<Category[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [displayAmount, setDisplayAmount] = useState('')

  const formatThousands = (raw: string) =>
    raw ? raw.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : ''

  const today = new Date().toISOString().split('T')[0]

  const { register, handleSubmit, watch, setValue, reset, trigger, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: 'expense',
      date: today,
      amount: undefined,
      description: '',
      categoryId: '',
      accountId: '',
    },
  })

  const selectedType = watch('type')

  // Populate form when editing
  useEffect(() => {
    if (initialData) {
      const rawAmount = String(Math.round(initialData.amount))
      reset({
        type: initialData.type,
        date: new Date(initialData.date).toISOString().split('T')[0],
        amount: initialData.amount,
        description: initialData.description ?? '',
        categoryId: initialData.categoryId ?? '',
        accountId: initialData.accountId ?? '',
      })
      setDisplayAmount(formatThousands(rawAmount))
    } else {
      reset({ type: 'expense', date: today, amount: undefined, description: '', categoryId: '', accountId: '' })
      setDisplayAmount('')
    }
  }, [initialData, open]) // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch categories & accounts
  useEffect(() => {
    if (!open) return
    fetch('/api/categories')
      .then((r) => r.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]))

    fetch('/api/accounts')
      .then((r) => r.json())
      .then((data) => setAccounts(Array.isArray(data) ? data : []))
      .catch(() => setAccounts([]))
  }, [open])

  // Reset categoryId when type changes
  useEffect(() => {
    setValue('categoryId', '')
  }, [selectedType, setValue])

  const filteredCategories = categories.filter(
    (c) => c.type === selectedType || c.type === 'both',
  )

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true)
    setError(null)
    try {
      const url = isEdit ? `/api/transactions/${initialData!.id}` : '/api/transactions'
      const method = isEdit ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          categoryId: values.categoryId || undefined,
          accountId: values.accountId || undefined,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Gagal menyimpan transaksi')
      }
      onSuccess()
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Terjadi kesalahan')
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl border border-white/[0.07] bg-[#13131f] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/[0.07]">
          <h2 className="font-display text-base font-bold text-white">
            {isEdit ? 'Edit Transaksi' : 'Tambah Transaksi'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/5 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
          {/* Type toggle */}
          <div className="grid grid-cols-2 gap-2">
            {(['expense', 'income'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setValue('type', t)}
                className={cn(
                  'flex items-center justify-center gap-2 h-11 rounded-xl border text-sm font-semibold transition-all',
                  selectedType === t && t === 'expense'
                    ? 'border-red-500/40 bg-red-500/10 text-red-400'
                    : selectedType === t && t === 'income'
                      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                      : 'border-white/[0.07] bg-transparent text-white/40 hover:border-white/20 hover:text-white/70',
                )}
              >
                {t === 'expense' ? '💸 Pengeluaran' : '💰 Pemasukan'}
              </button>
            ))}
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">Tanggal</label>
            <input
              type="date"
              {...register('date')}
              className="w-full h-10 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 text-sm text-white focus:border-violet-500/50 focus:outline-none [color-scheme:dark]"
            />
            {errors.date && <p className="mt-1 text-xs text-red-400">{errors.date.message}</p>}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">Jumlah</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-white/40">Rp</span>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9.]*"
                value={displayAmount}
                placeholder="0"
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, '')
                  setDisplayAmount(formatThousands(digits))
                  setValue('amount', digits ? Number(digits) : (undefined as unknown as number))
                }}
                onBlur={() => trigger('amount')}
                className="w-full h-10 rounded-xl border border-white/[0.07] bg-white/[0.03] pl-9 pr-3 text-sm text-white focus:border-violet-500/50 focus:outline-none"
              />
            </div>
            {errors.amount && <p className="mt-1 text-xs text-red-400">{errors.amount.message}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">Deskripsi <span className="text-white/20">(opsional)</span></label>
            <input
              type="text"
              {...register('description')}
              placeholder="cth: Grab ke kantor"
              className="w-full h-10 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 text-sm text-white placeholder-white/20 focus:border-violet-500/50 focus:outline-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">Kategori <span className="text-white/20">(opsional)</span></label>
            <select
              {...register('categoryId')}
              className="w-full h-10 rounded-xl border border-white/[0.07] bg-[#13131f] px-3 text-sm text-white focus:border-violet-500/50 focus:outline-none"
            >
              <option value="">— Pilih kategori —</option>
              {filteredCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Account (optional, only show if accounts exist) */}
          {accounts.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5">Akun Bank <span className="text-white/20">(opsional)</span></label>
              <select
                {...register('accountId')}
                className="w-full h-10 rounded-xl border border-white/[0.07] bg-[#13131f] px-3 text-sm text-white focus:border-violet-500/50 focus:outline-none"
              >
                <option value="">— Pilih akun —</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <Button type="button" variant="secondary" size="md" className="flex-1" onClick={onClose} disabled={submitting}>
              Batal
            </Button>
            <Button type="submit" variant="primary" size="md" className="flex-1" disabled={submitting}>
              {submitting ? <Loader2 size={14} className="animate-spin" /> : null}
              {submitting ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
