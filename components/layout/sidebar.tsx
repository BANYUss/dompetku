'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import {
  LayoutDashboard,
  Receipt,
  Landmark,
  BarChart2,
  Upload,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Transaksi', href: '/transactions', icon: Receipt },
  { label: 'Akun Bank', href: '/accounts', icon: Landmark },
  { label: 'Analitik', href: '/analytics', icon: BarChart2 },
  { label: 'Import CSV', href: '/import', icon: Upload },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const user = session?.user

  return (
    <aside className="w-56 h-screen flex flex-col bg-[#13131f] border-r border-white/[0.07] shrink-0">
      {/* Logo */}
      <div className="px-4 pt-5 pb-4">
        <span className="font-display text-xl font-black bg-gradient-to-r from-violet-400 to-emerald-400 bg-clip-text text-transparent">
          Dompetku
        </span>
        <p className="text-[11px] text-white/30 mt-0.5">Finance Tracker</p>
      </div>

      {/* Divider */}
      <div className="mx-4 h-px bg-white/[0.07]" />

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-violet-500/10 text-violet-400'
                  : 'text-white/50 hover:bg-white/5 hover:text-white',
              )}
            >
              <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User card */}
      <div className="p-3">
        <div className="bg-white/[0.03] rounded-xl p-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {user?.image ? (
              <Image
                src={user.image}
                alt={user.name ?? 'User'}
                width={32}
                height={32}
                className="rounded-full shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center shrink-0">
                <span className="text-violet-400 text-xs font-bold">
                  {user?.name?.[0]?.toUpperCase() ?? 'U'}
                </span>
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">{user?.name ?? '—'}</p>
              <p className="text-[10px] text-white/40 truncate">{user?.email ?? '—'}</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="shrink-0 p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/5 transition-all"
              title="Logout"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
