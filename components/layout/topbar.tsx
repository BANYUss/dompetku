import { cn } from '@/lib/utils'
import { ThemeToggle } from './theme-toggle'

interface TopbarProps {
  title: string
  children?: React.ReactNode
  className?: string
}

export function Topbar({ title, children, className }: TopbarProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between px-6 py-4 border-b dark:border-white/[0.07] border-gray-200',
        className,
      )}
    >
      <h1 className="font-display text-lg font-bold dark:text-white text-gray-900">{title}</h1>
      <div className="flex items-center gap-2">
        {children}
        <ThemeToggle />
      </div>
    </div>
  )
}
