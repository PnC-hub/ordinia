'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import PageInfoTooltip from '@/components/PageInfoTooltip'

interface TrainingCourse {
  id: string
  name: string
  description: string
  type: string
  provider: string | null
  duration: number // hours
  mandatory: boolean
  expirationMonths: number | null
  createdAt: string
}

interface TrainingRecord {
  id: string
  status: string
  completedAt: string | null
  expiresAt: string | null
  certificateUrl: string | null
  employee: {
    id: string
    firstName: string
    lastName: string
    department: string | null
  }
  course: {
    id: string
    name: string
    type: string
    mandatory: boolean
  }
}

const typeLabels: Record<string, string> = {
  SAFETY: 'Sicurezza',
  PRIVACY: 'Privacy',
  PROFESSIONAL: 'Professionale',
  SOFT_SKILLS: 'Soft Skills',
  TECHNICAL: 'Tecnico',
  COMPLIANCE: 'Compliance',
  OTHER: 'Altro',
}

const typeColors: Record<string, string> = {
  SAFETY: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  PRIVACY: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  PROFESSIONAL: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  SOFT_SKILLS: 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300',
  TECHNICAL: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300',
  COMPLIANCE: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  OTHER: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
}

const statusLabels: Record<string, string> = {
  NOT_STARTED: 'Non iniziato',
  IN_PROGRESS: 'In corso',
  COMPLETED: 'Completato',
  EXPIRED: 'Scaduto',
}

const statusColors: Record<string, string> = {
  NOT_STARTED: 'bg-gray-100 text-gray-700',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-green-100 text-green-700',
  EXPIRED: 'bg-red-100 text-red-700',
}

