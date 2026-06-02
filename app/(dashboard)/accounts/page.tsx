'use client'

import { useEffect, useState } from 'react'
import { Plus, Landmark } from 'lucide-react'
import { Topbar } from '@/components/layout/topbar'
import { Button } from '@/components/ui/button'
import { AccountCard } from '@/components/accounts/account-card'
import { AccountForm } from '@/components/accounts/account-form'
import { formatRupiah } from '@/lib/utils'
import type { Account } from '@/types/transaction'

function SkeletonCard() {
  return (
    <div className="rounded-2xl bg-white/[0.05] animate-pulse min-h-[168px]" />
  )
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [openForm, setOpenForm] = useState(false)

  const fetchAccounts = () => {
    setLoading(true)
    fetch('/api/accounts')
      .then((r) => r.json())
      .then((d) => setAccounts(Array.isArray(d) ? d : []))
      .catch(() => setAccounts([]))
      .finally(() => setLoading(false))
  }

  useEffect(fetchAccounts, [])

  const handleDelete = async (id: string) => {
    const account = accounts.find((a) => a.id === id)
    if (!window.confirm(`Hapus akun "${account?.name}"? Transaksi terkait tidak akan ikut terhapus.`)) return

    try {
      const res = await fetch(`/api/accounts/${id}`, { method: 'DELETE' })
      if (res.ok) fetchAccounts()
      else alert('Gagal menghapus akun')
    } catch {
      alert('Gagal menghapus akun')
    }
  }

  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0)

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Akun Bank">
        <Button variant="primary" size="sm" onClick={() => setOpenForm(true)}>
          <Plus size={14} /> Tambah Akun
        </Button>
      </Topbar>

      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* Summary strip */}
        {!loading && accounts.length > 0 && (
          <div className="flex items-center gap-6 rounded-2xl border border-white/[0.07] bg-[#13131f] px-5 py-3.5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Total Saldo</p>
              <p className="font-display text-xl font-black text-white tabular-nums">{formatRupiah(totalBalance)}</p>
            </div>
            <div className="h-8 w-px bg-white/[0.07]" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Akun Aktif</p>
              <p className="font-display text-xl font-black text-white">{accounts.length}</p>
            </div>
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <SkeletonCard /><SkeletonCard /><SkeletonCard />
          </div>
        ) : accounts.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-20">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center">
              <Landmark size={28} className="text-white/20" />
            </div>
            <div className="text-center">
              <p className="text-base font-semibold text-white/50">Belum ada akun bank</p>
              <p className="text-sm text-white/30 mt-1">Tambahkan akun untuk melacak saldo per bank</p>
            </div>
            <Button variant="primary" size="md" onClick={() => setOpenForm(true)}>
              <Plus size={14} /> Tambah Akun Pertama
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map((a) => (
              <AccountCard key={a.id} account={a} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>

      <AccountForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSuccess={() => { setOpenForm(false); fetchAccounts() }}
      />
    </div>
  )
}
