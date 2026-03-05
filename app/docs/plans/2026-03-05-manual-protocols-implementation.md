# Manual Protocols + Brain AI Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Brain AI legge il manuale aziendale e risponde alle domande dei collaboratori; l'admin può dettare protocolli e Brain AI li salva come articoli.

**Architecture:** Fix brainContext report (attualmente vuoto), aggiunta query ManualArticle, nuova route manual-save, modalità dettatura nel drawer.

**Tech Stack:** Next.js 15, Prisma 6, OpenAI gpt-4o, TypeScript, Tailwind CSS. Tutto gira su `/var/www/geniushr/app/` (server SSH via geniusfast).

---

## NOTA: Workflow

Tutti i task vengono eseguiti SUL SERVER tramite SSH (`ssh geniusfast` poi `sudo -i`).
Path base: `/var/www/geniushr/app/`

---

### Task 1: Fix brainContext.ts — report vuoto + query ManualArticle

**Files:**
- Modify: `/var/www/geniushr/app/src/lib/brain/brainContext.ts`

**Problema attuale:** le chiamate `sections.push()` sono template literal vuoti — il report inviato a OpenAI non contiene nessun dato reale.

**Step 1: Aprire il file e verificare**

```bash
cat /var/www/geniushr/app/src/lib/brain/brainContext.ts
```

Cercare le righe con `sections.push` e verificare che siano vuote.

**Step 2: Sostituire brainContext.ts con versione completa**

