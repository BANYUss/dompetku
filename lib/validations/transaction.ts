import { z } from 'zod'

export const CreateTransactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.number().positive('Amount harus positif'),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  accountId: z.string().optional(),
  date: z.string().min(1, 'Date wajib diisi'),
})

export const UpdateTransactionSchema = CreateTransactionSchema.partial()

export type CreateTransactionInput = z.infer<typeof CreateTransactionSchema>
export type UpdateTransactionInput = z.infer<typeof UpdateTransactionSchema>
