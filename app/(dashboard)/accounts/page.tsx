import { Topbar } from '@/components/layout/topbar'

export default function AccountsPage() {
  return (
    <div className="flex flex-col h-full">
      <Topbar title="Akun Bank" />
      <div className="flex-1 p-6 flex items-center justify-center">
        <p className="text-white/40 text-sm">Akun Bank — coming in CHUNK-08</p>
      </div>
    </div>
  )
}
