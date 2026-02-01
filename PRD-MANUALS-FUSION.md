# PRD — GeniusHR: Fusione HR + Manuali Operativi

**Versione:** 1.0 | **Data:** 01/02/2026 | **Owner:** Piero Natale Civero

---

## 1. OBIETTIVO

Fondere i contenuti di 4 domini (manuale.geniusmile.com, manuale-smiledoc.geniusmile.com, hr.geniusmile.com, hr-smiledoc.geniusmile.com) dentro GeniusHR (geniushr.it), creando una piattaforma SaaS con **2 anime**:

1. **HR** — Gestione risorse umane (già implementata)
2. **Manuali** — Manuale operativo digitale con validità legale ISO 9001

La piattaforma è **multi-tenant e rivendibile**. Smiledoc è il primo tenant con profilo personalizzato e contenuti reali.

---

## 2. INVENTARIO CONTENUTI DA MIGRARE

### 2.1 manuale-smiledoc.geniusmile.com (MkDocs — 135 file MD)

#### Sezione CLINICA (procedure operative studio)
- **Checklist (5):** apertura-studio, chiusura-studio, controllo-mensile, controllo-settimanale, preparazione-riunito
- **Moduli Anamnesi (3):** anamnesi-adulti, anamnesi-pediatrica, aggiornamento-anamnesi
- **Moduli Clinici (3):** cartella-clinica, diario-clinico, piano-trattamento
- **Moduli Consensi (7):** generale, chirurgia, endodonzia, implantologia, minori, ortodonzia, sbiancamento
- **Procedure Comunicazione (4):** campagne-sms, recall-pazienti, recensioni, reclami
- **Procedure Magazzino (4):** fornitori, gestione-ordini, inventario, scadenze
- **Procedure Segreteria (5):** conferma-appuntamenti, gestione-appuntamenti, gestione-disdette, gestione-telefonate, lista-attesa
- **Protocolli Accoglienza (3):** gestione-attesa, prima-visita, visite-successive
- **Protocolli DVR (3):** dpi, piano-emergenza, rischi-specifici
- **Protocolli Emergenze (4):** emergenze-mediche, kit-emergenza, reazioni-allergiche, sincope
- **Protocolli Igiene (3):** disinfezione-superfici, gestione-rifiuti, igiene-mani
- **Protocolli Normativa (3):** autorizzazioni, obblighi-sanitari, requisiti-strutturali
- **Protocolli Radiologia (3):** panoramica, protezione-paziente, rx-endorali
- **Protocolli Radioprotezione (3):** controlli-periodici, dosimetria, esperto-qualificato
- **Protocolli Rifiuti (3):** classificazione, registro-carico-scarico, smaltimento
- **Protocolli Sterilizzazione (3):** ciclo-sterilizzazione, manutenzione-autoclave, tracciabilita

#### Sezione CORPORATE (gestione aziendale)
- **Procedure Amministrazione (5):** fatturazione, incassi, preventivi, prima-nota, recupero-crediti
- **Procedure Formazione (3):** aggiornamento-ecm, formazione-obbligatoria, formazione-software
- **Procedure Onboarding (3):** primo-giorno, prima-settimana, primo-mese
- **Procedure Ruoli (4):** assistente-poltrona, igienista, odontoiatra, segretaria
- **Procedure Valutazione (2):** feedback, obiettivi
- **Protocolli Indicatori (3):** kpi-clinici, kpi-gestionali, soddisfazione-paziente
- **Protocolli Miglioramento (3):** audit-interni, azioni-correttive, riunioni-staff
- **Protocolli Standard (3):** comunicazione-paziente, follow-up, tempi-attesa

#### Sezione GENERALI
- **Moduli Privacy (3):** consenso-marketing, consenso-trattamento, informativa-privacy
- **Procedure:** reclami
- **Protocolli:** igiene-mani

#### Sezione SISTEMA DOCUMENTALE (7)
- dichiarazione-conformita, politica-controllo, presa-visione, registro-documenti, registro-prese-visione, registro-revisioni, riepilogo-sistema, verifica-integrita

