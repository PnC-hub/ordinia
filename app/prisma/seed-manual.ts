import { PrismaClient, ManualArticleStatus, ChecklistFrequency } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

// Path to the Smiledoc manual docs
const DOCS_PATH = path.join(__dirname, '../../../Geniusmile-Manuale-Smiledoc/docs')

// Category tree definition with icons and descriptions
const CATEGORY_TREE: CategoryDef[] = [
  {
    name: 'Clinica',
    slug: 'clinica',
    icon: 'hospital',
    description: 'Procedure operative, protocolli clinici e checklist dello studio',
    children: [
      { name: 'Checklist Operative', slug: 'clinica-checklist', icon: 'clipboard-check', description: 'Checklist giornaliere, settimanali e mensili' },
      { name: 'Moduli Anamnesi', slug: 'clinica-moduli-anamnesi', icon: 'file-medical', description: 'Moduli anamnestici per adulti e pediatrici' },
      { name: 'Moduli Clinici', slug: 'clinica-moduli-clinici', icon: 'stethoscope', description: 'Cartella clinica, diario clinico, piano trattamento' },
      { name: 'Moduli Consensi', slug: 'clinica-moduli-consensi', icon: 'file-signature', description: 'Consensi informati per ogni specialità' },
      { name: 'Procedure Segreteria', slug: 'clinica-procedure-segreteria', icon: 'phone', description: 'Gestione appuntamenti, telefonate, disdette' },
      { name: 'Procedure Magazzino', slug: 'clinica-procedure-magazzino', icon: 'boxes-stacked', description: 'Ordini, inventario, fornitori, scadenze' },
      { name: 'Procedure Comunicazione', slug: 'clinica-procedure-comunicazione', icon: 'comments', description: 'Recall, SMS, recensioni, reclami' },
      { name: 'Protocolli Accoglienza', slug: 'clinica-protocolli-accoglienza', icon: 'hand-holding-heart', description: 'Prima visita, visite successive, gestione attesa' },
      { name: 'Protocolli DVR', slug: 'clinica-protocolli-dvr', icon: 'shield-halved', description: 'DPI, piano emergenza, rischi specifici' },
      { name: 'Protocolli Emergenze', slug: 'clinica-protocolli-emergenze', icon: 'kit-medical', description: 'Emergenze mediche, kit, reazioni allergiche, sincope' },
      { name: 'Protocolli Igiene', slug: 'clinica-protocolli-igiene', icon: 'hand-sparkles', description: 'Disinfezione, gestione rifiuti, igiene mani' },
      { name: 'Protocolli Normativa', slug: 'clinica-protocolli-normativa', icon: 'scale-balanced', description: 'Autorizzazioni, obblighi sanitari, requisiti strutturali' },
      { name: 'Protocolli Radiologia', slug: 'clinica-protocolli-radiologia', icon: 'x-ray', description: 'Panoramica, protezione paziente, rx endorali' },
      { name: 'Protocolli Radioprotezione', slug: 'clinica-protocolli-radioprotezione', icon: 'radiation', description: 'Controlli periodici, dosimetria, esperto qualificato' },
      { name: 'Protocolli Rifiuti', slug: 'clinica-protocolli-rifiuti', icon: 'trash-can', description: 'Classificazione, registro carico-scarico, smaltimento' },
      { name: 'Protocolli Sterilizzazione', slug: 'clinica-protocolli-sterilizzazione', icon: 'temperature-high', description: 'Ciclo sterilizzazione, manutenzione autoclave, tracciabilità' },
    ]
  },
  {
    name: 'Corporate',
    slug: 'corporate',
    icon: 'building',
    description: 'Gestione aziendale, amministrazione, formazione e valutazione',
    children: [
      { name: 'Amministrazione', slug: 'corporate-amministrazione', icon: 'calculator', description: 'Fatturazione, incassi, preventivi, prima nota, recupero crediti' },
      { name: 'Formazione', slug: 'corporate-formazione', icon: 'graduation-cap', description: 'ECM, formazione obbligatoria, software' },
      { name: 'Onboarding', slug: 'corporate-onboarding', icon: 'user-plus', description: 'Primo giorno, prima settimana, primo mese' },
      { name: 'Ruoli e Mansionari', slug: 'corporate-ruoli', icon: 'users', description: 'Assistente poltrona, igienista, odontoiatra, segretaria' },
      { name: 'Valutazione', slug: 'corporate-valutazione', icon: 'chart-line', description: 'Feedback e obiettivi' },
      { name: 'KPI e Indicatori', slug: 'corporate-indicatori', icon: 'gauge', description: 'KPI clinici, gestionali, soddisfazione paziente' },
      { name: 'Miglioramento Continuo', slug: 'corporate-miglioramento', icon: 'arrows-rotate', description: 'Audit interni, azioni correttive, riunioni staff' },
      { name: 'Standard Qualità', slug: 'corporate-standard', icon: 'award', description: 'Comunicazione paziente, follow-up, tempi attesa' },
    ]
  },
  {
    name: 'Privacy e GDPR',
    slug: 'generali',
    icon: 'lock',
    description: 'Informativa privacy, consensi trattamento e marketing',
    children: [
      { name: 'Moduli Privacy', slug: 'generali-privacy', icon: 'file-shield', description: 'Informativa, consenso trattamento, consenso marketing' },
      { name: 'Procedure Generali', slug: 'generali-procedure', icon: 'list-check', description: 'Gestione reclami' },
      { name: 'Protocolli Generali', slug: 'generali-protocolli', icon: 'clipboard', description: 'Igiene mani' },
    ]
  },
  {
    name: 'Sistema Documentale',
    slug: 'sistema-documentale',
    icon: 'folder-open',
    description: 'Registro documenti, revisioni, prese visione, conformità ISO',
    children: []
  },
  {
    name: 'Sistema HR',
    slug: 'sistema-hr',
    icon: 'people-group',
    description: 'Assistente AI, documenti, formazione dipendenti',
    children: []
  },
]

