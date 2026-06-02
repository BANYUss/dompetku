import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from './prisma'
import { authConfig } from './auth.config'

// PrismaAdapter expects p.account but our schema uses AuthAccount (p.authAccount).
// Proxy remaps 'account' → 'authAccount' at runtime.
const prismaForAuth = new Proxy(prisma as any, {
  get(target, prop) {
    if (prop === 'account') return target.authAccount
    return target[prop]
  },
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prismaForAuth),
  session: { strategy: 'jwt' },
})
