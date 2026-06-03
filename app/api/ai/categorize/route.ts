import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { geminiModel, extractJsonArray } from '@/lib/gemini'

const BATCH_SIZE = 50

async function categorizeBatch(
  descriptions: string[],
  categoryList: string,
): Promise<(string | null)[]> {
  const numbered = descriptions.map((d, i) => `${i + 1}. ${d}`).join('\n')

  const prompt = `Kamu adalah asisten kategorisasi transaksi keuangan Indonesia.
Untuk setiap deskripsi transaksi berikut, tentukan kategori yang paling sesuai.

Daftar kategori (format — id: nama):
${categoryList}

Deskripsi transaksi:
${numbered}

Balas HANYA dengan JSON array berisi categoryId untuk setiap transaksi sesuai urutan.
Format: ["id1", "id2", null, "id3", ...]
Gunakan null jika tidak ada kategori yang cocok atau tidak yakin.
Jangan tambahkan penjelasan apapun, hanya JSON array.`

  const result = await geminiModel.generateContent(prompt)
  const text   = result.response.text()
  const parsed = extractJsonArray(text)

  if (!parsed || parsed.length !== descriptions.length) {
    return descriptions.map(() => null)
  }

  return parsed.map((id) => (typeof id === 'string' && id ? id : null))
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { descriptions } = (await req.json()) as { descriptions: string[] }

    if (!descriptions?.length) {
      return NextResponse.json({ categoryIds: [] })
    }

    const categories = await prisma.category.findMany({
      where: { OR: [{ userId: session.user.id }, { userId: null }] },
      orderBy: { name: 'asc' },
    })

    const categoryList = categories.map((c) => `${c.id}: ${c.name}`).join('\n')

    // Process in batches of BATCH_SIZE
    const allIds: (string | null)[] = []
    for (let i = 0; i < descriptions.length; i += BATCH_SIZE) {
      const batch   = descriptions.slice(i, i + BATCH_SIZE)
      const results = await categorizeBatch(batch, categoryList)
      allIds.push(...results)
    }

    return NextResponse.json({ categoryIds: allIds })
  } catch (err) {
    console.error('[AI Categorize]', err)
    // Graceful fallback: return nulls so the app doesn't break
    return NextResponse.json({ categoryIds: [] })
  }
}