interface CategoryDef {
  name: string
  slug: string
  icon: string
  description: string
  children?: CategoryDef[]
}

// Map file paths to category slugs
function getCategorySlug(filePath: string): string {
  const mapping: Record<string, string> = {
    'clinica/checklist': 'clinica-checklist',
    'clinica/moduli/anamnesi': 'clinica-moduli-anamnesi',
    'clinica/moduli/clinici': 'clinica-moduli-clinici',
    'clinica/moduli/consensi': 'clinica-moduli-consensi',
    'clinica/procedure/segreteria': 'clinica-procedure-segreteria',
    'clinica/procedure/magazzino': 'clinica-procedure-magazzino',
    'clinica/procedure/comunicazione': 'clinica-procedure-comunicazione',
    'clinica/protocolli/accoglienza': 'clinica-protocolli-accoglienza',
    'clinica/protocolli/dvr': 'clinica-protocolli-dvr',
    'clinica/protocolli/emergenze': 'clinica-protocolli-emergenze',
    'clinica/protocolli/igiene': 'clinica-protocolli-igiene',
    'clinica/protocolli/normativa': 'clinica-protocolli-normativa',
    'clinica/protocolli/radiologia': 'clinica-protocolli-radiologia',
    'clinica/protocolli/radioprotezione': 'clinica-protocolli-radioprotezione',
    'clinica/protocolli/rifiuti': 'clinica-protocolli-rifiuti',
    'clinica/protocolli/sterilizzazione': 'clinica-protocolli-sterilizzazione',
    'corporate/procedure/amministrazione': 'corporate-amministrazione',
    'corporate/procedure/formazione': 'corporate-formazione',
    'corporate/procedure/onboarding': 'corporate-onboarding',
    'corporate/procedure/ruoli': 'corporate-ruoli',
    'corporate/procedure/valutazione': 'corporate-valutazione',
    'corporate/protocolli/indicatori': 'corporate-indicatori',
    'corporate/protocolli/miglioramento': 'corporate-miglioramento',
    'corporate/protocolli/standard': 'corporate-standard',
    'generali/moduli/privacy': 'generali-privacy',
    'generali/procedure': 'generali-procedure',
    'generali/protocolli': 'generali-protocolli',
    'sistema-documentale': 'sistema-documentale',
    'sistema-hr': 'sistema-hr',
  }

  // Find the best matching prefix
  const dir = path.dirname(filePath)
  for (const [prefix, slug] of Object.entries(mapping)) {
    if (dir === prefix || dir.startsWith(prefix + '/')) {
      return slug
    }
  }
  return 'generali'
}

function slugFromFilename(filename: string): string {
  return path.basename(filename, '.md')
}

