import { cn } from '@/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border dark:border-white/[0.07] border-gray-200 dark:bg-[#13131f] bg-white p-5 transition-all duration-200',
        'dark:hover:border-white/[0.12] hover:border-gray-300 hover:-translate-y-0.5',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
