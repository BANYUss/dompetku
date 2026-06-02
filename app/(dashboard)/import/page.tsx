'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { CheckCircle, LayoutDashboard, RotateCcw, AlertCircle } from 'lucide-react'
import { Topbar } from '@/components/layout/topbar'
import { Button } from '@/components/ui/button'
import { StepIndicator } from '@/components/import/step-indicator'
import { BankTabs } from '@/components/import/bank-tabs'
import { DropZone } from '@/components/import/drop-zone'
import { PreviewTable } from '@/components/import/preview-table'
import { BANK_CONFIG } from '@/lib/bank-config'
import type { BankParserType, ParsedTransaction } from '@/lib/csv-parsers'
import type { Category, Account } from '@/types/transaction'

type Step = 1 | 2 | 3 | 4

export default function ImportPage() {
  const [step,          setStep]          = useState<Step>(1)
  const [selectedBank,  setSelectedBank]  = useState<BankParserType | null>(null)
  const [parsing,       setParsing]        = useState(false)
  const [parseError,    setParseError]     = useState<string | null>(null)
  const [progress,      setProgress]       = useState(0)
  const [preview,       setPreview]        = useState<ParsedTransaction[] | null>(null)
  const [filename,      setFilename]       = useState('')
  const [categories,    setCategories]     = useState<Category[]>([])
  const [accounts,      setAccounts]       = useState<Account[]>([])
  const [importing,     setImporting]      = useState(false)
  const [importResult,  setImportResult]   = useState<{ imported: number; skipped: number } | null>(null)
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Fetch categories + accounts once
  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(d => setCategories(Array.isArray(d) ? d : []))
    fetch('/api/accounts').then(r => r.json()).then(d => setAccounts(Array.isArray(d) ? d : []))
  }, [])

  const simulateProgress = (onDone: () => void) => {
    setProgress(0)
    let p = 0
    progressRef.current = setInterval(() => {
      p += p < 60 ? 15 : p < 85 ? 5 : 1
      if (p >= 95) { clearInterval(progressRef.current!); p = 95 }
      setProgress(p)
    }, 150)
    return () => { clearInterval(progressRef.current!); setProgress(100); setTimeout(onDone, 300) }
  }

  const handleFileSelect = async (file: File) => {
    if (!selectedBank) return
    setParseError(null)
    setParsing(true)

    const finish = simulateProgress(() => {})

    const formData = new FormData()
    formData.append('file', file)
    formData.append('bankType', selectedBank)

    try {
      const res  = await fetch('/api/import/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setPreview(data.preview)
      setFilename(data.filename)
      finish()
      setTimeout(() => { setParsing(false); setStep(3) }, 400)
    } catch (e) {
      clearInterval(progressRef.current!)
      setProgress(0)
      setParsing(false)
      setParseError(e instanceof Error ? e.message : 'Gagal memproses file')
    }
  }

  const handleUpdate = (index: number, updates: Partial<ParsedTransaction>) => {
    setPreview((prev) => prev!.map((tx, i) => (i === index ? { ...tx, ...updates } : tx)))
  }

  const handleConfirm = async (accountId?: string) => {
    setImporting(true)
    try {
      const res  = await fetch('/api/import/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactions: preview, bankType: selectedBank, filename, accountId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setImportResult({ imported: data.imported, skipped: data.skipped })
      setStep(4)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Import gagal')
    } finally {
      setImporting(false)
    }
  }

  const resetFlow = () => {
    setStep(1); setSelectedBank(null); setParsing(false)
    setParseError(null); setProgress(0); setPreview(null)
    setFilename(''); setImportResult(null)
  }

  const bankName = selectedBank ? BANK_CONFIG[selectedBank]?.name : ''

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Import CSV" />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Step indicator */}
          <StepIndicator currentStep={step} />

          {/* ── STEP 1: Pilih bank ── */}
          {step === 1 && (
            <div className="space-y-6" style={{ animation: 'fadeUp 0.3s ease both' }}>
              <div>
                <h2 className="font-display text-lg font-bold text-white mb-1">Pilih Bank</h2>
                <p className="text-sm text-white/40">Pilih bank sesuai file mutasi yang akan diimpor</p>
              </div>
              <BankTabs selected={selectedBank} onSelect={setSelectedBank} />
              <Button
                variant="primary"
                size="lg"
                disabled={!selectedBank}
                onClick={() => setStep(2)}
                className="mt-2"
              >
                Lanjut →
              </Button>
            </div>
          )}

          {/* ── STEP 2: Upload file ── */}
          {step === 2 && (
            <div className="space-y-6" style={{ animation: 'fadeUp 0.3s ease both' }}>
              <div>
                <h2 className="font-display text-lg font-bold text-white mb-1">
                  Upload File Mutasi {bankName}
                </h2>
                <p className="text-sm text-white/40">
                  Upload file CSV mutasi rekening {bankName} kamu
                </p>
              </div>

              {!parsing ? (
                <>
                  <DropZone bankType={selectedBank!} onFileSelect={handleFileSelect} />
                  {parseError && (
                    <div className="flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
                      <AlertCircle size={15} className="text-red-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-red-400">{parseError}</p>
                    </div>
                  )}
                  <Button variant="secondary" size="sm" onClick={() => setStep(1)}>
                    ← Kembali
                  </Button>
                </>
              ) : (
                <div className="rounded-2xl border border-white/[0.07] bg-[#13131f] p-8 flex flex-col items-center gap-5">
                  <div className="text-3xl animate-bounce">📊</div>
                  <div className="w-full space-y-2">
                    <div className="flex items-center justify-between text-xs text-white/50 mb-1">
                      <span>{progress < 30 ? 'Mengunggah file...' : progress < 80 ? 'Memproses CSV...' : 'Selesai!'}</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-white/[0.06] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-emerald-500 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── STEP 3: Kategorisasi ── */}
          {step === 3 && preview && (
            <div className="space-y-4" style={{ animation: 'fadeUp 0.3s ease both' }}>
              <div>
                <h2 className="font-display text-lg font-bold text-white mb-1">Kategorisasi Transaksi</h2>
                <p className="text-sm text-white/40">
                  Pilih kategori untuk setiap transaksi (opsional — bisa dikosongkan)
                </p>
              </div>
              <PreviewTable
                transactions={preview}
                categories={categories}
                accounts={accounts}
                onUpdate={handleUpdate}
                onConfirm={handleConfirm}
                onCancel={() => setStep(2)}
                importing={importing}
              />
            </div>
          )}

          {/* ── STEP 4: Done ── */}
          {step === 4 && importResult && (
            <div
              className="flex flex-col items-center gap-6 py-12 text-center"
              style={{ animation: 'fadeUp 0.4s ease both' }}
            >
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 flex items-center justify-center">
                <CheckCircle size={32} className="text-emerald-400" />
              </div>

              <div>
                <h2 className="font-display text-2xl font-black text-white">Import Berhasil!</h2>
                <p className="text-white/50 text-sm mt-1">File {filename} berhasil diimpor</p>
              </div>

              <div className="flex gap-6">
                <div className="text-center">
                  <p className="font-display text-3xl font-black text-emerald-400">{importResult.imported}</p>
                  <p className="text-xs text-white/40 mt-0.5">Transaksi diimpor</p>
                </div>
                {importResult.skipped > 0 && (
                  <div className="text-center">
                    <p className="font-display text-3xl font-black text-white/50">{importResult.skipped}</p>
                    <p className="text-xs text-white/40 mt-0.5">Duplikat diskip</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button variant="secondary" size="md" onClick={resetFlow}>
                  <RotateCcw size={14} /> Import Lagi
                </Button>
                <Link href="/dashboard">
                  <Button variant="primary" size="md">
                    <LayoutDashboard size={14} /> Lihat Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