function titleFromContent(content: string, filename: string): string {
  // Extract title from first # heading
  const match = content.match(/^#\s+(.+)$/m)
  if (match) return match[1].trim()
  // Fallback: humanize filename
  return filename
    .replace('.md', '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
}

function getAllMdFiles(dir: string, base: string = ''): { relativePath: string; fullPath: string }[] {
  const results: { relativePath: string; fullPath: string }[] = []
  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    const relativePath = base ? `${base}/${entry.name}` : entry.name

    if (entry.isDirectory()) {
      results.push(...getAllMdFiles(fullPath, relativePath))
    } else if (entry.name.endsWith('.md') && entry.name !== 'index.md') {
      results.push({ relativePath, fullPath })
    }
  }

  return results
}

async function main() {
  console.log('🔵 Seeding Smiledoc Manual...')
  console.log(`📁 Reading docs from: ${DOCS_PATH}`)

  // Find the Smiledoc tenant
  const tenant = await prisma.tenant.findUnique({ where: { slug: 'smiledoc' } })
  if (!tenant) {
    console.error('❌ Smiledoc tenant not found! Run seed-smiledoc first.')
    process.exit(1)
  }

  console.log(`✅ Found tenant: ${tenant.name} (${tenant.id})`)

  // Clean existing manual data for this tenant
  console.log('🧹 Cleaning existing manual data...')
  await prisma.manualChecklistExecution.deleteMany({ where: { checklist: { tenantId: tenant.id } } })
  await prisma.manualChecklistItem.deleteMany({ where: { checklist: { tenantId: tenant.id } } })
  await prisma.manualChecklist.deleteMany({ where: { tenantId: tenant.id } })
  await prisma.manualAcknowledgment.deleteMany({ where: { article: { tenantId: tenant.id } } })
  await prisma.manualRevision.deleteMany({ where: { article: { tenantId: tenant.id } } })
  await prisma.manualArticle.deleteMany({ where: { tenantId: tenant.id } })
  await prisma.manualCategory.deleteMany({ where: { tenantId: tenant.id } })

  // Create categories
  console.log('📂 Creating categories...')
  const categoryMap: Record<string, string> = {} // slug -> id

  let orderCounter = 0
  for (const cat of CATEGORY_TREE) {
    const parent = await prisma.manualCategory.create({
      data: {
        tenantId: tenant.id,
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon,
        description: cat.description,
        order: orderCounter++,
      }
    })
    categoryMap[cat.slug] = parent.id
    console.log(`  📁 ${cat.name}`)

    if (cat.children) {
      let childOrder = 0
      for (const child of cat.children) {
        const childCat = await prisma.manualCategory.create({
          data: {
            tenantId: tenant.id,
            name: child.name,
            slug: child.slug,
            icon: child.icon,
            description: child.description,
            order: childOrder++,
            parentId: parent.id,
          }
        })
        categoryMap[child.slug] = childCat.id
        console.log(`    📄 ${child.name}`)
      }
    }
  }

  // Import articles from MD files
  console.log('\n📖 Importing articles...')

  if (!fs.existsSync(DOCS_PATH)) {
    console.error(`❌ Docs path not found: ${DOCS_PATH}`)
    console.log('⚠️ Skipping article import. Create articles manually or clone the Manuale repo.')
    return
  }

  const mdFiles = getAllMdFiles(DOCS_PATH)
  console.log(`Found ${mdFiles.length} articles to import`)

  let imported = 0
  for (const { relativePath, fullPath } of mdFiles) {
    const content = fs.readFileSync(fullPath, 'utf-8')
    const slug = slugFromFilename(relativePath)
    const title = titleFromContent(content, path.basename(relativePath))
    const categorySlug = getCategorySlug(relativePath)
    const categoryId = categoryMap[categorySlug]

    if (!categoryId) {
      console.warn(`  ⚠️ No category for: ${relativePath} (tried: ${categorySlug})`)
      continue
    }

    await prisma.manualArticle.create({
      data: {
        tenantId: tenant.id,
        categoryId,
        title,
        slug,
        content,
        status: ManualArticleStatus.PUBLISHED,
        version: 1,
        isTemplate: false,
        order: imported,
        publishedAt: new Date(),
        createdBy: 'seed',
        updatedBy: 'seed',
      }
    })
    imported++
    console.log(`  ✅ ${title}`)
  }

  console.log(`\n📊 Imported ${imported} articles`)

  // Create checklists from the checklist articles
  console.log('\n📋 Creating checklists...')

  const checklistDefs = [
    {
      name: 'Checklist Apertura Studio',
      description: 'Da eseguire ogni mattina prima dell\'arrivo dei pazienti',
      frequency: ChecklistFrequency.DAILY,
      items: [
        'Disattivare allarme',
        'Accendere luci generali',
        'Verificare assenza anomalie/effrazioni',
        'Accendere climatizzazione e verificare temperatura',
        'Accendere computer reception',
        'Verificare funzionamento telefono',
        'Controllare ordine sala attesa',
        'Accendere riuniti odontoiatrici',
        'Flussaggio linee idriche (2 min per riunito)',
        'Verificare funzionamento aspirazione',
        'Verificare funzionamento compressore',
        'Controllare scorte materiali consumo',
        'Accendere autoclave',
        'Eseguire ciclo riscaldamento autoclave',
        'Eseguire test Bowie-Dick',
        'Verificare scorte buste e indicatori',
      ]
    },
    {
      name: 'Checklist Chiusura Studio',
      description: 'Da eseguire ogni sera dopo l\'ultimo paziente',
      frequency: ChecklistFrequency.DAILY,
      items: [
        'Spegnere riuniti odontoiatrici',
        'Disinfezione finale riuniti',
        'Svuotare aspirazione se necessario',
        'Pulire e riordinare piani di lavoro',
        'Svuotare contenitori rifiuti speciali se pieni',
        'Verificare chiusura armadi farmaci',
        'Completare cicli sterilizzazione in corso',
        'Spegnere autoclave',
        'Spegnere computer e stampanti',
        'Verificare chiusura finestre',
        'Impostare allarme',
        'Chiudere a chiave',
      ]
    },
    {
      name: 'Controllo Settimanale',
      description: 'Verifiche da effettuare ogni settimana',
      frequency: ChecklistFrequency.WEEKLY,
      items: [
        'Pulizia approfondita riuniti',
        'Pulizia filtri aspirazione',
        'Verifica scorte materiali',
        'Verifica scadenze materiali prossimi',
        'Pulizia approfondita sala attesa',
        'Backup dati gestionale',
        'Verifica funzionamento emergenze',
        'Aggiornamento registro sterilizzazione',
      ]
    },
    {
      name: 'Controllo Mensile',
      description: 'Verifiche da effettuare ogni mese',
      frequency: ChecklistFrequency.MONTHLY,
      items: [
        'Manutenzione preventiva riuniti',
        'Controllo scadenze farmaci emergenza',
        'Inventario materiali consumo',
        'Verifica estintori e dotazioni emergenza',
        'Pulizia profonda sterilizzatrice',
        'Verifica registro rifiuti',
        'Review appuntamenti mese successivo',
        'Analisi KPI clinici',
      ]
    },
    {
      name: 'Preparazione Riunito',
      description: 'Da eseguire prima di ogni paziente',
      frequency: ChecklistFrequency.ON_DEMAND,
      items: [
        'Posizionare barriere protettive',
        'Preparare strumentario necessario',
        'Verificare disponibilità materiali',
        'Posizionare aspirasaliva e cannule',
        'Verificare funzionamento lampada',
        'Preparare bicchiere e tovagliolo paziente',
      ]
    },
  ]

  const checklistCategoryId = categoryMap['clinica-checklist']

  for (const def of checklistDefs) {
    // Find associated article if exists
    const article = await prisma.manualArticle.findFirst({
      where: {
        tenantId: tenant.id,
        categoryId: checklistCategoryId,
        slug: { contains: def.name.toLowerCase().includes('apertura') ? 'apertura' :
                          def.name.toLowerCase().includes('chiusura') ? 'chiusura' :
                          def.name.toLowerCase().includes('settimanale') ? 'settimanale' :
                          def.name.toLowerCase().includes('mensile') ? 'mensile' : 'preparazione' }
      }
    })

    const checklist = await prisma.manualChecklist.create({
      data: {
        tenantId: tenant.id,
        articleId: article?.id || null,
        name: def.name,
        description: def.description,
        frequency: def.frequency,
        items: {
          create: def.items.map((text, i) => ({
            text,
            order: i,
            mandatory: true,
          }))
        }
      }
    })
    console.log(`  ✅ ${checklist.name} (${def.items.length} items)`)
  }

  console.log('\n🎉 Smiledoc Manual seed complete!')
  console.log(`   Categories: ${Object.keys(categoryMap).length}`)
  console.log(`   Articles: ${imported}`)
  console.log(`   Checklists: ${checklistDefs.length}`)
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
