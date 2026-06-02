import { Topbar } from '@/components/layout/topbar'

export default function ImportPage() {
  return (
    <div className="flex flex-col h-full">
      <Topbar title="Import CSV" />
      <div className="flex-1 p-6 flex items-center justify-center">
        <p className="text-white/40 text-sm">Import CSV — coming in CHUNK-09</p>
      </div>
    </div>
  )
}