#### Sezione SISTEMA HR (3)
- assistente-ai, documenti, formazione

#### Sezione SEDE e FEEDBACK
- Info sede, sistema feedback

### 2.2 manuale.geniusmile.com (Landing SaaS)
- Landing page marketing per vendita manuale come SaaS
- Pricing: Base €49, Pro €99, Enterprise €199/mese
- Features: checklist, protocolli, consensi, aggiornamenti, HR, audit ISO
- Questa diventa la **sezione marketing/pricing** dentro GeniusHR

### 2.3 hr.geniusmile.com e hr-smiledoc.geniusmile.com
- Contenuti HR specifici Smiledoc (dipendenti, ruoli, formazione, valutazione)
- Già parzialmente coperti dai moduli GeniusHR esistenti
- Da integrare dove mancanti

---

## 3. ARCHITETTURA TARGET

### 3.1 Navigazione GeniusHR (sidebar a 2 sezioni)

```
📊 HR (anima 1 — già esistente)
├── Dashboard
├── Dipendenti
├── Presenze
├── Ferie/Permessi
├── Cedolini
├── Note Spese
├── Onboarding
├── Formazione
├── Performance
├── Sicurezza 81/08
├── Disciplinare
├── Whistleblowing
├── Documenti
├── Firme Digitali
└── Scadenze

📋 MANUALE OPERATIVO (anima 2 — da creare)
├── 📖 Dashboard Manuale
├── 🏥 Clinica
│   ├── Checklist Operative
│   ├── Moduli & Consensi
│   ├── Procedure (Segreteria, Magazzino, Comunicazione)
│   └── Protocolli (Igiene, Sterilizzazione, Emergenze, Radiologia, DVR, Normativa, Rifiuti)
├── 🏢 Corporate
│   ├── Amministrazione
│   ├── Ruoli & Mansionari
│   ├── KPI & Indicatori
│   └── Miglioramento Continuo
├── 📄 Sistema Documentale
│   ├── Registro Documenti
│   ├── Prese Visione
│   ├── Revisioni
│   └── Conformità
├── 🔒 Privacy & GDPR
│   ├── Informativa
│   ├── Consensi
│   └── Marketing
└── ⚙️ Impostazioni Manuale
    ├── Template Personalizzazione
    └── Branding Tenant
```

### 3.2 Database — Nuovi modelli Prisma