```bash
cat > /var/www/geniushr/app/src/lib/brain/brainContext.ts << 'ENDOFFILE'
// src/lib/brain/brainContext.ts
import { prisma } from '@/lib/prisma'

export interface BrainContext {
  report: string
  rawData: Record<string, unknown>
}

export async function buildBrainContext(
  userId: string,
  tenantId?: string | null
): Promise<BrainContext> {
  const today = new Date()
  const in30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)

  const [
    employeesResult,
    deadlinesResult,
    signaturesResult,
    safetyResult,
    manualsResult,
    checklistsResult,
    disciplinaryResult,
    manualArticlesResult,
  ] = await Promise.allSettled([
    // 1. Dipendenti attivi
    prisma.employee.findMany({
      where: tenantId ? { tenantId, status: 'ACTIVE' } : { status: 'ACTIVE' },
      select: {
        firstName: true,
        lastName: true,
        jobTitle: true,
        department: true,
        hireDate: true,
        contractType: true,
        ccnlLevel: true,
      },
      take: 50,
      orderBy: { lastName: 'asc' },
    }),

    // 2. Scadenze urgenti
    prisma.deadline.findMany({
      where: {
        ...(tenantId ? { tenantId } : {}),
        dueDate: { lte: in30Days, gte: today },
        status: { in: ['PENDING', 'UPCOMING'] },
      },
      select: { title: true, type: true, dueDate: true, status: true },
      orderBy: { dueDate: 'asc' },
      take: 20,
    }),

    // 3. Firme documenti pendenti
    prisma.documentSignatureRequest.findMany({
      where: {
        ...(tenantId ? { tenantId } : {}),
        status: 'PENDING',
      },
      select: { documentId: true, requestedAt: true, dueDate: true },
      take: 20,
    }),

    // 4. Formazioni sicurezza in scadenza
    prisma.safetyTraining.findMany({
      where: {
        ...(tenantId ? { tenantId } : {}),
        expiresAt: { lte: in30Days },
        status: { not: 'COMPLETED' },
      },
      select: {
        trainingType: true,
        title: true,
        expiresAt: true,
        status: true,
        employee: { select: { firstName: true, lastName: true } },
      },
      take: 20,
    }),

    // 5. Categorie manuali (solo conteggio)
    prisma.manualCategory.findMany({
      where: tenantId ? { tenantId } : {},
      select: {
        name: true,
        _count: { select: { articles: true } },
      },
      take: 20,
    }),

    // 6. Checklist
    prisma.manualChecklist.findMany({
      where: tenantId ? { tenantId } : {},
      select: {
        name: true,
        _count: { select: { executions: true } },
      },
      take: 10,
    }),

    // 7. Procedure disciplinari aperte
    prisma.disciplinaryProcedure.findMany({
      where: {
        ...(tenantId ? { tenantId } : {}),
        status: {
          in: [
            'DRAFT',
            'CONTESTATION_SENT',
            'AWAITING_DEFENSE',
            'DEFENSE_RECEIVED',
            'HEARING_SCHEDULED',
            'PENDING_DECISION',
          ],
        },
      },
      select: { infractionType: true, status: true, createdAt: true },
      take: 10,
    }),

    // 8. NUOVO: Articoli manuale con contenuto completo
    prisma.manualArticle.findMany({
      where: {
        ...(tenantId ? { tenantId } : {}),
        status: 'PUBLISHED',
      },
      select: {
        title: true,
        content: true,
        category: { select: { name: true } },
        updatedAt: true,
      },
      orderBy: [
        { category: { order: 'asc' } },
        { order: 'asc' },
      ],
      take: 50,
    }),
  ])

  const extract = <T>(r: PromiseSettledResult<T>): T | null =>
    r.status === 'fulfilled' ? r.value : null

  const employees = extract(employeesResult) ?? []
  const deadlines = extract(deadlinesResult) ?? []
  const signatures = extract(signaturesResult) ?? []
  const safetyTrainings = extract(safetyResult) ?? []
  const manualCategories = extract(manualsResult) ?? []
  const checklists = extract(checklistsResult) ?? []
  const disciplinary = extract(disciplinaryResult) ?? []
  const manualArticles = extract(manualArticlesResult) ?? []

  const sections: string[] = []

  // --- Dipendenti ---
  if (employees.length > 0) {
    sections.push(`\n## DIPENDENTI ATTIVI (${employees.length})`)
    employees.slice(0, 20).forEach((e: any) => {
      const hired = e.hireDate
        ? new Date(e.hireDate).toLocaleDateString('it-IT')
        : 'N/D'
      sections.push(
        `- ${e.lastName} ${e.firstName} | ${e.jobTitle ?? 'N/D'} | ${e.department ?? 'N/D'} | Assunto: ${hired} | Contratto: ${e.contractType ?? 'N/D'} ${e.ccnlLevel ? '| Livello: ' + e.ccnlLevel : ''}`
      )
    })
  }

  // --- Scadenze ---
  if (deadlines.length > 0) {
    sections.push(`\n## SCADENZE URGENTI (entro 30 giorni)`)
    deadlines.forEach((d: any) => {
      const due = new Date(d.dueDate).toLocaleDateString('it-IT')
      sections.push(`- [${d.status}] ${d.title} — scade ${due} (${d.type})`)
    })
  }

  // --- Firme pendenti ---
  if (signatures.length > 0) {
    sections.push(`\n## FIRME DOCUMENTI PENDENTI (${signatures.length})`)
    signatures.forEach((s: any) => {
      const req = new Date(s.requestedAt).toLocaleDateString('it-IT')
      const due = s.dueDate ? new Date(s.dueDate).toLocaleDateString('it-IT') : 'N/D'
      sections.push(`- Documento ID: ${s.documentId} | Richiesto: ${req} | Scadenza: ${due}`)
    })
  }

  // --- Sicurezza ---
  if (safetyTrainings.length > 0) {
    sections.push(`\n## FORMAZIONI SICUREZZA IN SCADENZA`)
    safetyTrainings.forEach((t: any) => {
      const exp = t.expiresAt
        ? new Date(t.expiresAt).toLocaleDateString('it-IT')
        : 'N/D'
      const name = t.employee
        ? `${t.employee.lastName} ${t.employee.firstName}`
        : 'N/D'
      sections.push(`- ${name}: "${t.title}" (${t.trainingType}) — scade ${exp} [${t.status}]`)
    })
  }

  // --- Categorie manuali (solo conteggio, dettagli sotto) ---
  if (manualCategories.length > 0) {
    sections.push(`\n## STRUTTURA MANUALE AZIENDALE`)
    manualCategories.forEach((c: any) => {
      sections.push(`- ${c.name}: ${c._count.articles} articoli`)
    })
  }

  // --- NUOVO: Contenuto articoli manuale ---
  if (manualArticles.length > 0) {
    sections.push(`\n## CONTENUTO MANUALE AZIENDALE (Protocolli e Regole)`)

    // Raggruppa per categoria
    const byCategory = new Map<string, any[]>()
    for (const art of manualArticles as any[]) {
      const catName = art.category?.name ?? 'Generale'
      if (!byCategory.has(catName)) byCategory.set(catName, [])
      byCategory.get(catName)!.push(art)
    }

    byCategory.forEach((articles, catName) => {
      sections.push(`\n### ${catName}`)
      articles.forEach((art: any) => {
        const updated = new Date(art.updatedAt).toLocaleDateString('it-IT')
        sections.push(`\n#### ${art.title} (aggiornato: ${updated})`)
        sections.push(art.content)
      })
    })
  }

  // --- Checklist ---
  if (checklists.length > 0) {
    sections.push(`\n## CHECKLIST OPERATIVE`)
    checklists.forEach((c: any) => {
      sections.push(`- ${c.name}: ${c._count.executions} esecuzioni completate`)
    })
  }

  // --- Disciplinare ---
  if (disciplinary.length > 0) {
    sections.push(`\n## PROCEDURE DISCIPLINARI APERTE (${disciplinary.length})`)
    disciplinary.forEach((d: any) => {
      const date = new Date(d.createdAt).toLocaleDateString('it-IT')
      sections.push(`- [${d.status}] ${d.infractionType} — aperta il ${date}`)
    })
  }

  const rawData = {
    employees,
    deadlines,
    signatures,
    safetyTrainings,
    manualCategories,
    checklists,
    disciplinary,
    manualArticles,
  }

  return { report: sections.join('\n'), rawData }
}
ENDOFFILE
```

**Step 3: Verificare che il file sia stato scritto correttamente**

```bash
wc -l /var/www/geniushr/app/src/lib/brain/brainContext.ts
# Atteso: ~200+ righe
grep "manualArticles" /var/www/geniushr/app/src/lib/brain/brainContext.ts
# Atteso: varie occorrenze
grep "sections.push" /var/www/geniushr/app/src/lib/brain/brainContext.ts | head -5
# Atteso: righe non vuote con contenuto
```

**Step 4: Commit**

```bash
cd /var/www/geniushr/app
git add src/lib/brain/brainContext.ts
git commit -m "fix: brainContext report content + add ManualArticle knowledge base query"
```

---

### Task 2: Aggiornare system prompt in openai.ts

**Files:**
- Modify: `/var/www/geniushr/app/src/lib/brain/openai.ts`

**Step 1: Leggere il file attuale**

```bash
cat /var/www/geniushr/app/src/lib/brain/openai.ts
```

**Step 2: Aggiungere sezione MANUALE e MODALITÀ DETTATURA al prompt**

Aprire il file e trovare la fine di `BRAIN_SYSTEM_PROMPT` (prima del backtick di chiusura). Aggiungere queste sezioni prima della chiusura:

```bash
# Trova dove finisce il prompt (riga con il backtick di chiusura)
grep -n "^export const BRAIN" /var/www/geniushr/app/src/lib/brain/openai.ts
```

Aggiungere questo testo alla fine del BRAIN_SYSTEM_PROMPT (prima del backtick finale):

```
## Manuale Aziendale
Hai accesso al contenuto completo del manuale aziendale nella sezione "CONTENUTO MANUALE AZIENDALE" del contesto.
Quando un collaboratore fa una domanda coperta dal manuale:
1. Usa il contenuto degli articoli come fonte primaria della risposta
2. Cita sempre l'articolo di riferimento alla fine (formato: "📖 Fonte: [Titolo Articolo] — [Categoria]")
3. Se la domanda non è coperta dal manuale, rispondi con le tue competenze generali

