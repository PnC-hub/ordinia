'use client'

import { useEffect, useState } from 'react'
import PageInfoTooltip from '@/components/PageInfoTooltip'

interface TeamMember {
  id: string
  role: string
  permissions: string[]
  createdAt: string
  user: {
    id: string
    name: string
    email: string
    image: string | null
  }
}

const roleLabels: Record<string, string> = {
  OWNER: 'Proprietario',
  ADMIN: 'Amministratore',
  HR_MANAGER: 'HR Manager',
  MANAGER: 'Manager',
  VIEWER: 'Visualizzatore',
}

const roleColors: Record<string, string> = {
  OWNER: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  ADMIN: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  HR_MANAGER: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  MANAGER: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  VIEWER: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
}

const availablePermissions = [
  { key: 'employees.read', label: 'Visualizza dipendenti' },
  { key: 'employees.write', label: 'Modifica dipendenti' },
  { key: 'documents.read', label: 'Visualizza documenti' },
  { key: 'documents.write', label: 'Carica documenti' },
  { key: 'payslips.read', label: 'Visualizza buste paga' },
  { key: 'payslips.write', label: 'Carica buste paga' },
  { key: 'leaves.read', label: 'Visualizza ferie' },
  { key: 'leaves.approve', label: 'Approva ferie' },
  { key: 'expenses.read', label: 'Visualizza spese' },
  { key: 'expenses.approve', label: 'Approva spese' },
  { key: 'settings.read', label: 'Visualizza impostazioni' },
  { key: 'settings.write', label: 'Modifica impostazioni' },
]

export default function TeamSettingsPage() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showInviteModal, setShowInviteModal] = useState(false)

  // Invite form
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('VIEWER')
  const [invitePermissions, setInvitePermissions] = useState<string[]>([])
  const [sending, setSending] = useState(false)

  useEffect(() => {
    fetchMembers()
  }, [])

  async function fetchMembers() {
    try {
      setLoading(true)
      const res = await fetch('/api/team')
      if (res.ok) {
        const data = await res.json()
        setMembers(data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nel caricamento')
    } finally {
      setLoading(false)
    }
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    try {
      setSending(true)
      const res = await fetch('/api/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole,
          permissions: invitePermissions,
        }),
      })

      if (!res.ok) throw new Error("Errore nell'invio invito")

      setShowInviteModal(false)
      setInviteEmail('')
      setInviteRole('VIEWER')
      setInvitePermissions([])
      fetchMembers()
      alert('Invito inviato!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore')
    } finally {
      setSending(false)
    }
  }

  async function handleRemoveMember(id: string) {
    if (!confirm('Sei sicuro di voler rimuovere questo membro?')) return

    try {
      const res = await fetch(`/api/team/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Errore nella rimozione')
      fetchMembers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore')
    }
  }

  async function handleUpdateRole(id: string, newRole: string) {
    try {
      const res = await fetch(`/api/team/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })
      if (!res.ok) throw new Error("Errore nell'aggiornamento")
      fetchMembers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore')
    }
  }

  const togglePermission = (permission: string) => {
    setInvitePermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    )
  }

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat('it-IT', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(dateStr))
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Team e Ruoli
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gestisci i membri del team e i loro permessi
            </p>
          </div>
          <PageInfoTooltip
            title="Gestione Team"
            description="Invita collaboratori e assegna loro ruoli e permessi specifici. Ogni ruolo determina quali sezioni del sistema possono visualizzare e modificare."
            tips={[
              'Il ruolo Proprietario non può essere modificato',
              'Assegna permessi granulari per limitare l\'accesso a dati sensibili',
              'Puoi invitare il consulente del lavoro con accesso limitato'
            ]}
          />
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Invita Membro
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 border border-gray-200 dark:border-zinc-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Membri Totali</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {members.length}
          </p>
        </div>
        <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Amministratori</p>
          <p className="text-3xl font-bold text-purple-600">
            {members.filter((m) => m.role === 'OWNER' || m.role === 'ADMIN').length}
          </p>
        </div>
        <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">HR Manager</p>
          <p className="text-3xl font-bold text-blue-600">
            {members.filter((m) => m.role === 'HR_MANAGER').length}
          </p>
        </div>
        <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 border border-gray-200 dark:border-zinc-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Visualizzatori</p>
          <p className="text-3xl font-bold text-gray-600">
            {members.filter((m) => m.role === 'VIEWER').length}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">{error}</div>
      )}

      {/* Members Table */}
      <div className="bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-zinc-900">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Membro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Ruolo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Permessi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Aggiunto il
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Azioni
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Caricamento...
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Nessun membro nel team
                  </td>
                </tr>
              ) : (
                members.map((member) => (
                  <tr
                    key={member.id}
                    className="hover:bg-gray-50 dark:hover:bg-zinc-750"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-zinc-700 flex items-center justify-center">
                          {member.user.image ? (
                            <img
                              src={member.user.image}
                              alt=""
                              className="w-10 h-10 rounded-full"
                            />
                          ) : (
                            <span className="text-gray-600 dark:text-gray-300 font-medium">
                              {member.user.name?.charAt(0) || member.user.email.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {member.user.name || 'Utente'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {member.user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={member.role}
                        onChange={(e) => handleUpdateRole(member.id, e.target.value)}
                        disabled={member.role === 'OWNER'}
                        className={`px-2 py-1 text-xs font-medium rounded border-0 ${
                          roleColors[member.role] || roleColors.VIEWER
                        } ${member.role === 'OWNER' ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        {Object.entries(roleLabels).map(([value, label]) => (
                          <option key={value} value={value} disabled={value === 'OWNER'}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {member.permissions.slice(0, 3).map((perm) => (
                          <span
                            key={perm}
                            className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-gray-300 rounded"
                          >
                            {perm.split('.')[0]}
                          </span>
                        ))}
                        {member.permissions.length > 3 && (
                          <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-gray-300 rounded">
                            +{member.permissions.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(member.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {member.role !== 'OWNER' && (
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Rimuovi
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Invita Membro
            </h2>
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Ruolo
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-white"
                >
                  {Object.entries(roleLabels)
                    .filter(([key]) => key !== 'OWNER')
                    .map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Permessi
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {availablePermissions.map((perm) => (
                    <label
                      key={perm.key}
                      className="flex items-center gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={invitePermissions.includes(perm.key)}
                        onChange={() => togglePermission(perm.key)}
                        className="w-4 h-4"
                      />
                      <span className="text-gray-700 dark:text-gray-300">
                        {perm.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-700"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {sending ? 'Invio...' : 'Invia Invito'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