```prisma
// === MANUALE OPERATIVO ===

model ManualCategory {
  id          String   @id @default(cuid())
  tenantId    String
  tenant      Tenant   @relation(fields: [tenantId], references: [id])
  name        String   // es. "Clinica", "Corporate", "Sistema Documentale"
  slug        String   // es. "clinica", "corporate"
  icon        String?  // es. "hospital", "building", "file-text"
  order       Int      @default(0)
  parentId    String?
  parent      ManualCategory? @relation("CategoryTree", fields: [parentId], references: [id])
  children    ManualCategory[] @relation("CategoryTree")
  articles    ManualArticle[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  @@unique([tenantId, slug])
}

model ManualArticle {
  id          String   @id @default(cuid())
  tenantId    String
  tenant      Tenant   @relation(fields: [tenantId], references: [id])
  categoryId  String
  category    ManualCategory @relation(fields: [categoryId], references: [id])
  title       String   // es. "Apertura Studio"
  slug        String   // es. "apertura-studio"
  content     String   @db.Text  // Markdown content
  contentHtml String?  @db.Text  // Pre-rendered HTML
  version     Int      @default(1)
  status      ManualArticleStatus @default(DRAFT)
  isTemplate  Boolean  @default(false)  // true = template generico rivendibile
  order       Int      @default(0)
  metadata    Json?    // tag, keywords, compliance refs
  createdBy   String?
  updatedBy   String?
  publishedAt DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  revisions   ManualRevision[]
  acknowledgments ManualAcknowledgment[]
  checklists  ManualChecklist[]
  @@unique([tenantId, categoryId, slug])
}

model ManualRevision {
  id          String   @id @default(cuid())
  articleId   String
  article     ManualArticle @relation(fields: [articleId], references: [id])
  version     Int
  content     String   @db.Text
  changeNote  String?
  changedBy   String?
  createdAt   DateTime @default(now())
}

model ManualAcknowledgment {
  id          String   @id @default(cuid())
  articleId   String
  article     ManualArticle @relation(fields: [articleId], references: [id])
  employeeId  String
  employee    Employee @relation(fields: [employeeId], references: [id])
  acknowledgedAt DateTime @default(now())
  signature   String?  // base64 firma digitale
  @@unique([articleId, employeeId])
}

model ManualChecklist {
  id          String   @id @default(cuid())
  tenantId    String
  tenant      Tenant   @relation(fields: [tenantId], references: [id])
  articleId   String?
  article     ManualArticle? @relation(fields: [articleId], references: [id])
  name        String   // es. "Checklist Apertura Studio"
  frequency   ChecklistFrequency // DAILY, WEEKLY, MONTHLY
  items       ManualChecklistItem[]
  executions  ManualChecklistExecution[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model ManualChecklistItem {
  id          String   @id @default(cuid())
  checklistId String
  checklist   ManualChecklist @relation(fields: [checklistId], references: [id])
  text        String
  order       Int      @default(0)
  mandatory   Boolean  @default(true)
}

model ManualChecklistExecution {
  id          String   @id @default(cuid())
  checklistId String
  checklist   ManualChecklist @relation(fields: [checklistId], references: [id])
  executedBy  String
  executedAt  DateTime @default(now())
  items       Json     // [{itemId, checked, note}]
  completionRate Float @default(0)
}

enum ManualArticleStatus {
  DRAFT
  REVIEW
  PUBLISHED
  ARCHIVED
}

enum ChecklistFrequency {
  DAILY
  WEEKLY
  MONTHLY
  QUARTERLY
  ANNUAL
  ON_DEMAND
}
```

### 3.3 Multi-Tenant Template System

La piattaforma ha 2 livelli di contenuti:

1. **Template generici** (`isTemplate: true`) — Procedure/protocolli standard applicabili a qualsiasi studio dentale o PMI. Vengono forniti come starter kit al momento della registrazione tenant.

2. **Contenuti tenant-specifici** (`isTemplate: false`) — Personalizzazioni del tenant (es. Smiledoc con i suoi consensi specifici, le sue checklist, i suoi protocolli adattati).

**Onboarding nuovo tenant:**
1. Registrazione → crea tenant
2. Scelta settore (odontoiatrico, medico, PMI generica)
3. Copia automatica template generici nel tenant
4. Personalizzazione guidata (nome struttura, responsabili, loghi)

---

## 4. API ROUTES (Nuove)

```
// Categorie manuale
GET    /api/manual/categories          → Lista categorie (tree)
POST   /api/manual/categories          → Crea categoria
PUT    /api/manual/categories/[id]     → Aggiorna
DELETE /api/manual/categories/[id]     → Elimina

// Articoli manuale
GET    /api/manual/articles            → Lista (filtri: categoryId, status, search)
GET    /api/manual/articles/[slug]     → Dettaglio con content
POST   /api/manual/articles            → Crea
PUT    /api/manual/articles/[id]       → Aggiorna (crea revision automatica)
DELETE /api/manual/articles/[id]       → Archivia
POST   /api/manual/articles/[id]/publish → Pubblica

// Revisioni
GET    /api/manual/articles/[id]/revisions → Storico revisioni
POST   /api/manual/articles/[id]/revert/[version] → Ripristina versione

// Prese visione (acknowledgment)
GET    /api/manual/acknowledgments     → Lista prese visione
POST   /api/manual/articles/[id]/acknowledge → Dipendente conferma lettura
GET    /api/manual/articles/[id]/acknowledgments → Chi ha letto

// Checklist operative
GET    /api/manual/checklists          → Lista checklist
GET    /api/manual/checklists/[id]     → Dettaglio con items
POST   /api/manual/checklists          → Crea
POST   /api/manual/checklists/[id]/execute → Registra esecuzione
GET    /api/manual/checklists/[id]/history → Storico esecuzioni

// Dashboard manuale
GET    /api/manual/dashboard           → Stats (articoli, compliance, acknowledgments pending)

// Template (admin)
GET    /api/manual/templates           → Lista template disponibili
POST   /api/manual/templates/provision → Provisiona template per tenant
```

