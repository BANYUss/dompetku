import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const session = await auth()
  if (!session) redirect('/login')

  return (
    <div className="p-8 text-white">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-white/60 mt-2">Halo, {session.user?.name} — CHUNK-04 akan mengisi halaman ini.</p>
    </div>
  )
}
