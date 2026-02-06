'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function DvrUploadPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    version: '1.0',
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: '',
    description: '',
  })

  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!formData.title || !formData.version || !formData.validFrom) {
      setError('Titolo, versione e data validità sono obbligatori')
      return
    }

    if (!selectedFile) {
      setError('Seleziona un file PDF')
      return
    }

    try {
      setLoading(true)
      setError('')

      // In a real implementation, you would upload the file to storage first
      // For now, we simulate with a mock URL
      const fileUrl = `/uploads/dvr/${selectedFile.name}`

      const res = await fetch('/api/dvr/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          filePath: fileUrl,
          fileName: selectedFile.name,
          fileSize: selectedFile.size,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Errore nel caricamento')
      }

      setSuccess('DVR caricato con successo!')
      setTimeout(() => {
        router.push('/safety/dvr')
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
          <Link href="/safety" className="hover:text-blue-600">
            Sicurezza
          </Link>
          <span>/</span>
          <Link href="/safety/dvr" className="hover:text-blue-600">
            DVR
          </Link>
          <span>/</span>
          <span>Carica</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Carica Nuovo DVR
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Carica il Documento di Valutazione dei Rischi per la tua azienda
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-4 rounded-lg mb-6 flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-900 dark:text-red-300">
            ×
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 p-4 rounded-lg mb-6">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Informazioni Documento
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Titolo Documento *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Es: DVR - Documento Valutazione Rischi 2026"
                className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Versione *
                </label>
                <input
                  type="text"
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  placeholder="Es: 1.0"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Valido dal *
                </label>
                <input
                  type="date"
                  value={formData.validFrom}
                  onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Valido fino a (opzionale)
              </label>
              <input
                type="date"
                value={formData.validUntil}
                onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Descrizione (opzionale)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Eventuali note o descrizione del documento..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            File Documento
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              File PDF *
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              required
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Formato: PDF - Max 50MB
            </p>
          </div>

          {selectedFile && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>File selezionato:</strong> {selectedFile.name}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                Dimensione: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          )}
        </div>

        <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
          <p className="text-sm text-amber-700 dark:text-amber-300">
            <strong>Nota:</strong> Dopo il caricamento, i dipendenti riceveranno una notifica e
            dovranno prendere visione del documento. Lo stato delle prese visione sarà tracciato
            nella sezione "Prese Visione".
          </p>
        </div>

        <div className="flex gap-4">
          <Link
            href="/safety/dvr"
            className="flex-1 px-4 py-3 text-center border border-gray-300 dark:border-zinc-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-700 font-medium"
          >
            Annulla
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Caricamento...' : 'Carica DVR'}
          </button>
        </div>
      </form>
    </div>
  )
}
