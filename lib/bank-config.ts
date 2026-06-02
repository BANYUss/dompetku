export const BANK_CONFIG = {
  BCA: {
    name: 'BCA',
    color: '#005baa',
    gradient: 'from-blue-600 to-blue-800',
    logo: 'B',
  },
  MANDIRI: {
    name: 'Mandiri',
    color: '#003d8f',
    gradient: 'from-blue-700 to-yellow-600',
    logo: 'M',
  },
  GOPAY: {
    name: 'GoPay',
    color: '#00a8e8',
    gradient: 'from-cyan-500 to-blue-600',
    logo: 'G',
  },
  OVO: {
    name: 'OVO',
    color: '#4c3494',
    gradient: 'from-violet-600 to-purple-700',
    logo: 'O',
  },
  OTHER: {
    name: 'Lainnya',
    color: '#555570',
    gradient: 'from-slate-600 to-slate-800',
    logo: '🏦',
  },
} as const

export type BankType = keyof typeof BANK_CONFIG
