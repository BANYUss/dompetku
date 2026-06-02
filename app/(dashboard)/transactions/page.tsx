import { Topbar } from '@/components/layout/topbar'

export default function TransactionsPage() {
  return (
    <div className="flex flex-col h-full">
      <Topbar title="Transaksi" />
      <div className="flex-1 p-6 flex items-center justify-center">
        <p className="text-white/40 text-sm">Transaksi — coming in CHUNK-06</p>
      </div>
    </div>
  )
}
