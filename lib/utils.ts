import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

export function parseRupiah(str: string): number {
  return Number(str.replace(/[^0-9]/g, '')) || 0
}

export function formatRupiahShort(n: number): string {
  if (n >= 1_000_000_000) {
    const v = n / 1_000_000_000
    return `${v % 1 === 0 ? v : v.toFixed(1).replace('.', ',')}M`
  }
  if (n >= 1_000_000) {
    const v = n / 1_000_000
    return `${v % 1 === 0 ? v : v.toFixed(1).replace('.', ',')}jt`
  }
  if (n >= 1_000) {
    const v = n / 1_000
    return `${v % 1 === 0 ? v : v.toFixed(1).replace('.', ',')}rb`
  }
  return String(n)
}

export const MONTHS_ID = [
  'Januari','Februari','Maret','April','Mei','Juni',
  'Juli','Agustus','September','Oktober','November','Desember',
]

export const MONTHS_SHORT_ID = [
  'Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des',
]

export function formatMonth(yyyyMm: string): string {
  const [year, mon] = yyyyMm.split('-').map(Number)
  return `${MONTHS_ID[mon - 1]} ${year}`
}

export function currentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export function prevMonth(yyyyMm: string): string {
  const [year, mon] = yyyyMm.split('-').map(Number)
  const d = new Date(year, mon - 2, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function nextMonth(yyyyMm: string): string {
  const [year, mon] = yyyyMm.split('-').map(Number)
  const d = new Date(year, mon, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}
