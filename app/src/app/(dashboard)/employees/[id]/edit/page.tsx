'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

type Employee = {
  id: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  fiscalCode: string | null
  birthDate: string | null
  birthPlace: string | null
  address: string | null
  hireDate: string
  endDate: string | null
  contractType: string
  jobTitle: string | null
  department: string | null
  ccnlLevel: string | null
  probationEndsAt: string | null
  status: string
}

export default function EditEmployeePage() {
  const router = useRouter()
  const params = useParams()
  const employeeId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [employee, setEmployee] = useState<Employee | null>(null)

  const ccnlLevels = [
    { value: '1', label: '1° Livello - Quadri' },
    { value: '2', label: '2° Livello' },
    { value: '3S', label: '3° Livello Super' },
    { value: '3', label: '3° Livello' },
    { value: '4S', label: '4° Livello Super' },
    { value: '4', label: '4° Livello' },
    { value: '5', label: '5° Livello' }
  ]

  useEffect(() => {
    async function fetchEmployee() {
      try {
        const res = await fetch(`/api/employees/${employeeId}`)
        if (!res.ok) {
          throw new Error('Dipendente non trovato')
        }
        const data = await res.json()
        setEmployee(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Errore nel caricamento')
      } finally {
        setLoading(false)
      }
    }
    fetchEmployee()
  }, [employeeId])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData.entries())

    try {
      const res = await fetch(`/api/employees/${employeeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!res.ok) {
        const result = await res.json()
        throw new Error(result.error || 'Errore durante il salvataggio')
      }

      router.push(`/employees/${employeeId}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto')
    } finally {
      setSaving(false)
    }
  }

  const formatDateForInput = (dateStr: string | null) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toISOString().split('T')[0]
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500 dark:text-gray-400">Caricamento...</div>
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[400px]">
        <div className="text-red-500 mb-4">Dipendente non trovato</div>
        <Link href="/employees" className="text-blue-600 hover:underline">
          Torna alla lista
        </Link>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href={`/employees/${employeeId}`} className="text-blue-600 hover:underline text-sm">
          ← Torna al dettaglio dipendente
        </Link>
      </div>

      <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-700 p-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Modifica Dipendente
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Info */}
          <div>
            <h2 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white">
              Dati Personali
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome *</label>
                <input
                  type="text"
                  name="firstName"
                  required
                  defaultValue={employee.firstName}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cognome *</label>
                <input
                  type="text"
                  name="lastName"
                  required
                  defaultValue={employee.lastName}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Codice Fiscale</label>
                <input
                  type="text"
                  name="fiscalCode"
                  maxLength={16}
                  defaultValue={employee.fiscalCode || ''}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:text-white uppercase"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  defaultValue={employee.email || ''}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telefono</label>
                <input
                  type="tel"
                  name="phone"
                  defaultValue={employee.phone || ''}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data di Nascita</label>
                <input
                  type="date"
                  name="birthDate"
                  defaultValue={formatDateForInput(employee.birthDate)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Luogo di Nascita</label>
                <input
                  type="text"
                  name="birthPlace"
                  defaultValue={employee.birthPlace || ''}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Indirizzo</label>
                <input
                  type="text"
                  name="address"
                  defaultValue={employee.address || ''}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Employment Info */}
          <div>
            <h2 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white">
              Dati Lavorativi
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data Assunzione *</label>
                <input
                  type="date"
                  name="hireDate"
                  required
                  defaultValue={formatDateForInput(employee.hireDate)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data Fine Rapporto</label>
                <input
                  type="date"
                  name="endDate"
                  defaultValue={formatDateForInput(employee.endDate)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo Contratto *</label>
                <select
                  name="contractType"
                  required
                  defaultValue={employee.contractType}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:text-white"
                >
                  <option value="FULL_TIME">Tempo Indeterminato Full-Time</option>
                  <option value="PART_TIME">Tempo Indeterminato Part-Time</option>
                  <option value="FIXED_TERM">Tempo Determinato</option>
                  <option value="APPRENTICE">Apprendistato</option>
                  <option value="INTERNSHIP">Stage/Tirocinio</option>
                  <option value="FREELANCE">Collaborazione/P.IVA</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stato</label>
                <select
                  name="status"
                  defaultValue={employee.status}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:text-white"
                >
                  <option value="ACTIVE">Attivo</option>
                  <option value="PROBATION">In Prova</option>
                  <option value="ON_LEAVE">In Congedo</option>
                  <option value="TERMINATED">Terminato</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mansione *</label>
                <input
                  type="text"
                  name="jobTitle"
                  required
                  defaultValue={employee.jobTitle || ''}
                  placeholder="es. ASO, Segretaria, Igienista"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reparto</label>
                <input
                  type="text"
                  name="department"
                  defaultValue={employee.department || ''}
                  placeholder="es. Clinica, Amministrazione"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Livello CCNL</label>
                <select
                  name="ccnlLevel"
                  defaultValue={employee.ccnlLevel || ''}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:text-white"
                >
                  <option value="">Seleziona livello</option>
                  {ccnlLevels.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fine Periodo di Prova</label>
                <input
                  type="date"
                  name="probationEndsAt"
                  defaultValue={formatDateForInput(employee.probationEndsAt)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200 dark:border-zinc-700">
            <Link
              href={`/employees/${employeeId}`}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              Annulla
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Salvataggio...' : 'Salva Modifiche'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
