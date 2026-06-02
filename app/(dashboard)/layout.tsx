import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { SessionProvider } from '@/components/providers/session-provider'
import { Sidebar } from '@/components/layout/sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session) redirect('/login')

  return (
    <SessionProvider>
      <div className="flex h-screen bg-[#0a0a0f] overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </SessionProvider>
  )
}
