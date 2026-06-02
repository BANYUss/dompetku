import { cn } from '@/lib/utils'

interface TopbarProps {
  title: string
  children?: React.ReactNode
  className?: string
}

export function Topbar({ title, children, className }: TopbarProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between px-6 py-4 border-b border-white/[0.07]',
        className,
      )}
    >
      <h1 className="font-display text-lg font-bold text-white">{title}</h1>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>
  )
}