export default function TrainingPage() {
  const [courses, setCourses] = useState<TrainingCourse[]>([])
  const [records, setRecords] = useState<TrainingRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [view, setView] = useState<'courses' | 'records'>('courses')
  const [showNewCourseModal, setShowNewCourseModal] = useState(false)

  // New course form
  const [newCourseName, setNewCourseName] = useState('')
  const [newCourseType, setNewCourseType] = useState('PROFESSIONAL')
  const [newCourseDescription, setNewCourseDescription] = useState('')
  const [newCourseDuration, setNewCourseDuration] = useState('1')
  const [newCourseMandatory, setNewCourseMandatory] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      setLoading(true)
      const [coursesRes, recordsRes] = await Promise.all([
        fetch('/api/training/courses'),
        fetch('/api/training/records'),
      ])

      if (coursesRes.ok) {
        const data = await coursesRes.json()
        setCourses(data)
      }
      if (recordsRes.ok) {
        const data = await recordsRes.json()
        setRecords(data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nel caricamento')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateCourse(e: React.FormEvent) {
    e.preventDefault()
    try {
      setSaving(true)
      const res = await fetch('/api/training/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCourseName,
          type: newCourseType,
          description: newCourseDescription,
          duration: Number(newCourseDuration),
          mandatory: newCourseMandatory,
        }),
      })

      if (!res.ok) throw new Error('Errore nella creazione')

      setShowNewCourseModal(false)
      setNewCourseName('')
      setNewCourseDescription('')
      setNewCourseDuration('1')
      setNewCourseMandatory(false)
      fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore')
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat('it-IT', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(dateStr))
  }

  const isExpiringSoon = (expiresAt: string | null) => {
    if (!expiresAt) return false
    const daysUntilExpiry = Math.ceil(
      (new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0
  }

  // Stats
  const mandatoryCourses = courses.filter((c) => c.mandatory).length
  const completedRecords = records.filter((r) => r.status === 'COMPLETED').length
  const expiredRecords = records.filter((r) => r.status === 'EXPIRED').length
  const expiringSoonRecords = records.filter((r) => isExpiringSoon(r.expiresAt)).length

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Formazione
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gestisci corsi di formazione e certificazioni dipendenti
            </p>
          </div>
          <PageInfoTooltip
            title="Gestione Formazione"
            description="Monitora i corsi obbligatori e facoltativi dei tuoi dipendenti. Il sistema ti avvisa automaticamente quando gli attestati stanno per scadere."
            tips={[
              'I corsi sicurezza D.Lgs 81/08 hanno scadenze obbligatorie',
              'Carica sempre l\'attestato come prova documentale',
              'Usa i report per pianificare sessioni formative di gruppo'
            ]}
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setView('courses')}
            className={`px-4 py-2 rounded-lg font-medium ${
              view === 'courses'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-gray-300'
            }`}
          >
            Corsi
          </button>
          <button
            onClick={() => setView('records')}
            className={`px-4 py-2 rounded-lg font-medium ${
              view === 'records'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-gray-300'
            }`}
          >
            Storico
          </button>
          <button
            onClick={() => setShowNewCourseModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            + Nuovo Corso
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 border border-gray-200 dark:border-zinc-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Corsi Totali</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {courses.length}
          </p>
        </div>
        <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 border border-red-200 dark:border-red-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Obbligatori</p>
          <p className="text-3xl font-bold text-red-600">{mandatoryCourses}</p>
        </div>
        <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 border border-green-200 dark:border-green-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Completati</p>
          <p className="text-3xl font-bold text-green-600">{completedRecords}</p>
        </div>
        <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 border border-yellow-200 dark:border-yellow-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">In Scadenza</p>
          <p className="text-3xl font-bold text-yellow-600">{expiringSoonRecords}</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">{error}</div>
      )}

      {view === 'courses' && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              Caricamento...
            </div>
          ) : courses.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              Nessun corso configurato
            </div>
          ) : (
            courses.map((course) => (
              <div
                key={course.id}
                className="bg-white dark:bg-zinc-800 rounded-xl p-5 border border-gray-200 dark:border-zinc-700"
              >
                <div className="flex items-start justify-between mb-3">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded ${
                      typeColors[course.type] || typeColors.OTHER
                    }`}
                  >
                    {typeLabels[course.type] || course.type}
                  </span>
                  {course.mandatory && (
                    <span className="px-2 py-1 text-xs font-medium rounded bg-red-100 text-red-700">
                      Obbligatorio
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {course.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {course.description}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    {course.duration}h
                  </span>
                  {course.expirationMonths && (
                    <span className="text-gray-500 dark:text-gray-400">
                      Scade dopo {course.expirationMonths} mesi
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {view === 'records' && (
        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-zinc-900">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Dipendente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Corso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Stato
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Completato il
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Scadenza
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Certificato
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      Caricamento...
                    </td>
                  </tr>
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      Nessun record di formazione
                    </td>
                  </tr>
                ) : (
                  records.map((record) => (
                    <tr
                      key={record.id}
                      className={`hover:bg-gray-50 dark:hover:bg-zinc-750 ${
                        record.status === 'EXPIRED' ? 'bg-red-50 dark:bg-red-900/10' : ''
                      } ${isExpiringSoon(record.expiresAt) ? 'bg-yellow-50 dark:bg-yellow-900/10' : ''}`}
                    >
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {record.employee.firstName} {record.employee.lastName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {record.employee.department}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-900 dark:text-white">
                          {record.course.name}
                        </p>
                        {record.course.mandatory && (
                          <span className="text-xs text-red-600">Obbligatorio</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${
                            typeColors[record.course.type] || typeColors.OTHER
                          }`}
                        >
                          {typeLabels[record.course.type] || record.course.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${
                            statusColors[record.status] || 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {statusLabels[record.status] || record.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {record.completedAt ? formatDate(record.completedAt) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {record.expiresAt ? (
                          <span
                            className={
                              isExpiringSoon(record.expiresAt)
                                ? 'text-yellow-600 font-medium'
                                : record.status === 'EXPIRED'
                                ? 'text-red-600 font-medium'
                                : 'text-gray-500 dark:text-gray-400'
                            }
                          >
                            {formatDate(record.expiresAt)}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {record.certificateUrl ? (
                          <a
                            href={record.certificateUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Scarica
                          </a>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Course Modal */}
      {showNewCourseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Nuovo Corso
            </h2>
            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nome Corso
                </label>
                <input
                  type="text"
                  value={newCourseName}
                  onChange={(e) => setNewCourseName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tipo
                </label>
                <select
                  value={newCourseType}
                  onChange={(e) => setNewCourseType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-white"
                >
                  {Object.entries(typeLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Descrizione
                </label>
                <textarea
                  value={newCourseDescription}
                  onChange={(e) => setNewCourseDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Durata (ore)
                </label>
                <input
                  type="number"
                  value={newCourseDuration}
                  onChange={(e) => setNewCourseDuration(e.target.value)}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="mandatory"
                  checked={newCourseMandatory}
                  onChange={(e) => setNewCourseMandatory(e.target.checked)}
                  className="w-4 h-4"
                />
                <label
                  htmlFor="mandatory"
                  className="text-sm text-gray-700 dark:text-gray-300"
                >
                  Corso obbligatorio
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewCourseModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-700"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Salvataggio...' : 'Crea Corso'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