## Modalità Dettatura Protocollo
Quando ricevi il parametro di sistema "MODALITÀ: DETTATURA PROTOCOLLO", sei in modalità speciale per aggiungere contenuti al manuale.
In questa modalità:
1. Analizza il testo dell'utente e identificane il protocollo/regola
2. Suggerisci la categoria più appropriata tra quelle esistenti nel manuale (o proponi una nuova se necessario)
3. Crea un titolo chiaro e formale
4. Struttura il contenuto in modo professionale
5. Rispondi SEMPRE e SOLO con questo JSON (senza markdown, senza testo aggiuntivo):
{"type":"manual_draft","categoryName":"[categoria]","title":"[titolo]","content":"[contenuto formattato]"}
```

**Step 3: Fare l'edit nel file** (usare un script Python per evitare problemi con caratteri speciali)

```bash
python3 << 'PYEOF'
with open('/var/www/geniushr/app/src/lib/brain/openai.ts', 'r') as f:
    content = f.read()

# Trova il backtick finale del BRAIN_SYSTEM_PROMPT
# Il prompt termina con `` ` `` su una riga sola prima di "export async function"
addition = """
## Manuale Aziendale
Hai accesso al contenuto completo del manuale aziendale nella sezione "CONTENUTO MANUALE AZIENDALE" del contesto.
Quando un collaboratore fa una domanda coperta dal manuale:
1. Usa il contenuto degli articoli come fonte primaria della risposta
2. Cita sempre l'articolo di riferimento alla fine (formato: "📖 Fonte: [Titolo Articolo] — [Categoria]")
3. Se la domanda non è coperta dal manuale, rispondi con le tue competenze generali

## Modalità Dettatura Protocollo
Quando ricevi il parametro di sistema "MODALITÀ: DETTATURA PROTOCOLLO", sei in modalità speciale per aggiungere contenuti al manuale.
In questa modalità:
1. Analizza il testo dell'utente e identificane il protocollo/regola
2. Suggerisci la categoria più appropriata tra quelle esistenti nel manuale (o proponi una nuova se necessario)
3. Crea un titolo chiaro e formale
4. Struttura il contenuto in modo professionale
5. Rispondi SEMPRE e SOLO con questo JSON (senza markdown, senza testo aggiuntivo):
{"type":"manual_draft","categoryName":"[categoria]","title":"[titolo]","content":"[contenuto formattato]"}"""