---

## 5. PAGINE FRONTEND (Nuove — 15 pagine)

```
src/app/(dashboard)/manual/page.tsx                        → Dashboard Manuale
src/app/(dashboard)/manual/[categorySlug]/page.tsx         → Listing articoli categoria
src/app/(dashboard)/manual/[categorySlug]/[articleSlug]/page.tsx → Articolo con viewer MD
src/app/(dashboard)/manual/editor/page.tsx                 → Editor nuovo articolo
src/app/(dashboard)/manual/editor/[id]/page.tsx            → Editor modifica articolo
src/app/(dashboard)/manual/checklists/page.tsx             → Lista checklist
src/app/(dashboard)/manual/checklists/[id]/page.tsx        → Dettaglio checklist
src/app/(dashboard)/manual/checklists/[id]/execute/page.tsx → Esecuzione checklist
src/app/(dashboard)/manual/acknowledgments/page.tsx        → Registro prese visione
src/app/(dashboard)/manual/revisions/page.tsx              → Storico revisioni globale
src/app/(dashboard)/manual/documents/page.tsx              → Sistema documentale
src/app/(dashboard)/manual/privacy/page.tsx                → Privacy & GDPR
src/app/(dashboard)/manual/search/page.tsx                 → Ricerca full-text
src/app/(dashboard)/manual/settings/page.tsx               → Impostazioni manuale tenant
src/app/(admin)/admin/manual-templates/page.tsx            → Gestione template (super admin)
```

---

## 6. SEED SMILEDOC — Profilo Personalizzato

Il seed (`npm run db:seed-smiledoc`) viene esteso per popolare il manuale con tutti i 135 articoli dal repo Geniusmile-Manuale-Smiledoc.

### 6.1 Categorie Smiledoc

```
clinica/
  checklist/          → 5 articoli
  moduli/anamnesi/    → 3 articoli
  moduli/clinici/     → 3 articoli
  moduli/consensi/    → 7 articoli
  procedure/segreteria/    → 5 articoli
  procedure/magazzino/     → 4 articoli
  procedure/comunicazione/ → 4 articoli
  protocolli/accoglienza/  → 3 articoli
  protocolli/dvr/          → 3 articoli
  protocolli/emergenze/    → 4 articoli
  protocolli/igiene/       → 3 articoli
  protocolli/normativa/    → 3 articoli
  protocolli/radiologia/   → 3 articoli
  protocolli/radioprotezione/ → 3 articoli
  protocolli/rifiuti/      → 3 articoli
  protocolli/sterilizzazione/ → 3 articoli

corporate/
  procedure/amministrazione/ → 5 articoli
  procedure/formazione/      → 3 articoli
  procedure/onboarding/      → 3 articoli
  procedure/ruoli/           → 4 articoli
  procedure/valutazione/     → 2 articoli
  protocolli/indicatori/     → 3 articoli
  protocolli/miglioramento/  → 3 articoli
  protocolli/standard/       → 3 articoli

generali/
  moduli/privacy/   → 3 articoli
  procedure/        → 1 articolo
  protocolli/       → 1 articolo

sistema-documentale/ → 7 articoli
sistema-hr/          → 3 articoli
```

**Totale: ~105 articoli** (esclusi index.md)

### 6.2 Checklist Smiledoc (da checklist/ folder)

1. **Apertura Studio** — frequenza: DAILY
2. **Chiusura Studio** — frequenza: DAILY
3. **Controllo Settimanale** — frequenza: WEEKLY
4. **Controllo Mensile** — frequenza: MONTHLY
5. **Preparazione Riunito** — frequenza: ON_DEMAND

---

## 7. COMPONENTI UI

