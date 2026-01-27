import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import DashboardHeader from '@/components/DashboardHeader'

export default async function EmployeesPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  // Get user's tenant
  const membership = await prisma.tenantMember.findFirst({
    where: { userId: session.user.id },
    include: { tenant: true }
  })

  if (!membership) {
    redirect('/onboarding')
  }

  const employees = await prisma.employee.findMany({
    where: { tenantId: membership.tenantId },
    orderBy: { createdAt: 'desc' }
  })

  const statusColors: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-800',
    PROBATION: 'bg-yellow-100 text-yellow-800',
    ON_LEAVE: 'bg-blue-100 text-blue-800',
    TERMINATED: 'bg-red-100 text-red-800'
  }

  const contractColors: Record<string, string> = {
    FULL_TIME: 'bg-blue-100 text-blue-800',
    PART_TIME: 'bg-purple-100 text-purple-800',
    APPRENTICE: 'bg-orange-100 text-orange-800',
    INTERNSHIP: 'bg-pink-100 text-pink-800',
    FIXED_TERM: 'bg-yellow-100 text-yellow-800',
    FREELANCE: 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <DashboardHeader
          title="Dipendenti"
          subtitle="Gestisci il personale del tuo studio"
          tooltipTitle="Anagrafica Dipendenti"
          tooltipDescription="Da qui puoi visualizzare, aggiungere e modificare tutti i dipendenti della tua azienda. Ogni scheda contiene dati anagrafici, contrattuali e documentali."
          tooltipTips={[
            'Usa i filtri per trovare rapidamente un dipendente',
            'Clicca su Dettagli per vedere la scheda completa',
            'Esporta l\'elenco in Excel dal menu azioni'
          ]}
        />
        <Link
          href="/employees/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <span>+</span>
          <span>Nuovo Dipendente</span>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-4">
          <input
            type="search"
            placeholder="Cerca dipendente..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <select className="px-4 py-2 border border-gray-300 rounded-lg">
            <option value="">Tutti gli status</option>
            <option value="ACTIVE">Attivi</option>
            <option value="PROBATION">In prova</option>
            <option value="ON_LEAVE">In congedo</option>
            <option value="TERMINATED">Terminati</option>
          </select>
          <select className="px-4 py-2 border border-gray-300 rounded-lg">
            <option value="">Tutti i contratti</option>
            <option value="FULL_TIME">Tempo pieno</option>
            <option value="PART_TIME">Part-time</option>
            <option value="APPRENTICE">Apprendista</option>
          </select>
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dipendente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ruolo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contratto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Livello CCNL
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assunzione
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Azioni
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {employees.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">
                          {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {employee.firstName} {employee.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{employee.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{employee.jobTitle || '-'}</div>
                    <div className="text-sm text-gray-500">{employee.department || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${contractColors[employee.contractType]}`}>
                      {employee.contractType.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {employee.ccnlLevel || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[employee.status]}`}>
                      {employee.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(employee.hireDate).toLocaleDateString('it-IT')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Link
                      href={`/employees/${employee.id}`}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Dettagli
                    </Link>
                    <Link
                      href={`/employees/${employee.id}/edit`}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      Modifica
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {employees.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">👥</div>
            <p className="text-gray-500 mb-4">Nessun dipendente registrato</p>
            <Link
              href="/employees/new"
              className="inline-flex px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Aggiungi il primo dipendente
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