# Cerca il marcatore di fine prompt
# La stringa tipicamente termina con \n` prima di "export async"
import re
# Sostituisce il backtick finale del template literal del prompt
content = re.sub(
    r'(export const BRAIN_SYSTEM_PROMPT = `[\s\S]*?)(` *\n\nexport async)',
    lambda m: m.group(1) + addition + '\n' + m.group(2),
    content
)

with open('/var/www/geniushr/app/src/lib/brain/openai.ts', 'w') as f:
    f.write(content)

print("Done. Lines:", len(content.splitlines()))
PYEOF
```

**Step 4: Verificare**

```bash
grep -n "Manuale Aziendale\|Dettatura" /var/www/geniushr/app/src/lib/brain/openai.ts
# Atteso: righe trovate
```

**Step 5: Commit**

```bash
cd /var/www/geniushr/app
git add src/lib/brain/openai.ts
git commit -m "feat: brain system prompt - manual knowledge base + dictation mode"
```

---

### Task 3: Aggiornare chat/route.ts per modalità manuale

**Files:**
- Modify: `/var/www/geniushr/app/src/app/api/ai/chat/route.ts`

**Step 1: Leggere il file**

```bash
cat /var/www/geniushr/app/src/app/api/ai/chat/route.ts
```

**Step 2: Aggiungere gestione `mode` nel body**

Trovare la riga `const { message, conversationId } = body` e sostituirla con:

```typescript
const { message, conversationId, mode } = body
```

Poi trovare la costruzione di `gptMessages` e aggiungere il parametro modalità nel messaggio di sistema:

```typescript
const systemContent = mode === 'manual'
  ? `MODALITÀ: DETTATURA PROTOCOLLO\n\n${BRAIN_SYSTEM_PROMPT}\n\n## Dati Reali Aziendali\n${context.report}`
  : `${BRAIN_SYSTEM_PROMPT}\n\n## Dati Reali Aziendali\n${context.report}`

const gptMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
  { role: 'system', content: systemContent },
  // ... resto invariato
```

**Step 3: Fare l'edit con Python**

```bash
python3 << 'PYEOF'
with open('/var/www/geniushr/app/src/app/api/ai/chat/route.ts', 'r') as f:
    content = f.read()

# 1. Aggiungere mode al destructuring
content = content.replace(
    'const { message, conversationId } = body',
    'const { message, conversationId, mode } = body'
)

# 2. Sostituire la costruzione del system message
content = content.replace(
    "      role: 'system',\n        content: `${BRAIN_SYSTEM_PROMPT}\\n\\n## Dati Reali Aziendali\\n${context.report}`,",
    "      role: 'system',\n        content: mode === 'manual'\n          ? `MODALITÀ: DETTATURA PROTOCOLLO\\n\\n${BRAIN_SYSTEM_PROMPT}\\n\\n## Dati Reali Aziendali\\n${context.report}`\n          : `${BRAIN_SYSTEM_PROMPT}\\n\\n## Dati Reali Aziendali\\n${context.report}`,"
)

with open('/var/www/geniushr/app/src/app/api/ai/chat/route.ts', 'w') as f:
    f.write(content)
print("Done")
PYEOF
```

**Step 4: Verificare**

```bash
grep -n "mode\|DETTATURA" /var/www/geniushr/app/src/app/api/ai/chat/route.ts
```

**Step 5: Commit**

```bash
cd /var/www/geniushr/app
git add src/app/api/ai/chat/route.ts
git commit -m "feat: brain chat - support mode=manual for dictation"
```

---

### Task 4: Creare /api/ai/manual-save/route.ts

**Files:**
- Create: `/var/www/geniushr/app/src/app/api/ai/manual-save/route.ts`

**Step 1: Creare la directory**

```bash
mkdir -p /var/www/geniushr/app/src/app/api/ai/manual-save
```

**Step 2: Creare il file**

```bash
cat > /var/www/geniushr/app/src/app/api/ai/manual-save/route.ts << 'ENDOFFILE'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const body = await request.json()
    const { categoryName, title, content } = body

    if (!categoryName?.trim() || !title?.trim() || !content?.trim()) {
      return NextResponse.json(
        { error: 'categoryName, title e content sono obbligatori' },
        { status: 400 }
      )
    }

    // Recupera il tenantId dell'utente
    const tenantMember = await prisma.tenantMember.findFirst({
      where: { userId: session.user.id },
      select: { tenantId: true },
    })
    if (!tenantMember?.tenantId) {
      return NextResponse.json({ error: 'Tenant non trovato' }, { status: 400 })
    }
    const tenantId = tenantMember.tenantId

    // Cerca o crea la categoria
    const slug = categoryName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50)

    let category = await prisma.manualCategory.findFirst({
      where: { tenantId, name: { equals: categoryName, mode: 'insensitive' } },
    })

    if (!category) {
      // Genera uno slug unico
      let uniqueSlug = slug
      let attempt = 0
      while (true) {
        const existing = await prisma.manualCategory.findUnique({
          where: { tenantId_slug: { tenantId, slug: uniqueSlug } },
        })
        if (!existing) break
        attempt++
        uniqueSlug = `${slug}-${attempt}`
      }

      category = await prisma.manualCategory.create({
        data: { tenantId, name: categoryName, slug: uniqueSlug },
      })
    }

    // Genera slug per l'articolo
    const articleSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 80)

    let uniqueArticleSlug = articleSlug
    let attempt = 0
    while (true) {
      const existing = await prisma.manualArticle.findUnique({
        where: {
          tenantId_categoryId_slug: {
            tenantId,
            categoryId: category.id,
            slug: uniqueArticleSlug,
          },
        },
      })
      if (!existing) break
      attempt++
      uniqueArticleSlug = `${articleSlug}-${attempt}`
    }

    // Crea l'articolo come PUBLISHED
    const article = await prisma.manualArticle.create({
      data: {
        tenantId,
        categoryId: category.id,
        title: title.trim(),
        slug: uniqueArticleSlug,
        content: content.trim(),
        status: 'PUBLISHED',
        publishedAt: new Date(),
        createdBy: session.user.id,
      },
    })

    return NextResponse.json({
      success: true,
      article: {
        id: article.id,
        title: article.title,
        categoryName,
        slug: article.slug,
      },
    })
  } catch (error) {
    console.error('[manual-save] Errore:', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}
ENDOFFILE
```

**Step 3: Verificare**

```bash
cat /var/www/geniushr/app/src/app/api/ai/manual-save/route.ts | head -20
wc -l /var/www/geniushr/app/src/app/api/ai/manual-save/route.ts
```

**Step 4: Commit**

```bash
cd /var/www/geniushr/app
git add src/app/api/ai/manual-save/route.ts
git commit -m "feat: brain manual-save API - save dictated protocols as ManualArticle"
```

---

### Task 5: Aggiornare BrainDrawer.tsx — modalità manuale + draft card

**Files:**
- Modify: `/var/www/geniushr/app/src/components/brain/BrainDrawer.tsx`

**Step 1: Leggere il file completo**

```bash
cat /var/www/geniushr/app/src/components/brain/BrainDrawer.tsx
```

**Step 2: Aggiungere stato modalità manuale e draft card al componente**

Usare un script Python per le modifiche (il file contiene JSX con caratteri speciali):

```bash
python3 << 'PYEOF'
with open('/var/www/geniushr/app/src/components/brain/BrainDrawer.tsx', 'r') as f:
    content = f.read()

# 1. Aggiungere import useCallback se non presente
if 'useCallback' not in content:
    content = content.replace(
        "import { useRef, useEffect, useState }",
        "import { useRef, useEffect, useState, useCallback }"
    )

# 2. Aggiungere manualMode e draft alle props interface
old_interface_end = """  onDeleteConversation: (id: string) => void
}"""
new_interface_end = """  onDeleteConversation: (id: string) => void
  onManualSave?: (draft: { categoryName: string; title: string; content: string }) => Promise<void>
  isAdmin?: boolean
}"""
content = content.replace(old_interface_end, new_interface_end)

# 3. Aggiungere stato manualMode e draft nel componente
old_state = "  const [showHistory, setShowHistory] = useState(false)"
new_state = """  const [showHistory, setShowHistory] = useState(false)
  const [manualMode, setManualMode] = useState(false)
  const [savingDraft, setSavingDraft] = useState(false)"""
content = content.replace(old_state, new_state)

with open('/var/www/geniushr/app/src/components/brain/BrainDrawer.tsx', 'w') as f:
    f.write(content)
print("Step 2 done")
PYEOF
```

**Step 3: Aggiungere il pulsante Manuale nell'header e la draft card**

Questo richiede modifiche più ampie al JSX. Leggere prima l'header e la sezione messaggi:

```bash
grep -n "Brain AI\|showHistory\|SUGGESTIONS\|messagesRef" /var/www/geniushr/app/src/components/brain/BrainDrawer.tsx | head -30
```

Poi scrivere il file completo con le modifiche usando heredoc Python (vedi sotto il codice completo).

**Logica da aggiungere:**

1. **Header** — dopo il titolo "🧠 Brain AI", aggiungere bottone (solo se `isAdmin`):
```tsx
{isAdmin && (
  <button
    onClick={() => setManualMode(!manualMode)}
    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
      manualMode
        ? 'bg-emerald-500 text-white'
        : 'bg-white/20 text-white hover:bg-white/30'
    }`}
  >
    📖 Manuale
  </button>
)}
```

2. **Banner modalità manuale** — sopra i messaggi, quando `manualMode`:
```tsx
{manualMode && (
  <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/30 border-b border-emerald-200 dark:border-emerald-700 text-sm text-emerald-700 dark:text-emerald-300">
    📖 <strong>Modalità Manuale attiva</strong> — Dimmi la regola o il protocollo da aggiungere.
  </div>
)}
```

3. **Draft card** — `BrainDrawer` deve analizzare l'ultima risposta assistant. Se è un JSON con `type: "manual_draft"`, mostrare la card:

```tsx
// Funzione per estrarre draft dall'ultimo messaggio assistant
const lastAssistantMsg = messages.filter(m => m.role === 'assistant').at(-1)
let manualDraft: { categoryName: string; title: string; content: string } | null = null
if (manualMode && lastAssistantMsg) {
  try {
    const parsed = JSON.parse(lastAssistantMsg.content)
    if (parsed.type === 'manual_draft') manualDraft = parsed
  } catch {}
}
```

4. **Card draft** — mostrata sopra l'input quando `manualDraft !== null`:
```tsx
{manualDraft && (
  <div className="mx-4 mb-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-700">
    <div className="font-semibold text-emerald-800 dark:text-emerald-200 mb-1">
      📝 Bozza articolo
    </div>
    <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">
      <span className="font-medium">Categoria:</span> {manualDraft.categoryName}
    </div>
    <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
      <span className="font-medium">Titolo:</span> {manualDraft.title}
    </div>
    <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-3 line-clamp-3">
      {manualDraft.content}
    </div>
    <div className="flex gap-2">
      <button
        disabled={savingDraft}
        onClick={async () => {
          if (!onManualSave) return
          setSavingDraft(true)
          await onManualSave(manualDraft!)
          setSavingDraft(false)
          setManualMode(false)
        }}
        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded-lg font-medium disabled:opacity-50"
      >
        {savingDraft ? 'Salvataggio...' : '✅ Salva nel Manuale'}
      </button>
      <button
        onClick={() => window.open('/manual', '_blank')}
        className="px-3 py-2 border border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-zinc-400 text-sm rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
      >
        ✏️
      </button>
    </div>
  </div>
)}
```

**Step 4: Applicare le modifiche**

Dato che BrainDrawer.tsx è complesso, applicare le modifiche con lo script Python completo:

```bash
python3 /tmp/patch_drawer.py
```

Dove `/tmp/patch_drawer.py` contiene la logica di patching specificata sopra.

> **NOTA per l'esecutore:** Se il patching via script è difficile per la struttura JSX, è preferibile leggere il file completo e riscriverlo integralmente con tutte le modifiche incorporate. Il file è ~200-300 righe.

**Step 5: Commit**

```bash
cd /var/www/geniushr/app
git add src/components/brain/BrainDrawer.tsx
git commit -m "feat: brain drawer - manual mode button + draft card UI"
```

---

### Task 6: Aggiornare ai-assistant/page.tsx per passare onManualSave e isAdmin

**Files:**
- Modify: `/var/www/geniushr/app/src/app/(dashboard)/ai-assistant/page.tsx`

**Step 1: Leggere il file**

```bash
cat /var/www/geniushr/app/src/app/(dashboard)/ai-assistant/page.tsx
```

**Step 2: Aggiungere handler onManualSave**

Nel componente `BrainAIPage`, aggiungere:

```typescript
const handleManualSave = async (draft: { categoryName: string; title: string; content: string }) => {
  const res = await fetch('/api/ai/manual-save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(draft),
  })
  const data = await res.json()
  if (data.success) {
    // Aggiunge conferma come messaggio di sistema nella chat
    setMessages(prev => [...prev, {
      id: crypto.randomUUID(),
      role: 'assistant' as const,
      content: `✅ Salvato nel manuale!\n\n**${data.article.title}** è stato aggiunto alla categoria **${data.article.categoryName}**.\n\nPuoi vederlo in [Manuale Aziendale](/manual).`,
      timestamp: new Date(),
    }])
  }
}
```

**Step 3: Verificare se la sessione espone il ruolo admin**

```bash
grep -n "role\|admin\|isAdmin\|session" /var/www/geniushr/app/src/app/(dashboard)/ai-assistant/page.tsx | head -20
grep -n "role\|admin" /var/www/geniushr/app/src/lib/auth.ts | head -20
```

Aggiungere `isAdmin={session?.user?.role === 'ADMIN'}` al componente `BrainDrawer`. Se il campo ruolo non è disponibile, usare `isAdmin={true}` (solo gli admin accedono alla dashboard).

**Step 4: Aggiornare anche la chiamata onSend per passare mode**

Nella funzione `handleSend` o equivalente, verificare se `manualMode` deve essere passato all'API:

```typescript
// Nel fetch a /api/ai/chat
body: JSON.stringify({
  message,
  conversationId: currentConvId,
  mode: isManualMode ? 'manual' : undefined
})
```

Se la page gestisce il manualMode, aggiungere lo stato e passarlo a BrainDrawer tramite prop o gestirlo internamente nel drawer (preferibile).

**Step 5: Commit**

```bash
cd /var/www/geniushr/app
git add src/app/(dashboard)/ai-assistant/page.tsx
git commit -m "feat: ai-assistant page - wire manual save handler and admin prop"
```

---

### Task 7: Build, test e deploy

**Step 1: Build**

```bash
cd /var/www/geniushr/app
npm run build 2>&1 | tail -50
```

Se errori TypeScript, correggerli prima di proseguire.

**Step 2: Restart PM2**

```bash
pm2 restart geniushr
# oppure
pm2 restart 0
```

**Step 3: Test manuale — Brain AI legge il manuale**

1. Aprire `geniushr.it`
2. Cliccare "🧠 Brain AI"
3. Chiedere: *"Qual è il protocollo per le richieste ferie urgenti?"*
4. Verificare che Brain AI citi un articolo del manuale (se esistente) con "📖 Fonte: ..."
5. Se non ci sono articoli, creare uno di test: andare su `/manual/editor`, creare articolo PUBLISHED

**Step 4: Test dettatura protocollo**

1. Cliccare "📖 Manuale" nel drawer (visibile solo se admin)
2. Scrivere: *"Se un dipendente vuole richiedere un giorno di ferie urgente deve avvisare almeno 24 ore prima tramite WhatsApp il responsabile diretto"*
3. Verificare che Brain AI risponda con JSON `{"type":"manual_draft",...}`
4. Verificare che appaia la draft card con categoria, titolo, contenuto
5. Cliccare "✅ Salva nel Manuale"
6. Verificare conferma nella chat
7. Andare su `/manual` e verificare che l'articolo sia stato creato

**Step 5: Push su GitHub**

```bash
cd /var/www/geniushr/app
git log --oneline -6
git push origin main
```

---

## Riepilogo Task

| Task | Descrizione | Commit |
|------|-------------|--------|
| 1 | Fix brainContext report + ManualArticle query | fix: brainContext |
| 2 | System prompt manuale + dettatura | feat: brain prompt |
| 3 | chat/route.ts mode=manual | feat: chat mode |
| 4 | /api/ai/manual-save route | feat: manual-save API |
| 5 | BrainDrawer modalità manuale + draft card | feat: drawer UI |
| 6 | ai-assistant page wiring | feat: page wiring |
| 7 | Build + test + deploy + push | - |
