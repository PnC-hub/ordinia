'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Decimal } from '@prisma/client/runtime/library'

type Document = {
  id: string
  name: string
  type: string
  filePath: string
  createdAt: Date
  expiresAt: Date | null
}

type SafetyTraining = {
  id: string
  trainingType: string
  title: string
  hoursCompleted: number
  hoursRequired: number
  completedAt: Date | null
  expiresAt: Date | null
  status: string
  certificateNumber: string | null
}

type LeaveRequest = {
  id: string
  type: string
  startDate: Date
  endDate: Date
  totalDays: Decimal | number
  status: string
  reason: string | null
  requestedAt: Date
}

type LeaveBalance = {
  vacationTotal: Decimal | number
  vacationUsed: Decimal | number
  vacationPending: Decimal | number
  rolTotal: Decimal | number
  rolUsed: Decimal | number
  rolPending: Decimal | number
}

type DisciplinaryProcedure = {
  id: string
  infractionType: string
  infractionDate: Date
  infractionDescription: string
  status: string
  sanctionType: string | null
  createdAt: Date
}

type Note = {
  id: string
  content: string
  category: string
  isPrivate: boolean
  createdAt: Date
  author: {
    name: string | null
    email: string | null
  }
}

type Employee = {
  id: string
  firstName: string
  lastName: string
}

type Props = {
  employee: Employee
  documents: Document[]
  safetyTrainings: SafetyTraining[]
  leaveRequests: LeaveRequest[]
  leaveBalance: LeaveBalance
  disciplinaryProcedures: DisciplinaryProcedure[]
  notes: Note[]
}

const tabs = [
  { id: 'documents', label: 'Documenti', icon: '📄' },
  { id: 'training', label: 'Formazione', icon: '🎓' },
  { id: 'leaves', label: 'Ferie/Permessi', icon: '🏖️' },
  { id: 'disciplinary', label: 'Disciplinare', icon: '⚖️' },
  { id: 'notes', label: 'Note', icon: '📝' }
]

const documentTypeLabels: Record<string, string> = {
  CONTRACT: 'Contratto',
  ID_DOCUMENT: 'Documento Identità',
  TRAINING_CERTIFICATE: 'Attestato Formazione',
  MEDICAL_CERTIFICATE: 'Certificato Medico',
  DPI_RECEIPT: 'Ricevuta DPI',
  PAYSLIP: 'Busta Paga',
  DISCIPLINARY: 'Disciplinare',
  GDPR_CONSENT: 'Consenso GDPR',
  OTHER: 'Altro'
}

const trainingTypeLabels: Record<string, string> = {
  GENERAL: 'Formazione Generale',
  SPECIFIC_LOW: 'Rischio Basso',
  SPECIFIC_MEDIUM: 'Rischio Medio',
  SPECIFIC_HIGH: 'Rischio Alto',
  FIRST_AID: 'Primo Soccorso',
  FIRE_PREVENTION: 'Antincendio',
  RLS: 'RLS',
  PREPOSTO: 'Preposto',
  DIRIGENTE: 'Dirigente',
  UPDATE: 'Aggiornamento'
}

const trainingStatusColors: Record<string, string> = {
  NOT_STARTED: 'bg-gray-100 text-gray-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  EXPIRED: 'bg-red-100 text-red-800'
}

const leaveTypeLabels: Record<string, string> = {
  VACATION: 'Ferie',
  SICK: 'Malattia',
  PERSONAL: 'Permesso Personale',
  ROL: 'ROL',
  EX_FESTIVITY: 'Ex Festività',
  PARENTAL: 'Congedo Parentale',
  MATERNITY: 'Maternità',
  PATERNITY: 'Paternità',
  BEREAVEMENT: 'Lutto',
  MARRIAGE: 'Matrimonio',
  STUDY: 'Studio',
  BLOOD_DONATION: 'Donazione Sangue',
  UNION: 'Sindacale',
  MEDICAL_VISIT: 'Visita Medica',
  LAW_104: 'Legge 104',
  UNPAID: 'Non Retribuito',
  OTHER: 'Altro'
}

const leaveStatusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-gray-100 text-gray-800'
}

const disciplinaryStatusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  CONTESTATION_SENT: 'bg-yellow-100 text-yellow-800',
  AWAITING_DEFENSE: 'bg-orange-100 text-orange-800',
  DEFENSE_RECEIVED: 'bg-blue-100 text-blue-800',
  HEARING_SCHEDULED: 'bg-purple-100 text-purple-800',
  PENDING_DECISION: 'bg-amber-100 text-amber-800',
  SANCTION_ISSUED: 'bg-red-100 text-red-800',
  APPEALED: 'bg-pink-100 text-pink-800',
  CLOSED: 'bg-gray-100 text-gray-800'
}

