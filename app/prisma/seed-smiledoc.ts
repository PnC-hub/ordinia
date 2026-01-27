import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding Smiledoc demo account...')

  // Create Smiledoc tenant
  const smiledocTenant = await prisma.tenant.upsert({
    where: { slug: 'smiledoc' },
    update: {},
    create: {
      name: 'Smiledoc S.r.l.',
      slug: 'smiledoc',
      plan: 'PROFESSIONAL',
      subscriptionStatus: 'ACTIVE',
      primaryColor: '#0066cc',
      secondaryColor: '#00cc66'
    }
  })

  console.log('Created Smiledoc tenant:', smiledocTenant.name)

  // Create main user for Piero
  const pieroPassword = await bcrypt.hash('Smiledoc2025!', 12)

  const pieroUser = await prisma.user.upsert({
    where: { email: 'direzione@smiledoc.it' },
    update: {},
    create: {
      email: 'direzione@smiledoc.it',
      name: 'Piero Natale Civero',
      password: pieroPassword,
      role: 'ADMIN',
      emailVerified: new Date()
    }
  })

  // Link Piero to Smiledoc tenant
  await prisma.tenantMember.upsert({
    where: {
      userId_tenantId: {
        userId: pieroUser.id,
        tenantId: smiledocTenant.id
      }
    },
    update: {},
    create: {
      userId: pieroUser.id,
      tenantId: smiledocTenant.id,
      role: 'OWNER'
    }
  })

  console.log('Created admin user:', pieroUser.email)

  // Create Smiledoc employees
  const employees = [
    {
      id: 'smiledoc-maria',
      firstName: 'Maria',
      lastName: 'Rossi',
      email: 'maria.rossi@smiledoc.it',
      fiscalCode: 'RSSMRA85M41H501Z',
      jobTitle: 'ASO (Assistente Studio Odontoiatrico)',
      department: 'Clinica',
      contractType: 'FULL_TIME' as const,
      ccnlLevel: '4',
      hireDate: new Date('2020-03-01'),
      status: 'ACTIVE' as const
    },
    {
      id: 'smiledoc-luca',
      firstName: 'Luca',
      lastName: 'Bianchi',
      email: 'luca.bianchi@smiledoc.it',
      fiscalCode: 'BNCLCU90A15H501X',
      jobTitle: 'Segretario Amministrativo',
      department: 'Amministrazione',
      contractType: 'FULL_TIME' as const,
      ccnlLevel: '4',
      hireDate: new Date('2021-09-15'),
      status: 'ACTIVE' as const
    },
    {
      id: 'smiledoc-giulia',
      firstName: 'Giulia',
      lastName: 'Verdi',
      email: 'giulia.verdi@smiledoc.it',
      fiscalCode: 'VRDGLI92D45H501Y',
      jobTitle: 'ASO',
      department: 'Clinica',
      contractType: 'PART_TIME' as const,
      ccnlLevel: '5',
      hireDate: new Date('2023-06-01'),
      status: 'ACTIVE' as const
    },
    {
      id: 'smiledoc-marco',
      firstName: 'Marco',
      lastName: 'Neri',
      email: 'marco.neri@smiledoc.it',
      fiscalCode: 'NRIMRC95S20H501W',
      jobTitle: 'ASO Apprendista',
      department: 'Clinica',
      contractType: 'APPRENTICE' as const,
      ccnlLevel: '5',
      hireDate: new Date('2025-01-15'),
      probationEndsAt: new Date('2025-07-15'),
      status: 'PROBATION' as const
    },
    {
      id: 'smiledoc-anna',
      firstName: 'Anna',
      lastName: 'Ferrari',
      email: 'anna.ferrari@smiledoc.it',
      fiscalCode: 'FRRNNA88P52H501V',
      jobTitle: 'Office Manager',
      department: 'Amministrazione',
      contractType: 'FULL_TIME' as const,
      ccnlLevel: '3',
      hireDate: new Date('2019-02-01'),
      status: 'ACTIVE' as const
    }
  ]

  for (const emp of employees) {
    await prisma.employee.upsert({
      where: { id: emp.id },
      update: {},
      create: {
        tenantId: smiledocTenant.id,
        ...emp
      }
    })
  }

  console.log('Created', employees.length, 'employees')

  // Create document types and templates
  const documentTypes = [
    // Onboarding documents
    { type: 'CONTRACT', name: 'Contratto di Lavoro' },
    { type: 'GDPR_CONSENT', name: 'Informativa Privacy GDPR' },
    { type: 'NDA', name: 'Patto di Non Divulgazione' },
    { type: 'ID_DOCUMENT', name: 'Documento di Identita' },
    { type: 'TRAINING_CERTIFICATE', name: 'Attestato Formazione Sicurezza' },
    { type: 'MEDICAL_CERTIFICATE', name: 'Idoneita Sanitaria' },
    { type: 'DPI_RECEIPT', name: 'Consegna DPI' },
    // Administrative
    { type: 'PAYSLIP', name: 'Busta Paga' },
    { type: 'VARIATION', name: 'Variazione Dati Anagrafici' },
    { type: 'LEAVE_REQUEST', name: 'Richiesta Ferie' },
    // Disciplinary
    { type: 'DISCIPLINARY', name: 'Contestazione Disciplinare' },
    { type: 'WARNING', name: 'Richiamo Scritto' },
    // Policy
    { type: 'POLICY', name: 'Regolamento Aziendale' },
    { type: 'EMAIL_POLICY', name: 'Policy Uso Email' },
    { type: 'SMART_WORKING', name: 'Accordo Smart Working' }
  ]

  // Create sample documents for employees
  const sampleDocs = [
    // Maria Rossi - Full documentation
    {
      tenantId: smiledocTenant.id,
      employeeId: 'smiledoc-maria',
      name: 'Contratto Tempo Indeterminato - Maria Rossi',
      type: 'CONTRACT' as const,
      category: 'Onboarding',
      filePath: '/documents/smiledoc/maria_contratto.pdf',
      fileSize: 125000,
      mimeType: 'application/pdf'
    },
    {
      tenantId: smiledocTenant.id,
      employeeId: 'smiledoc-maria',
      name: 'Informativa Privacy GDPR - Maria Rossi',
      type: 'GDPR_CONSENT' as const,
      category: 'GDPR',
      filePath: '/documents/smiledoc/maria_privacy.pdf',
      fileSize: 85000,
      mimeType: 'application/pdf'
    },
    {
      tenantId: smiledocTenant.id,
      employeeId: 'smiledoc-maria',
      name: 'Attestato Formazione Generale 81/08 - Maria Rossi',
      type: 'TRAINING_CERTIFICATE' as const,
      category: 'Sicurezza',
      filePath: '/documents/smiledoc/maria_formazione_generale.pdf',
      fileSize: 95000,
      mimeType: 'application/pdf'
    },
    {
      tenantId: smiledocTenant.id,
      employeeId: 'smiledoc-maria',
      name: 'Attestato Formazione Specifica 81/08 - Maria Rossi',
      type: 'TRAINING_CERTIFICATE' as const,
      category: 'Sicurezza',
      filePath: '/documents/smiledoc/maria_formazione_specifica.pdf',
      fileSize: 110000,
      mimeType: 'application/pdf',
      expiresAt: new Date('2028-03-01')
    },
    {
      tenantId: smiledocTenant.id,
      employeeId: 'smiledoc-maria',
      name: 'Idoneita Sanitaria - Maria Rossi',
      type: 'MEDICAL_CERTIFICATE' as const,
      category: 'Sicurezza',
      filePath: '/documents/smiledoc/maria_idoneita.pdf',
      fileSize: 75000,
      mimeType: 'application/pdf',
      expiresAt: new Date('2026-03-01')
    },
    // Luca Bianchi
    {
      tenantId: smiledocTenant.id,
      employeeId: 'smiledoc-luca',
      name: 'Contratto Tempo Indeterminato - Luca Bianchi',
      type: 'CONTRACT' as const,
      category: 'Onboarding',
      filePath: '/documents/smiledoc/luca_contratto.pdf',
      fileSize: 128000,
      mimeType: 'application/pdf'
    },
    {
      tenantId: smiledocTenant.id,
      employeeId: 'smiledoc-luca',
      name: 'Informativa Privacy GDPR - Luca Bianchi',
      type: 'GDPR_CONSENT' as const,
      category: 'GDPR',
      filePath: '/documents/smiledoc/luca_privacy.pdf',
      fileSize: 85000,
      mimeType: 'application/pdf'
    },
    // Marco Neri - Nuovo assunto in onboarding
    {
      tenantId: smiledocTenant.id,
      employeeId: 'smiledoc-marco',
      name: 'Contratto Apprendistato - Marco Neri',
      type: 'CONTRACT' as const,
      category: 'Onboarding',
      filePath: '/documents/smiledoc/marco_contratto.pdf',
      fileSize: 145000,
      mimeType: 'application/pdf'
    }
  ]

  for (const doc of sampleDocs) {
    await prisma.document.create({
      data: doc
    })
  }

  console.log('Created sample documents')

  // Create deadlines/scadenze
  const deadlines = [
    {
      tenantId: smiledocTenant.id,
      title: 'Rinnovo Formazione Specifica 81/08 - Maria Rossi',
      type: 'TRAINING_EXPIRY' as const,
      dueDate: new Date('2028-03-01'),
      employeeId: 'smiledoc-maria',
      notify30Days: true,
      notify60Days: true
    },
    {
      tenantId: smiledocTenant.id,
      title: 'Visita Medica Periodica - Maria Rossi',
      type: 'MEDICAL_VISIT' as const,
      dueDate: new Date('2026-03-01'),
      employeeId: 'smiledoc-maria',
      notify30Days: true,
      notify60Days: true
    },
    {
      tenantId: smiledocTenant.id,
      title: 'Fine Periodo di Prova - Marco Neri',
      type: 'PROBATION_END' as const,
      dueDate: new Date('2025-07-15'),
      employeeId: 'smiledoc-marco',
      notify30Days: true,
      notify60Days: true
    },
    {
      tenantId: smiledocTenant.id,
      title: 'Rinnovo Formazione Antincendio - Giulia Verdi',
      type: 'TRAINING_EXPIRY' as const,
      dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 giorni
      employeeId: 'smiledoc-giulia',
      notify30Days: true,
      notify60Days: true
    },
    {
      tenantId: smiledocTenant.id,
      title: 'Scadenza Contratto a Termine - Prova',
      type: 'CONTRACT_EXPIRY' as const,
      dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 giorni
      notify30Days: true,
      notify90Days: true
    }
  ]

  for (const deadline of deadlines) {
    await prisma.deadline.create({ data: deadline })
  }

  console.log('Created deadlines')

  // Create safety training records
  const safetyTrainings = [
    {
      tenantId: smiledocTenant.id,
      employeeId: 'smiledoc-maria',
      trainingType: 'GENERAL' as const,
      title: 'Formazione Generale 81/08',
      hoursCompleted: 4,
      hoursRequired: 4,
      completedAt: new Date('2020-03-15'),
      status: 'COMPLETED' as const
    },
    {
      tenantId: smiledocTenant.id,
      employeeId: 'smiledoc-maria',
      trainingType: 'SPECIFIC_LOW' as const,
      title: 'Formazione Specifica Rischio Basso',
      hoursCompleted: 4,
      hoursRequired: 4,
      completedAt: new Date('2023-03-01'),
      expiresAt: new Date('2028-03-01'),
      status: 'COMPLETED' as const
    },
    {
      tenantId: smiledocTenant.id,
      employeeId: 'smiledoc-maria',
      trainingType: 'FIRE_PREVENTION' as const,
      title: 'Antincendio Rischio Medio',
      hoursCompleted: 8,
      hoursRequired: 8,
      completedAt: new Date('2023-03-01'),
      expiresAt: new Date('2028-03-01'),
      status: 'COMPLETED' as const
    },
    {
      tenantId: smiledocTenant.id,
      employeeId: 'smiledoc-maria',
      trainingType: 'FIRST_AID' as const,
      title: 'Primo Soccorso Gruppo B',
      hoursCompleted: 12,
      hoursRequired: 12,
      completedAt: new Date('2023-06-15'),
      expiresAt: new Date('2026-06-15'),
      status: 'COMPLETED' as const
    },
    {
      tenantId: smiledocTenant.id,
      employeeId: 'smiledoc-luca',
      trainingType: 'GENERAL' as const,
      title: 'Formazione Generale 81/08',
      hoursCompleted: 4,
      hoursRequired: 4,
      completedAt: new Date('2021-09-20'),
      status: 'COMPLETED' as const
    },
    {
      tenantId: smiledocTenant.id,
      employeeId: 'smiledoc-luca',
      trainingType: 'SPECIFIC_LOW' as const,
      title: 'Formazione Specifica Rischio Basso',
      hoursCompleted: 4,
      hoursRequired: 4,
      completedAt: new Date('2021-09-20'),
      expiresAt: new Date('2026-09-20'),
      status: 'COMPLETED' as const
    },
    {
      tenantId: smiledocTenant.id,
      employeeId: 'smiledoc-marco',
      trainingType: 'GENERAL' as const,
      title: 'Formazione Generale 81/08',
      hoursCompleted: 0,
      hoursRequired: 4,
      status: 'NOT_STARTED' as const
    },
    {
      tenantId: smiledocTenant.id,
      employeeId: 'smiledoc-marco',
      trainingType: 'SPECIFIC_LOW' as const,
      title: 'Formazione Specifica Rischio Basso',
      hoursCompleted: 0,
      hoursRequired: 4,
      status: 'NOT_STARTED' as const
    }
  ]

  for (const training of safetyTrainings) {
    await prisma.safetyTraining.create({ data: training })
  }

  console.log('Created safety training records')

  // Create onboarding checklist for Smiledoc
  const checklist = await prisma.onboardingChecklist.upsert({
    where: { id: 'smiledoc-checklist' },
    update: {},
    create: {
      id: 'smiledoc-checklist',
      tenantId: smiledocTenant.id,
      name: 'Checklist Onboarding Smiledoc',
      description: 'Checklist completa per inserimento nuovi collaboratori studio odontoiatrico',
      isDefault: true
    }
  })

  const checklistItems = [
    // Pre-assunzione
    { title: 'Raccolta documento identita (CI/Passaporto)', category: 'Pre-Assunzione', order: 1, required: true },
    { title: 'Raccolta codice fiscale', category: 'Pre-Assunzione', order: 2, required: true },
    { title: 'Raccolta titolo di studio', category: 'Pre-Assunzione', order: 3, required: false },
    { title: 'Verifica referenze lavorative', category: 'Pre-Assunzione', order: 4, required: false },
    // Contrattuale
    { title: 'Lettera di assunzione firmata', category: 'Contrattuale', order: 5, required: true },
    { title: 'Contratto di lavoro firmato', category: 'Contrattuale', order: 6, required: true },
    { title: 'Patto di non concorrenza (se applicabile)', category: 'Contrattuale', order: 7, required: false },
    { title: 'Accordo smart working (se applicabile)', category: 'Contrattuale', order: 8, required: false },
    // GDPR e Privacy
    { title: 'Informativa privacy Art. 13 GDPR firmata', category: 'GDPR', order: 9, required: true },
    { title: 'Consenso trattamento dati personali', category: 'GDPR', order: 10, required: true },
    { title: 'Consenso pubblicazione foto/video', category: 'GDPR', order: 11, required: false },
    { title: 'NDA - Patto di riservatezza firmato', category: 'GDPR', order: 12, required: true },
    // Sicurezza 81/08
    { title: 'Visita medica preassuntiva', category: 'Sicurezza', order: 13, required: true },
    { title: 'Idoneita sanitaria rilasciata', category: 'Sicurezza', order: 14, required: true },
    { title: 'Formazione generale sicurezza (4h)', category: 'Sicurezza', order: 15, required: true },
    { title: 'Formazione specifica rischio (4-8h)', category: 'Sicurezza', order: 16, required: true },
    { title: 'Consegna DPI con verbale firmato', category: 'Sicurezza', order: 17, required: true },
    { title: 'Formazione antincendio', category: 'Sicurezza', order: 18, required: false },
    { title: 'Formazione primo soccorso', category: 'Sicurezza', order: 19, required: false },
    // IT e Accessi
    { title: 'Creazione email aziendale', category: 'IT', order: 20, required: true },
    { title: 'Creazione account gestionale', category: 'IT', order: 21, required: true },
    { title: 'Consegna badge/chiavi accesso', category: 'IT', order: 22, required: true },
    { title: 'Policy uso strumenti informatici firmata', category: 'IT', order: 23, required: true },
    // Amministrativo
    { title: 'Comunicazione IBAN per accredito stipendio', category: 'Amministrativo', order: 24, required: true },
    { title: 'Modulo detrazioni fiscali compilato', category: 'Amministrativo', order: 25, required: true },
    { title: 'Iscrizione fondo previdenza complementare', category: 'Amministrativo', order: 26, required: false }
  ]

  for (const item of checklistItems) {
    await prisma.onboardingChecklistItem.create({
      data: {
        checklistId: checklist.id,
        ...item
      }
    })
  }

  console.log('Created onboarding checklist with', checklistItems.length, 'items')

  // Create onboarding timeline for Marco (new hire)
  const onboardingPhases = [
    { phase: 'DOCUMENTS_COLLECTION' as const, title: 'Raccolta Documenti', status: 'IN_PROGRESS' as const, order: 1 },
    { phase: 'OFFER_LETTER' as const, title: 'Firma Contratto', status: 'COMPLETED' as const, order: 2, completedAt: new Date('2025-01-15') },
    { phase: 'PRIVACY_CONSENT' as const, title: 'Privacy e GDPR', status: 'IN_PROGRESS' as const, order: 3 },
    { phase: 'SAFETY_TRAINING_GENERAL' as const, title: 'Formazione Sicurezza', status: 'PENDING' as const, order: 4 },
    { phase: 'IT_ACCOUNTS' as const, title: 'Setup IT e Accessi', status: 'PENDING' as const, order: 5 },
    { phase: 'TOOLS_TRAINING' as const, title: 'Formazione Ruolo', status: 'PENDING' as const, order: 6 }
  ]

  for (const phase of onboardingPhases) {
    await prisma.onboardingTimeline.create({
      data: {
        tenantId: smiledocTenant.id,
        employeeId: 'smiledoc-marco',
        ...phase,
        dueDate: new Date(Date.now() + phase.order * 7 * 24 * 60 * 60 * 1000)
      }
    })
  }

  console.log('Created onboarding timeline for Marco Neri')

  // Create sample leave requests
  const leaveRequests = [
    {
      tenantId: smiledocTenant.id,
      employeeId: 'smiledoc-maria',
      type: 'VACATION' as const,
      status: 'APPROVED' as const,
      startDate: new Date('2025-08-11'),
      endDate: new Date('2025-08-22'),
      totalDays: 10,
      reason: 'Ferie estive'
    },
    {
      tenantId: smiledocTenant.id,
      employeeId: 'smiledoc-luca',
      type: 'VACATION' as const,
      status: 'PENDING' as const,
      startDate: new Date('2025-04-21'),
      endDate: new Date('2025-04-25'),
      totalDays: 5,
      reason: 'Ponte 25 aprile'
    },
    {
      tenantId: smiledocTenant.id,
      employeeId: 'smiledoc-giulia',
      type: 'MEDICAL_VISIT' as const,
      status: 'APPROVED' as const,
      startDate: new Date('2025-02-14'),
      endDate: new Date('2025-02-14'),
      totalDays: 1,
      reason: 'Visita medica personale'
    }
  ]

  for (const leave of leaveRequests) {
    await prisma.leaveRequest.create({ data: leave })
  }

  console.log('Created sample leave requests')

  // Create sample expense requests
  const expenseRequests = [
    {
      tenantId: smiledocTenant.id,
      employeeId: 'smiledoc-anna',
      type: 'MILEAGE' as const,
      status: 'APPROVED' as const,
      amount: 45.50,
      description: 'Rimborso km trasferta Roma - 35km x 1.30',
      date: new Date('2025-01-20'),
      kilometers: 35,
      ratePerKm: 1.30
    },
    {
      tenantId: smiledocTenant.id,
      employeeId: 'smiledoc-luca',
      type: 'SUPPLIES' as const,
      status: 'PENDING' as const,
      amount: 89.90,
      description: 'Acquisto cancelleria e materiale ufficio',
      date: new Date('2025-01-25')
    }
  ]

  for (const expense of expenseRequests) {
    await prisma.expenseRequest.create({ data: expense })
  }

  console.log('Created sample expense requests')

  // Create sample payslips for last 3 months
  const periods = ['2024-10', '2024-11', '2024-12']

  const payslipData = [
    { employeeId: 'smiledoc-maria', firstName: 'Maria', lastName: 'Rossi', grossAmount: 1850, netAmount: 1420 },
    { employeeId: 'smiledoc-luca', firstName: 'Luca', lastName: 'Bianchi', grossAmount: 1750, netAmount: 1350 },
    { employeeId: 'smiledoc-giulia', firstName: 'Giulia', lastName: 'Verdi', grossAmount: 925, netAmount: 750 },
    { employeeId: 'smiledoc-anna', firstName: 'Anna', lastName: 'Ferrari', grossAmount: 2200, netAmount: 1680 }
  ]

  for (const period of periods) {
    for (const payslip of payslipData) {
      const fileName = `cedolino_${payslip.lastName.toLowerCase()}_${period}.pdf`
      await prisma.payslip.create({
        data: {
          tenantId: smiledocTenant.id,
          employeeId: payslip.employeeId,
          period: period,
          grossAmount: payslip.grossAmount,
          netAmount: payslip.netAmount,
          fileName: fileName,
          fileUrl: `/payslips/smiledoc/${fileName}`,
          uploadedBy: pieroUser.id
        }
      })
    }
  }

  console.log('Created sample payslips')

  console.log('='.repeat(50))
  console.log('Smiledoc seed completed!')
  console.log('='.repeat(50))
  console.log('')
  console.log('Login credentials:')
  console.log('  Email: direzione@smiledoc.it')
  console.log('  Password: Smiledoc2025!')
  console.log('')
  console.log('Employees created:')
  employees.forEach(emp => {
    console.log(`  - ${emp.firstName} ${emp.lastName} (${emp.jobTitle})`)
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