### 7.1 ManualArticleViewer
- Rendering Markdown → HTML (react-markdown + rehype)
- Table of contents sidebar auto-generato
- Bottone "Ho letto e compreso" (acknowledgment)
- Info revisione, autore, data
- Print-friendly CSS

### 7.2 ManualEditor
- Textarea Markdown con preview live split-view
- Toolbar formattazione (bold, italic, heading, list, table, link)
- Upload immagini (drag & drop)
- Salvataggio automatico bozza
- Selezione categoria

### 7.3 ChecklistExecutor
- Lista items con checkbox
- Timer opzionale
- Note per ogni item
- Progress bar
- Submit con firma opzionale
- Storico esecuzioni precedenti

### 7.4 ManualDashboard
- KPI: totale articoli, % letti dal team, checklist completate oggi
- Articoli recentemente aggiornati
- Acknowledgment pending per dipendente
- Compliance score manuale (% articoli letti / totale)

### 7.5 ManualSearch
- Full-text search su titolo + contenuto
- Filtri per categoria, status, data
- Highlight risultati

---

## 8. SIDEBAR AGGIORNATA

La sidebar di GeniusHR avrà un **toggle/tab** tra le 2 anime:

```tsx
// Layout option A: Tab in cima alla sidebar
[🧑‍💼 HR] [📋 Manuale]

// Layout option B: Sezioni separate con divider
── HR ──────────
Dashboard
Dipendenti
...
── MANUALE ─────
Dashboard Manuale
Clinica
Corporate
...
```

**Scelta: Option B** — sezioni separate, più chiaro e navigabile.

---

## 9. FASI DI ESECUZIONE

### FASE 1: Schema DB + API Core (3-4 ore)
1. Aggiungere modelli Prisma (ManualCategory, ManualArticle, ManualRevision, ManualAcknowledgment, ManualChecklist, ManualChecklistItem, ManualChecklistExecution)
2. Generare e applicare migrazione
3. Creare API routes (15+ endpoint)
4. Testare CRUD base

### FASE 2: Frontend Pagine (4-5 ore)
1. Creare 15 pagine nel router Next.js
2. ManualArticleViewer con rendering Markdown
3. ManualEditor con preview
4. ManualDashboard con stats
5. ChecklistExecutor
6. Aggiornare sidebar con sezione Manuale

### FASE 3: Seed Smiledoc (2-3 ore)
1. Script per leggere tutti i 135 MD dal repo Geniusmile-Manuale-Smiledoc
2. Creare categorie tree
3. Importare articoli con content markdown
4. Creare 5 checklist con items
5. Verificare navigazione completa

### FASE 4: Template System + Polish (2-3 ore)
1. Marcare articoli generici come template
2. Logica provisioning per nuovi tenant
3. Search full-text
4. Print CSS
5. Build + deploy

---

## 10. MONETIZZAZIONE

### Pricing aggiornato GeniusHR (2 anime)

| Piano | Prezzo | HR | Manuale |
|-------|--------|-----|---------|
| **Starter** | €29/mese | ✅ Base (dipendenti, ferie, presenze) | ❌ |
| **Professional** | €79/mese | ✅ Completo | ✅ Manuale base (articoli, checklist) |
| **Enterprise** | €149/mese | ✅ Completo + consulente | ✅ Completo (audit, revisioni, compliance) |
| **Partner** | €199/mese | ✅ Multi-sede | ✅ Multi-sede + template custom |

### Upsell: Solo Manuale
Per chi ha già un HR system ma vuole il manuale operativo:
- **Manuale Base:** €49/mese (articoli + checklist)
- **Manuale Pro:** €99/mese (+ revisioni, acknowledgment, audit)
- **Manuale Enterprise:** €149/mese (+ multi-sede, white-label)

---

## 11. METRICHE DI SUCCESSO

- [ ] 135 articoli Smiledoc migrati e navigabili
- [ ] 5 checklist operative funzionanti con esecuzione giornaliera
- [ ] Sistema acknowledgment con firma digitale
- [ ] Ricerca full-text funzionante
- [ ] Build OK + deploy su geniushr.it
- [ ] Tempo caricamento pagina articolo < 500ms