const infractionTypeLabels: Record<string, string> = {
  TARDINESS: 'Ritardo',
  ABSENCE: 'Assenza Ingiustificata',
  INSUBORDINATION: 'Insubordinazione',
  NEGLIGENCE: 'Negligenza',
  MISCONDUCT: 'Comportamento Scorretto',
  POLICY_VIOLATION: 'Violazione Regolamento',
  SAFETY_VIOLATION: 'Violazione Sicurezza',
  HARASSMENT: 'Molestie',
  THEFT: 'Furto',
  FRAUD: 'Frode',
  OTHER: 'Altro'
}

export default function EmployeeDetailTabs({
  employee,
  documents,
  safetyTrainings,
  leaveRequests,
  leaveBalance,
  disciplinaryProcedures,
  notes
}: Props) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('documents')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadingDoc, setUploadingDoc] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUploadDocument = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setUploadingDoc(true)
    setUploadError('')

    const formData = new FormData(e.currentTarget)
    formData.append('employeeId', employee.id)

    try {
      const res = await fetch('/api/employees/documents', {
        method: 'POST',
        body: formData
      })

      if (!res.ok) {
        const result = await res.json()
        throw new Error(result.error || 'Errore durante il caricamento')
      }

      setShowUploadModal(false)
      router.refresh()
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Errore sconosciuto')
    } finally {
      setUploadingDoc(false)
    }
  }

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-zinc-700">
        <nav className="flex gap-1 p-1" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-colors
                ${activeTab === tab.id
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
                }
              `}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.id === 'documents' && documents.length > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded-full text-xs">
                  {documents.length}
                </span>
              )}
              {tab.id === 'training' && safetyTrainings.length > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded-full text-xs">
                  {safetyTrainings.length}
                </span>
              )}
              {tab.id === 'disciplinary' && disciplinaryProcedures.length > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-red-200 dark:bg-red-900/30 rounded-full text-xs">
                  {disciplinaryProcedures.length}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Documenti Firmati
              </h3>
              <button
                onClick={() => setShowUploadModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                + Carica Documento
              </button>
            </div>

            {documents.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <div className="text-4xl mb-2">📄</div>
                <p>Nessun documento caricato</p>
              </div>
            ) : (
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-zinc-700 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-750"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                        <span className="text-xl">📄</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{doc.name}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <span>{documentTypeLabels[doc.type] || doc.type}</span>
                          <span>•</span>
                          <span>{new Date(doc.createdAt).toLocaleDateString('it-IT')}</span>
                          {doc.expiresAt && (
                            <>
                              <span>•</span>
                              <span className="text-amber-600">
                                Scade: {new Date(doc.expiresAt).toLocaleDateString('it-IT')}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        Scarica
                      </button>
                      <button className="text-gray-600 hover:text-gray-800 text-sm font-medium">
                        Dettagli
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Training Tab */}
        {activeTab === 'training' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Formazione Sicurezza D.Lgs. 81/2008
              </h3>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                + Aggiungi Corso
              </button>
            </div>

            {safetyTrainings.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <div className="text-4xl mb-2">🎓</div>
                <p>Nessun corso di formazione registrato</p>
              </div>
            ) : (
              <div className="space-y-3">
                {safetyTrainings.map((training) => {
                  const isExpiringSoon = training.expiresAt &&
                    new Date(training.expiresAt) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)

                  return (
                    <div
                      key={training.id}
                      className={`p-4 border rounded-lg ${
                        isExpiringSoon
                          ? 'border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-900/20'
                          : 'border-gray-200 dark:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{training.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {trainingTypeLabels[training.trainingType] || training.trainingType}
                          </p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded ${trainingStatusColors[training.status]}`}>
                          {training.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Ore</p>
                          <p className="text-gray-900 dark:text-white font-medium">
                            {training.hoursCompleted} / {training.hoursRequired}
                          </p>
                        </div>
                        {training.completedAt && (
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Completato</p>
                            <p className="text-gray-900 dark:text-white font-medium">
                              {new Date(training.completedAt).toLocaleDateString('it-IT')}
                            </p>
                          </div>
                        )}
                        {training.expiresAt && (
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Scadenza</p>
                            <p className={`font-medium ${
                              isExpiringSoon ? 'text-amber-600' : 'text-gray-900 dark:text-white'
                            }`}>
                              {new Date(training.expiresAt).toLocaleDateString('it-IT')}
                            </p>
                          </div>
                        )}
                        {training.certificateNumber && (
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Attestato N.</p>
                            <p className="text-gray-900 dark:text-white font-medium font-mono text-xs">
                              {training.certificateNumber}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Leaves Tab */}
        {activeTab === 'leaves' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Ferie e Permessi
            </h3>

            {/* Balance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 border border-gray-200 dark:border-zinc-700 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Ferie</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {Number(leaveBalance.vacationTotal) - Number(leaveBalance.vacationUsed)}
                  </p>
                  <p className="text-sm text-gray-500">/ {Number(leaveBalance.vacationTotal)} giorni</p>
                </div>
                {Number(leaveBalance.vacationPending) > 0 && (
                  <p className="text-xs text-amber-600 mt-1">
                    {Number(leaveBalance.vacationPending)} in attesa
                  </p>
                )}
              </div>

              <div className="p-4 border border-gray-200 dark:border-zinc-700 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">ROL</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {Number(leaveBalance.rolTotal) - Number(leaveBalance.rolUsed)}
                  </p>
                  <p className="text-sm text-gray-500">/ {Number(leaveBalance.rolTotal)} giorni</p>
                </div>
                {Number(leaveBalance.rolPending) > 0 && (
                  <p className="text-xs text-amber-600 mt-1">
                    {Number(leaveBalance.rolPending)} in attesa
                  </p>
                )}
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">Anno Corrente</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {new Date().getFullYear()}
                </p>
              </div>
            </div>

            {/* Leave Requests */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900 dark:text-white">Ultime Richieste</h4>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                  + Nuova Richiesta
                </button>
              </div>

              {leaveRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p>Nessuna richiesta di ferie o permessi</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {leaveRequests.map((leave) => (
                    <div
                      key={leave.id}
                      className="flex items-center justify-between p-3 border border-gray-200 dark:border-zinc-700 rounded-lg"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {leaveTypeLabels[leave.type] || leave.type}
                          </p>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded ${leaveStatusColors[leave.status]}`}>
                            {leave.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(leave.startDate).toLocaleDateString('it-IT')} - {new Date(leave.endDate).toLocaleDateString('it-IT')}
                          <span className="ml-2">({Number(leave.totalDays)} giorni)</span>
                        </p>
                        {leave.reason && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{leave.reason}</p>
                        )}
                      </div>
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        Dettagli
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Disciplinary Tab */}
        {activeTab === 'disciplinary' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Procedimenti Disciplinari
              </h3>
            </div>

            {disciplinaryProcedures.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <div className="text-4xl mb-2">✅</div>
                <p>Nessun procedimento disciplinare</p>
              </div>
            ) : (
              <div className="space-y-4">
                {disciplinaryProcedures.map((proc) => (
                  <div
                    key={proc.id}
                    className="p-4 border border-gray-200 dark:border-zinc-700 rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                          {infractionTypeLabels[proc.infractionType] || proc.infractionType}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Data infrazione: {new Date(proc.infractionDate).toLocaleDateString('it-IT')}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded ${disciplinaryStatusColors[proc.status]}`}>
                        {proc.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                      {proc.infractionDescription}
                    </p>
                    {proc.sanctionType && (
                      <div className="pt-3 border-t border-gray-200 dark:border-zinc-700">
                        <p className="text-sm">
                          <span className="text-gray-500 dark:text-gray-400">Provvedimento: </span>
                          <span className="text-gray-900 dark:text-white font-medium">
                            {proc.sanctionType}
                          </span>
                        </p>
                      </div>
                    )}
                    <div className="mt-3">
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        Vedi dettagli procedura →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Notes Tab */}
        {activeTab === 'notes' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Note Riservate
              </h3>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                + Aggiungi Nota
              </button>
            </div>

            {notes.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <div className="text-4xl mb-2">📝</div>
                <p>Nessuna nota registrata</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="p-4 border border-gray-200 dark:border-zinc-700 rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {note.author.name || note.author.email}
                        </span>
                        <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                          {note.category}
                        </span>
                        {note.isPrivate && (
                          <span className="px-2 py-0.5 text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded">
                            Riservato
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(note.createdAt).toLocaleDateString('it-IT')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {note.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Carica Documento
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {uploadError && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg text-sm">
                {uploadError}
              </div>
            )}

            <form onSubmit={handleUploadDocument} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nome Documento *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="es. Contratto di lavoro"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tipo Documento *
                </label>
                <select
                  name="type"
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:text-white"
                >
                  <option value="CONTRACT">Contratto</option>
                  <option value="ID_DOCUMENT">Documento Identità</option>
                  <option value="TRAINING_CERTIFICATE">Attestato Formazione</option>
                  <option value="MEDICAL_CERTIFICATE">Certificato Medico</option>
                  <option value="DPI_RECEIPT">Ricevuta DPI</option>
                  <option value="PAYSLIP">Busta Paga</option>
                  <option value="DISCIPLINARY">Disciplinare</option>
                  <option value="GDPR_CONSENT">Consenso GDPR</option>
                  <option value="OTHER">Altro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  File *
                </label>
                <input
                  type="file"
                  name="file"
                  ref={fileInputRef}
                  required
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:text-white file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  PDF, DOC, DOCX, JPG, PNG (max 10MB)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Data Scadenza
                </label>
                <input
                  type="date"
                  name="expiresAt"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-zinc-700">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={uploadingDoc}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {uploadingDoc ? 'Caricamento...' : 'Carica'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
