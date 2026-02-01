import { PrismaClient, WhistleblowerType, WhistleblowingCategory, WhistleblowingStatus } from '@prisma/client'
import { randomBytes } from 'crypto'

const prisma = new PrismaClient()

function generateAccessCode(): string {
  return randomBytes(8).toString('hex').toUpperCase()
}

async function main() {
  console.log('Starting whistleblowing seed...')

  // Find demo tenant
  const tenant = await prisma.tenant.findFirst({
    where: {
      OR: [{ slug: 'demo' }, { slug: 'smiledoc' }],
    },
  })

  if (!tenant) {
    console.error('No demo tenant found. Please run seed-demo first.')
    return
  }

  console.log(`Found tenant: ${tenant.name}`)

  // Sample reports with different statuses
  const reports = [
    {
      reporterType: WhistleblowerType.ANONYMOUS,
      category: WhistleblowingCategory.SAFETY_VIOLATION,
      title: 'Mancata fornitura DPI adeguati',
      description:
        'Nella sala sterilizzazione non vengono forniti i guanti adeguati per la manipolazione degli strumenti. Viene richiesto di utilizzare guanti sottili non conformi alle normative di sicurezza. Situazione in corso da circa 2 mesi.',
      personsInvolved: 'Responsabile della sterilizzazione',
      evidence: 'Foto dei guanti non conformi disponibili',
      status: WhistleblowingStatus.UNDER_INVESTIGATION,
      acknowledgedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      investigationStartedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      reportDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      messages: [
        {
          senderType: 'manager',
          content:
            'Grazie per la segnalazione. Abbiamo avviato un\'indagine e stiamo verificando la conformità dei DPI forniti. Ti aggiorneremo entro 7 giorni.',
          createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        },
        {
          senderType: 'reporter',
          content:
            'Grazie per la risposta. Nel frattempo la situazione non è cambiata e continuiamo a utilizzare i guanti non conformi.',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
      ],
    },
    {
      reporterType: WhistleblowerType.CONFIDENTIAL,
      reporterName: 'Maria Rossi',
      reporterEmail: 'maria.rossi.confidential@example.com',
      reporterRole: 'Igienista Dentale',
      category: WhistleblowingCategory.HARASSMENT,
      title: 'Comportamento inappropriato da parte del responsabile',
      description:
        'Il responsabile di reparto ha avuto comportamenti verbali inappropriati e commenti sessisti nei confronti di alcune colleghe. Gli episodi si sono verificati durante le riunioni settimanali. Altre colleghe possono confermare.',
      personsInvolved: 'Dr. [Nome omesso] - Responsabile clinica',
      evidence: 'Testimonianze di altre due colleghe disponibili',
      status: WhistleblowingStatus.ACKNOWLEDGED,
      acknowledgedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      reportDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      messages: [
        {
          senderType: 'manager',
          content:
            'Abbiamo ricevuto la tua segnalazione e la prendiamo molto seriamente. Avvieremo un\'indagine confidenziale. La tua identità sarà protetta. Ti contatteremo a breve per raccogliere ulteriori dettagli.',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
      ],
    },
    {
      reporterType: WhistleblowerType.IDENTIFIED,
      reporterName: 'Giuseppe Bianchi',
      reporterEmail: 'giuseppe.bianchi@example.com',
      reporterPhone: '+39 320 1234567',
      reporterRole: 'Assistente alla poltrona',
      category: WhistleblowingCategory.FINANCIAL_IRREGULARITY,
      title: 'Fatture false per forniture mai ricevute',
      description:
        'Ho notato che nell\'ultimo trimestre sono state registrate fatture per forniture odontoiatriche mai arrivate in studio. I prodotti fatturati (resine composite, anestetici) non corrispondono a quelli effettivamente utilizzati. Importo totale circa 5.000 euro.',
      personsInvolved: 'Responsabile acquisti e fornitore XYZ S.r.l.',
      evidence:
        'Copie delle fatture e registro prodotti in magazzino che non corrispondono',
      status: WhistleblowingStatus.CLOSED,
      acknowledgedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
      investigationStartedAt: new Date(Date.now() - 23 * 24 * 60 * 60 * 1000),
      investigationCompletedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      closedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      reportDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      outcome:
        'Dopo un\'accurata indagine, abbiamo verificato le irregolarità segnalate. È stato scoperto un accordo fraudolento tra il responsabile acquisti e il fornitore. Sono state intraprese azioni disciplinari e legali.',
      actionsTaken:
        'Licenziamento del responsabile acquisti, denuncia penale presentata, interruzione rapporti con fornitore XYZ, implementazione nuovo sistema di controllo fatture.',
      messages: [
        {
          senderType: 'manager',
          content:
            'Grazie Giuseppe per la segnalazione. Abbiamo avviato un\'indagine immediata.',
          createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        },
        {
          senderType: 'manager',
          content:
            'Aggiornamento: abbiamo verificato le fatture e confermato le irregolarità. Stiamo procedendo con audit completo.',
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        },
        {
          senderType: 'reporter',
          content: 'Ci sono novità sull\'indagine?',
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        },
        {
          senderType: 'manager',
          content:
            'Sì, l\'indagine è conclusa. Abbiamo intrapreso azioni correttive. Ti informeremo nei dettagli a breve.',
          createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        },
      ],
    },
    {
      reporterType: WhistleblowerType.ANONYMOUS,
      category: WhistleblowingCategory.DATA_BREACH,
      title: 'Cartelle cliniche lasciate incustodite',
      description:
        'Le cartelle cliniche dei pazienti vengono spesso lasciate aperte sui computer dello studio senza che nessuno effettui il logout. Chiunque può accedere ai dati sensibili dei pazienti.',
      personsInvolved: 'Segreteria e assistenti',
      evidence: null,
      status: WhistleblowingStatus.RECEIVED,
      reportDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      messages: [],
    },
    {
      reporterType: WhistleblowerType.ANONYMOUS,
      category: WhistleblowingCategory.DISCRIMINATION,
      title: 'Disparità di trattamento nelle assegnazioni turni',
      description:
        'Noto che i turni più scomodi (sera e sabato) vengono sistematicamente assegnati solo ad alcuni dipendenti, sempre gli stessi, mentre altri hanno sempre turni favorevoli. Non ci sono criteri oggettivi e trasparenti.',
      personsInvolved: 'Responsabile planning turni',
      evidence: 'Registro turni ultimi 6 mesi',
      status: WhistleblowingStatus.ADDITIONAL_INFO_REQUESTED,
      acknowledgedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      investigationStartedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      reportDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
      messages: [
        {
          senderType: 'manager',
          content:
            'Abbiamo preso in carico la tua segnalazione. Stiamo analizzando il registro turni degli ultimi mesi.',
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        },
        {
          senderType: 'manager',
          content:
            'Potresti fornire maggiori dettagli? Quali sono i dipendenti penalizzati? Ci sono altri fattori (anzianità, contratto part-time, etc.) che potrebbero giustificare le differenze?',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        },
      ],
    },
    {
      reporterType: WhistleblowerType.IDENTIFIED,
      reporterName: 'Laura Gialli',
      reporterEmail: 'laura.gialli@example.com',
      reporterRole: 'Amministrazione',
      category: WhistleblowingCategory.FRAUD,
      title: 'Ore di straordinario non pagate',
      description:
        'Negli ultimi 3 mesi ho effettuato circa 40 ore di straordinario che non sono state retribuite. Ho segnalato la cosa al responsabile ma non è stato fatto nulla. Le timbrature sono tutte registrate nel sistema.',
      personsInvolved: 'Responsabile HR e consulente del lavoro',
      evidence: 'Report timbrature e buste paga senza straordinari',
      status: WhistleblowingStatus.SUBSTANTIATED,
      acknowledgedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      investigationStartedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
      investigationCompletedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      reportDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), // 25 days ago
      outcome:
        'Verificata la fondatezza della segnalazione. Errore nel processo di approvazione straordinari.',
      actionsTaken:
        'Pagamento immediato degli straordinari arretrati, revisione processo approvazione, implementazione alert automatici.',
      messages: [
        {
          senderType: 'manager',
          content:
            'Grazie Laura per la segnalazione. Verificheremo immediatamente la situazione con il consulente del lavoro.',
          createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        },
        {
          senderType: 'manager',
          content:
            'Confermato: c\'è stato un errore nel processo. Procederemo con il pagamento degli arretrati nella prossima busta paga. Ci scusiamo per il disagio.',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      ],
    },
  ]

  console.log(`Creating ${reports.length} sample reports...`)

  for (const reportData of reports) {
    const { messages, ...reportInfo } = reportData

    const report = await prisma.whistleblowingReport.create({
      data: {
        ...reportInfo,
        tenantId: tenant.id,
        accessCode: generateAccessCode(),
      },
    })

    console.log(`Created report: ${report.title}`)

    // Create messages
    if (messages && messages.length > 0) {
      for (const message of messages) {
        await prisma.whistleblowingMessage.create({
          data: {
            ...message,
            reportId: report.id,
          },
        })
      }
      console.log(`  - Created ${messages.length} messages`)
    }
  }

  console.log('Whistleblowing seed completed!')
}

main()
  .catch((e) => {
    console.error('Error during seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
