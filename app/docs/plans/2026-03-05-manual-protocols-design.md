# Design: Manuale Aziendale + Brain AI Integration

**Data**: 2026-03-05
**Progetto**: Ordinia (GeniusHR)
**Stato**: Approvato

## Obiettivo

Permettere all'admin di dettare regole e protocolli a Brain AI che le organizza nel manuale aziendale. I collaboratori possono poi interrogare Brain AI e ricevere risposte basate sul contenuto del manuale.

## Approccio Scelto

**Option A**: Estendere la struttura `ManualCategory` / `ManualArticle` esistente. Nessun nuovo modello Prisma.

## Architettura

Due interventi principali:

### 1. Brain AI legge il manuale (query context)

`buildBrainContext()` aggiunge una query parallela che carica gli articoli PUBLISHED raggruppati per categoria:

```typescript
// Query aggiunta in buildBrainContext()
const manualArticles = prisma.manualArticle.findMany({
  where: { tenantId, status: 'PUBLISHED' },
  include: { category: true },
  orderBy: [{ category: { order: 'asc' } }, { order: 'asc' }],
  take: 50,
})
```

Il contesto viene iniettato nel prompt come sezione `📚 MANUALE AZIENDALE` con:
- Categoria
- Titolo articolo
- Contenuto completo

### 2. Flusso Dettatura (admin → aggiunge protocollo)

1. Admin clicca **"📖 Manuale"** nel drawer di Brain AI
2. Brain AI entra in modalità manuale con prompt speciale
3. Admin detta la regola in linguaggio naturale
4. Brain AI risponde con bozza strutturata (categoria, titolo, contenuto)
5. Admin approva con "ok" o corregge
6. Chiamata `POST /api/manual/articles` → articolo salvato come PUBLISHED
7. Brain AI conferma con nome categoria e titolo

## Componenti da Modificare

| File | Modifica |
|------|----------|
| `src/lib/brain/brainContext.ts` | Aggiungere query `ManualArticle` PUBLISHED con contenuto |
| `src/lib/brain/openai.ts` | Aggiornare system prompt per citare articoli del manuale |
| `src/app/api/ai/chat/route.ts` | Gestire modalità manuale (`mode: 'manual'`) |
| `src/components/brain/BrainDrawer.tsx` | Aggiungere pulsante "📖 Manuale" e UI bozza articolo |
| `src/app/api/ai/manual-save/route.ts` | **Nuovo**: salva articolo da dettatura Brain AI |

## UI

### Drawer Brain AI

- Header: aggiunta pulsante **"📖 Manuale"** accanto al titolo
- Click → chat pre-popolata in modalità manuale
- Risposta Brain AI in modalità dettatura: card con `[✅ Salva]` e `[✏️ Modifica]`
- Salva → `POST /api/ai/manual-save` → conferma nella chat
- Modifica → apre `/manual/editor/[id]` in nuova tab

### Per i collaboratori

Nessun cambiamento UI. Le risposte Brain AI su argomenti coperti dal manuale includono in fondo:
> *"📖 Fonte: [Titolo Articolo] — [Categoria]"*

## System Prompt (aggiornamento)

Aggiungere al prompt esistente:

```
MANUALE AZIENDALE:
Hai accesso al manuale aziendale dell'organizzazione nel contesto.
Quando un collaboratore fa una domanda coperta dal manuale, usa il contenuto degli articoli come fonte primaria e cita sempre il titolo dell'articolo di riferimento alla fine della risposta (formato: "📖 Fonte: [titolo] — [categoria]").

MODALITÀ DETTATURA (attivata dal campo mode='manual'):
Quando l'utente ti descrive una regola o un protocollo, devi:
1. Identificare o suggerire la categoria appropriata (da quelle esistenti nel contesto)
2. Proporre un titolo chiaro e conciso
3. Strutturare il contenuto in modo formale e leggibile
4. Rispondere SEMPRE con JSON nel formato:
   {"type":"manual_draft","categoryName":"...","title":"...","content":"..."}
```

## Limiti di Scope

- **Non** si implementa ricerca semantica/vettoriale (già funziona con text match)
- **Non** si modifica lo schema Prisma
- **Non** si toccano le pagine esistenti del manuale
- **Non** si aggiungono nuovi ruoli o permessi (solo admin vede il pulsante Manuale)
- Limite: 50 articoli nel context (evita token overflow)

## Sequenza di Implementazione

1. Modificare `brainContext.ts` — aggiungere query manuale
2. Aggiornare system prompt in `openai.ts`
3. Creare `POST /api/ai/manual-save/route.ts`
4. Aggiornare `chat/route.ts` per gestire mode=manual
5. Modificare `BrainDrawer.tsx` — pulsante + UI bozza
6. Build + test + deploy
