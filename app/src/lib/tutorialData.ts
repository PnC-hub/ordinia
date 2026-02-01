// Tutorial data - Based on PRD Section 3.2
export interface TutorialSection {
  title: string
  content: string
  tips?: string[]
  links?: { label: string; href: string }[]
  checklist?: string[]
}

export interface Tutorial {
  id: string
  title: string
  description: string
  category: TutorialCategory
  icon: string
  duration: string
  sections: TutorialSection[]
  relatedPages?: string[]
}

export type TutorialCategory =
  | 'Organizzazione'
  | 'Gestione'
  | 'Compliance'
  | 'Comunicazione'
  | 'Amministrazione'

export const tutorials: Tutorial[] = [
  {
    id: 'team-organization',
    title: 'Organizzazione Efficiente del Team',
    description:
      'Impara a strutturare reparti, assegnare ruoli e delegare responsabilità in modo efficace',
    category: 'Organizzazione',
    icon: '👥',
    duration: '8 min',
    relatedPages: ['/employees', '/settings/team'],
    sections: [
      {
        title: 'Strutturazione dei Reparti',
        content: `La corretta organizzazione del team è fondamentale per il successo della tua azienda.

In GeniusHR puoi creare reparti personalizzati che riflettono la struttura reale del tuo studio:

**Per uno studio odontoiatrico tipico:**
- Reception e Front Office
- Clinica (medici e assistenti)
- Amministrazione
- Igienisti
- Radiologia

Ogni reparto può avere un responsabile che gestisce autonomamente:
- Approvazione ferie del proprio team
- Validazione delle presenze
- Gestione delle note spese`,
        tips: [
          'Assegna un responsabile a ogni reparto per snellire le approvazioni',
          'Crea gruppi di lavoro cross-funzionali per progetti specifici',
          'Mantieni i reparti aggiornati quando cambiano le responsabilità',
        ],
        links: [
          { label: 'Vai alla gestione dipendenti', href: '/employees' },
          { label: 'Configura team', href: '/settings/team' },
        ],
      },
      {
        title: 'Assegnazione Ruoli e Permessi',
        content: `GeniusHR prevede diversi livelli di accesso per garantire sicurezza e privacy:

**Titolare/Admin:**
- Accesso completo a tutte le funzionalità
- Gestione abbonamento e fatturazione
- Configurazione sistema

**HR Manager:**
- Gestione completa dei dipendenti
- Approvazione ferie e spese
- Accesso a dati sensibili (buste paga)
- Non può modificare impostazioni di sistema

**Manager/Capogruppo:**
- Visibilità solo del proprio team
- Approvazione ferie e presenze
- No accesso a buste paga

**Dipendente:**
- Solo i propri dati
- Richieste ferie/permessi
- Consultazione cedolini personali`,
        tips: [
          'Usa il principio del minimo privilegio: dai solo i permessi necessari',
          'Rivedi i permessi ogni 6 mesi per verificare siano ancora appropriati',
          'Documenta chi ha accesso a cosa (importante per GDPR)',
        ],
        checklist: [
          'Identifica i responsabili di reparto',
          'Assegna il ruolo HR Manager alla persona che gestisce il personale',
          'Configura i permessi dei manager di reparto',
          'Verifica che ogni dipendente abbia il livello corretto',
        ],
      },
      {
        title: 'Delega Efficace',
        content: `La delega non è solo assegnare compiti, ma responsabilizzare il team.

**Best practice per delegare in GeniusHR:**

1. **Approvazioni ferie:** Delega ai manager di reparto le approvazioni di routine. Tu mantieni la visibilità generale.

2. **Validazione presenze:** Il responsabile di reparto può validare le timbrature del proprio team.

3. **Note spese:** Delega l'approvazione delle piccole spese ai manager, mantieni controllo su quelle sopra una certa soglia.

4. **Onboarding:** Assegna task specifici a persone diverse (IT, HR, manager diretto).

**Vantaggi della delega:**
- Decisioni più veloci
- Team più responsabilizzato
- Tu ti concentri sulla strategia
- Riduzione del carico di lavoro`,
        tips: [
          'Comunica chiaramente cosa puoi approvare e cosa no',
          'Monitora inizialmente le decisioni delegate',
          'Riconosci pubblicamente i manager che delegano bene',
        ],
      },
    ],
  },
  {
    id: 'leave-planning',
    title: 'Pianificazione Ferie Senza Stress',
    description:
      'Gestisci le ferie annuali, evita sovrapposizioni critiche e mantieni i saldi aggiornati',
    category: 'Gestione',
    icon: '🏖️',
    duration: '10 min',
    relatedPages: ['/leaves'],
    sections: [
      {
        title: 'Creare il Piano Ferie Annuale',
        content: `Un piano ferie ben strutturato previene problemi e conflitti.

**Strategia consigliata (da fare a inizio anno):**

1. **Definisci i periodi di chiusura aziendale**
   - Feste natalizie
   - Settimana di Ferragosto
   - Ponti festivi
   Comunica queste date a tutti e blocca automaticamente le ferie

2. **Raccogli le preferenze dei dipendenti**
   - Chiedi a tutti di indicare 2-3 periodi preferiti
   - Dai priorità a chi ha figli in età scolare
   - Alterna le priorità anno per anno

3. **Crea il calendario condiviso**
   - Visualizza nel calendario GeniusHR chi è in ferie quando
   - Assicurati che ogni giorno ci sia copertura minima
   - Evita che intere funzioni chiave siano assenti insieme

4. **Approva progressivamente**
   - Prima le richieste estive (entro marzo)
   - Poi quelle natalizie (entro settembre)
   - Resto durante l'anno con preavviso minimo`,
        tips: [
          'Stabilisci una regola: chi chiede prima ha priorità (a parità di anzianità)',
          'Blocca almeno 2 persone chiave per reparto in ogni periodo',
          'Invia reminder a metà anno a chi ha molte ferie residue',
        ],
        links: [
          { label: 'Apri calendario ferie', href: '/leaves?view=calendar' },
          { label: 'Gestisci richieste', href: '/leaves' },
        ],
      },
      {
        title: 'Gestire Richieste Multiple',
        content: `Quando arrivano molte richieste contemporaneamente, serve un metodo.

**Workflow di approvazione:**

1. **Filtra per urgenza**
   - Richieste imminenti (partenza tra < 7 giorni): priorità alta
   - Richieste pianificate: gestisci con calma

2. **Verifica copertura**
   - GeniusHR ti mostra automaticamente chi altro è già in ferie
   - Controlla che ogni funzione critica sia coperta
   - Per studi medici: assicura sempre almeno 1 dentista presente

3. **Controlla i saldi**
   - Il sistema calcola automaticamente se la persona ha giorni sufficienti
   - Attenzione ai residui anno precedente con scadenza

4. **Approva o rifiuta con motivazione**
   - Se approvi: il calendario si aggiorna automaticamente
   - Se rifiuti: spiega sempre il motivo (es. "Già 2 persone del reparto assenti")
   - Proponi date alternative quando possibile`,
        tips: [
          'Rispondi entro 48h alle richieste per non bloccare le prenotazioni',
          'Usa i commenti per comunicare direttamente nella richiesta',
          'Abilita le notifiche push per non perdere richieste urgenti',
        ],
      },
      {
        title: 'Evitare il Problema Ferie di Massa',
        content: `Ogni anno, a novembre/dicembre, molti dipendenti hanno ferie accumulate. Ecco come prevenire.

**Strategia preventiva:**

**Gennaio:** Comunica la policy "usa o perdi"
- Fai sapere che le ferie anno precedente scadono
- Ricorda che è obbligo godere delle ferie maturate

**Giugno:** Primo controllo semestrale
- Estrai il report "Saldi Ferie" da GeniusHR
- Identifica chi ha più di 15 giorni residui
- Invia email personalizzata invitando a pianificare

**Settembre:** Secondo alert
- Report aggiornato
- Incontro 1:1 con chi ha > 20 giorni
- Pianifica insieme le date

**Novembre:** Ultima possibilità
- Obbligo di prenotare entro 15 novembre
- Se necessario, assegna tu le date (previo accordo)

**Vantaggi:**
- Eviti il caos di dicembre
- Rispetti gli obblighi di legge
- I dipendenti riposano davvero`,
        tips: [
          'Imposta alert automatici nel sistema',
          'Blocca le ferie natalizie per chi non ha pianificato prima',
          'Considera il frazionamento: meglio 5 settimane da 1 settimana che 5 settimane tutte insieme',
        ],
        checklist: [
          'Configurare email automatica a gennaio con policy ferie',
          'Estrarre report saldi ogni trimestre',
          'Creare template email per reminder personalizzati',
          'Inserire in calendario i check periodici',
        ],
      },
      {
        title: 'Criteri di Approvazione Equi',
        content: `L'equità percepita è fondamentale per il clima aziendale.

**Regole chiare da comunicare a tutti:**

1. **Priorità Luglio/Agosto:**
   - Chi ha figli < 14 anni sceglie per primo (obbligo scolastico)
   - Chi non ha avuto precedenza l'anno scorso ha priorità quest'anno
   - Si alterna ogni anno

2. **Periodi richiesti:**
   - Massimo 2 settimane consecutive in alta stagione
   - Minimo 1 persona per reparto sempre presente
   - Chi chiede per primo ha priorità (a parità di condizioni)

3. **Approvazione automatica:**
   - Ferie < 3 giorni approvate automaticamente se:
     * Copertura garantita
     * Saldo sufficiente
     * Preavviso rispettato (es. 7 giorni prima)

4. **Trasparenza:**
   - Tutti vedono il calendario condiviso
   - Tutti conoscono i criteri
   - Decisioni documentate`,
        tips: [
          'Metti per iscritto i criteri e condividili a inizio anno',
          'Applica le regole senza eccezioni (o diventa ingestibile)',
          'Ascolta le esigenze, ma spiega quando non puoi accontentare',
        ],
      },
    ],
  },
  {
    id: 'expense-management',
    title: 'Gestione Spese e Trasferte',
    description:
      'Configura policy, approva rimborsi chilometrici e controlla il budget viaggi',
    category: 'Gestione',
    icon: '💰',
    duration: '7 min',
    relatedPages: ['/expenses'],
    sections: [
      {
        title: 'Impostare la Travel Policy',
        content: `Una travel policy chiara evita incomprensioni e spese eccessive.

**Elementi essenziali della policy:**

1. **Massimali per categoria**
   - Pasti: €20 pranzo, €30 cena (Italia)
   - Hotel: €80-120/notte (dipende dalla città)
   - Taxi: solo se trasporto pubblico non disponibile
   - Rappresentanza clienti: max €50/persona

2. **Documentazione obbligatoria**
   - Fattura elettronica (preferibile a scontrino)
   - Ricevuta fiscale se > €50
   - Foto dello scontrino caricata su GeniusHR

3. **Cosa NON è rimborsabile**
   - Minibar hotel
   - Servizi personali
   - Pasti extra oltre il numero previsto
   - Upgrade non autorizzati

4. **Tempi di presentazione**
   - Entro 30 giorni dalla spesa
   - Raggruppare le spese per trasferta
   - Liquidazione entro mese successivo

**Configurazione in GeniusHR:**
Vai su Impostazioni → Note Spese → Policy
Imposta i limiti automatici: il sistema bloccherà richieste oltre soglia.`,
        tips: [
          'Comunicare la policy a tutti i nuovi assunti',
          'Aggiornare annualmente i massimali',
          'Prevedere eccezioni per situazioni particolari (clienti importanti)',
        ],
        links: [
          { label: 'Configura policy spese', href: '/settings' },
          { label: 'Visualizza spese', href: '/expenses' },
        ],
      },
      {
        title: 'Calcolo Rimborso Chilometrico',
        content: `Il rimborso chilometrico è regolato dalle tabelle ACI aggiornate annualmente.

**Come funziona in GeniusHR:**

1. **Il dipendente inserisce:**
   - Partenza (es. "Studio - Via Rossi 1, Roma")
   - Arrivo (es. "Cliente XYZ - Via Verdi 10, Milano")
   - Tipo veicolo (auto benzina, diesel, ibrida, etc.)
   - Km percorsi (il sistema può calcolarli automaticamente)

2. **Il sistema calcola:**
   - Tariffa ACI per il tipo veicolo
   - Km x Tariffa = Importo
   - Eventuali maggiorazioni (pedaggi, parcheggi)

3. **Verifiche automatiche:**
   - Distanza compatibile con percorso dichiarato
   - Stesso percorso non fatto più volte lo stesso giorno
   - Km mensili non eccessivi

**Tariffe ACI 2026 (esempio):**
- Auto benzina < 1200cc: €0.68/km
- Auto diesel < 1500cc: €0.63/km
- Auto ibrida: €0.58/km
- Auto elettrica: €0.48/km

**Nota:** GeniusHR mantiene automaticamente le tabelle aggiornate.`,
        tips: [
          'Chiedi sempre la targa del veicolo usato (verifica coerenza)',
          'Confronta i km dichiarati con Google Maps',
          'Considera un forfait mensile per chi viaggia molto (più semplice)',
        ],
        checklist: [
          'Verificare che le tariffe ACI siano aggiornate',
          'Raccogliere i dati dei veicoli dei dipendenti',
          'Impostare limiti km mensili per ruolo',
        ],
      },
      {
        title: 'Approvazione Note Spese',
        content: `Un processo di approvazione efficiente mantiene i dipendenti felici e i costi sotto controllo.

**Workflow consigliato:**

**Step 1: Controllo automatico**
GeniusHR verifica:
- Ricevuta allegata ✓
- Importo entro massimale ✓
- Categoria corretta ✓
- Trasferta autorizzata ✓

**Step 2: Revisione manager**
- Controlla che la spesa sia pertinente
- Verifica ricevuta leggibile
- Approva o richiede chiarimenti

**Step 3: Pagamento**
- Nota spesa approvata → export per contabilità
- Liquidazione in busta paga o bonifico separato
- Tracciamento pagamento in GeniusHR

**Cosa controllare:**
1. **Coerenza:** La spesa è relativa all'attività dichiarata?
2. **Necessità:** Era davvero necessaria?
3. **Documentazione:** Ricevuta conforme?
4. **Duplicati:** Non è già stata rimborsata?

**Tempo di approvazione target:** 48-72 ore`,
        tips: [
          'Approva le piccole spese conformi entro 24h (morale alto)',
          'Chiedi chiarimenti invece di rifiutare direttamente',
          'Usa i dati storici per identificare pattern sospetti',
        ],
      },
      {
        title: 'Controllo Budget Trasferte',
        content: `Monitora le spese viaggio per mantenerle sotto controllo.

**Dashboard GeniusHR - Spese:**
- Spese totali mese corrente
- Spese per dipendente
- Spese per categoria
- Trend mensile

**Alert automatici:**
- Budget mensile superato
- Singolo dipendente > €500/mese
- Spese sospette (duplicate, incongruenze)

**Report per la contabilità:**
Esporta CSV mensile con:
- Dipendente
- Data spesa
- Categoria
- Importo
- Stato (approvato/rimborsato)

**Best practice:**
1. Imposta budget annuale
2. Monitora ogni mese
3. Analizza trimestrale
4. Adegua policy se necessario`,
        tips: [
          'Confronta spese anno su anno per identificare aumenti anomali',
          'Premia i dipendenti virtuosi che rispettano i limiti',
          'Negozia convenzioni con hotel/ristoranti per trasferte ricorrenti',
        ],
      },
    ],
  },
  {
    id: 'payslip-distribution',
    title: 'Distribuzione Cedolini Veloce',
    description: 'Carica, distribuisci e archivia le buste paga in modo sicuro e tracciabile',
    category: 'Amministrazione',
    icon: '📄',
    duration: '5 min',
    relatedPages: ['/payslips'],
    sections: [
      {
        title: 'Upload Massivo Buste Paga',
        content: `GeniusHR semplifica la distribuzione mensile dei cedolini.

**Metodi di upload:**

**1. Upload singolo**
- Carica un PDF per ogni dipendente
- Nomenclatura: "Cognome_Nome_AAAA-MM.pdf"
- Sistema associa automaticamente al dipendente

**2. Upload multiplo (consigliato)**
- Carica più file PDF contemporaneamente
- Il sistema riconosce i nomi dai file
- Verifica e conferma l'associazione

**3. PDF unico multi-pagina**
- Il consulente genera un PDF unico con tutti i cedolini
- GeniusHR lo divide automaticamente
- Ogni dipendente riceve solo il suo

**Dopo l'upload:**
1. Sistema invia notifica email a ogni dipendente
2. Notifica push nell'app mobile
3. Cedolino disponibile in area riservata
4. Tracciamento visualizzazione

**Sicurezza:**
- Ogni dipendente vede SOLO il proprio cedolino
- Download tracciato (data, ora, IP)
- Archiviazione conforme GDPR
- Backup automatico`,
        tips: [
          'Carica i cedolini sempre lo stesso giorno (es. 27 del mese)',
          'Verifica che tutti i dipendenti abbiano ricevuto la notifica',
          'Usa nomenclatura standard per evitare errori di associazione',
        ],
        links: [
          { label: 'Carica cedolini', href: '/payslips' },
          { label: 'Storico distribuzioni', href: '/payslips?view=history' },
        ],
      },
      {
        title: 'Smistamento Automatico',
        content: `Il sistema di riconoscimento automatico risparmia ore di lavoro.

**Come funziona:**

1. **Riconoscimento codice fiscale**
   - GeniusHR legge il CF dal PDF
   - Cerca corrispondenza nel database dipendenti
   - Associa automaticamente

2. **Riconoscimento nome**
   - Se CF non disponibile, usa nome e cognome
   - Matching fuzzy (tollera piccole differenze)
   - Richiede conferma se ambiguo

3. **Matricola dipendente**
   - Se presente nel cedolino
   - Matching univoco

**Gestione errori:**
- Se non trova corrispondenza: richiede associazione manuale
- Se trova duplicati: chiede conferma
- Log completo di tutte le operazioni

**Verifica prima dell'invio:**
Prima di confermare, controlla:
- Tutti i dipendenti hanno il cedolino ✓
- Nessun cedolino doppio ✓
- Periodo corretto (AAAA-MM) ✓
- Dimensione file ragionevole ✓

Solo dopo clicca "Conferma e Invia"`,
        tips: [
          'Testa lo smistamento automatico con 2-3 cedolini prima di caricare tutto',
          'Chiedi al consulente di usare sempre la stessa formattazione nei PDF',
          'Mantieni aggiornato il database dipendenti (CF corretti)',
        ],
      },
      {
        title: 'Verifica Consegna',
        content: `Assicurati che tutti abbiano ricevuto e visto il cedolino.

**Dashboard Cedolini:**

📊 **Panoramica distribuzione Gennaio 2026**
- 23/25 dipendenti hanno visualizzato
- 2 non ancora visti (Maria Rossi, Luca Verdi)
- Media visualizzazione: 4h dall'invio

**Azioni disponibili:**

1. **Sollecita visualizzazione**
   - Click su "Invia reminder" per chi non ha visto
   - Email automatica: "Hai un nuovo cedolino disponibile"

2. **Verifica singola**
   - Click sul dipendente
   - Vedi: data upload, data email, data visualizzazione, IP download

3. **Esporta log consegna**
   - CSV con tutte le consegne
   - Prova legale di distribuzione
   - Utile per eventuali contenziosi

**Stato tracciamento:**
- ✉️ Inviato: email notifica inviata
- 👁️ Visto: dipendente ha aperto il cedolino
- 💾 Scaricato: dipendente ha fatto download PDF

**Tempistiche normali:**
- 80% visualizza entro 24h
- 95% entro 3 giorni
- Se dopo 7 giorni non visualizzato: contatta telefonicamente`,
        tips: [
          'Non sollecitare prima di 48h (dai tempo di controllare)',
          'Se qualcuno non visualizza mai, controlla email sia corretta',
          'Considera consegna tracciata come prova legale di ricezione',
        ],
      },
      {
        title: 'Gestione CU Annuali',
        content: `Le Certificazioni Uniche seguono lo stesso processo dei cedolini.

**Quando distribuire la CU:**
- Termine legale: 16 marzo
- Consigliato: entro fine febbraio
- Per cessati: entro 12 giorni dalla cessazione

**Processo:**
1. Ricevi le CU dal consulente (di solito PDF multiplo)
2. Upload su GeniusHR nella sezione "Documenti Fiscali"
3. Tag: "CU 2026"
4. Sistema invia notifica a tutti
5. Tracciamento download

**Particolarità CU:**
- Conservazione 10 anni (GeniusHR lo fa automaticamente)
- Dipendenti ex-dipendenti devono poter scaricare
- Consegna tracciata importante per eventuali controlli

**Consiglio:**
Crea una categoria documenti "Certificazioni Annuali" che include:
- CU
- Prospetto ferie residue
- Prospetto TFR
- Altre certificazioni fiscali`,
        tips: [
          'Invia comunicazione preventiva: "CU in arrivo entro 28 febbraio"',
          'Ricorda che la CU serve per la dichiarazione dei redditi',
          'Offri supporto per domande sulla lettura della CU',
        ],
        checklist: [
          'Richiedere CU al consulente entro 15 febbraio',
          'Verificare che siano presenti anche i cessati anno precedente',
          'Upload e distribuzione entro fine febbraio',
          'Verifica visualizzazione da parte di tutti',
          'Archiviare conferme di consegna',
        ],
      },
    ],
  },
  {
    id: 'internal-communication',
    title: 'Comunicazione Efficace',
    description: 'Usa la bacheca digitale e le notifiche per comunicare in modo chiaro e tracciabile',
    category: 'Comunicazione',
    icon: '📢',
    duration: '4 min',
    relatedPages: ['/messages'],
    sections: [
      {
        title: 'Uso della Bacheca Digitale',
        content: `La bacheca digitale sostituisce email massive e bacheche fisiche.

**Tipi di comunicazioni:**

📌 **Circolari Aziendali**
- Cambio regolamento
- Nuove policy
- Aggiornamenti normativi
- Richiesta conferma lettura: SÌ

📣 **Avvisi Importanti**
- Chiusure straordinarie
- Modifiche orari
- Eventi aziendali
- Richiesta conferma lettura: SÌ

📰 **News e Comunicazioni**
- Successi aziendali
- Benvenuto nuovi colleghi
- Auguri e festività
- Richiesta conferma lettura: NO

⚠️ **Emergenze**
- Comunicazioni urgenti
- Problemi strutturali
- Alert sicurezza
- Invio anche via SMS

**Come pubblicare:**
1. Vai su Comunicazioni → Nuova
2. Scrivi titolo chiaro
3. Messaggio conciso (max 500 parole)
4. Allega documenti se necessario
5. Seleziona destinatari (tutti / reparto / gruppo)
6. Attiva "Conferma lettura" se importante
7. Pubblica o programma per data futura`,
        tips: [
          'Scrivi titoli chiari che riassumono il contenuto',
          'Usa elenchi puntati per messaggi lunghi',
          'Allega sempre i documenti ufficiali (non link esterni)',
        ],
        links: [
          { label: 'Vai alla bacheca', href: '/messages' },
          { label: 'Crea comunicazione', href: '/messages/new' },
        ],
      },
      {
        title: 'Quando e Cosa Comunicare',
        content: `La comunicazione efficace è tempestiva e pertinente.

**Linee guida:**

✅ **Comunica sempre:**
- Cambio orari/turni con almeno 7 giorni preavviso
- Nuove policy prima che entrino in vigore
- Modifiche contrattuali/retributive
- Risultati aziendali (trimestre/anno)
- Benvenuto nuovi colleghi
- Emergenze e problemi che impattano il lavoro

❌ **Non comunicare:**
- Questioni personali di singoli dipendenti
- Dettagli riservati (retribuzioni, disciplinari)
- Rumor non confermati
- Troppi messaggi poco importanti (sovraccarico)

**Frequenza consigliata:**
- Massimo 1-2 comunicazioni a settimana
- Eccezione: emergenze
- Raggruppa info non urgenti in digest settimanale

**Tone of voice:**
- Professionale ma friendly
- Chiaro e diretto
- Evita gerghi tecnici
- Spiega sempre il "perché"`,
        tips: [
          'Prima di pubblicare, chiediti: "È davvero utile per tutti?"',
          'Usa la programmazione per comunicazioni ricorrenti (es. auguri)',
          'Evita comunicazioni il venerdì pomeriggio (basso tasso lettura)',
        ],
      },
      {
        title: 'Conferma Lettura Documenti',
        content: `La conferma di lettura crea una prova legale di consegna.

**Quando richiederla:**
- Policy e regolamenti
- Codice disciplinare
- Modifiche contrattuali
- Informative privacy
- Procedure sicurezza
- Comunicazioni con deadline

**Come funziona:**
1. Attivi "Richiedi conferma" quando pubblichi
2. Dipendente riceve notifica
3. Deve aprire e leggere
4. Click su "Ho letto e compreso"
5. Sistema registra: nome, data, ora, IP

**Tracciamento:**
Dashboard mostra:
- Chi ha confermato ✓
- Chi non ha ancora letto ❌
- Chi ha letto ma non confermato ⚠️

**Solleciti automatici:**
- Dopo 3 giorni: reminder automatico
- Dopo 7 giorni: secondo reminder
- Dopo 14 giorni: notifica a manager

**Valore legale:**
La conferma di lettura tracciata è considerata prova di consegna in caso di:
- Contenziosi disciplinari
- Verifiche ispettive
- Audit GDPR`,
        tips: [
          'Usa conferma lettura solo per documenti davvero importanti',
          'Spiega sempre perché è importante confermare',
          'Esporta log conferme e archivia per 10 anni',
        ],
        checklist: [
          'Identificare quali documenti richiedono conferma obbligatoria',
          'Configurare solleciti automatici',
          'Preparare email di follow-up per chi non conferma',
          'Archiviare log conferme trimestralmente',
        ],
      },
      {
        title: 'Gestione Emergenze',
        content: `In caso di emergenza, la comunicazione deve essere immediata e multicanale.

**Canali di emergenza:**

1. **SMS:** Per urgenze critiche
   - Chiusura improvvisa
   - Problemi sicurezza
   - Alert meteo
   - Tutti ricevono istantaneamente

2. **Notifica Push App:** Arriva subito su smartphone
3. **Email:** Per backup e dettagli
4. **Bacheca:** Per storico consultabile

**Tipologie emergenze:**

🚨 **Sicurezza:**
"ATTENZIONE: Allarme incendio. Evacuare lo studio immediatamente."
→ SMS + Push + Email

❄️ **Meteo:**
"Nevicata intensa. Studio chiuso oggi 27/01. Recupero sabato."
→ SMS + Push

⚠️ **Struttura:**
"Guasto caldaia. Temperatura bassa. Portare abbigliamento pesante."
→ Push + Email

🦠 **Sanitario:**
"Caso COVID confermato. Tamponi per tutti domani mattina."
→ SMS + Push + Email + Bacheca

**Template pre-configurati:**
Prepara template per scenari comuni:
- Chiusura maltempo
- Guasto strutturale
- Emergenza sanitaria
- Evacuazione
In emergenza: selezioni template, personalizzi, invii`,
        tips: [
          'Testa il sistema SMS prima che serva davvero',
          'Mantieni aggiornati i numeri di telefono dei dipendenti',
          'Fai drill annuale per verificare che tutti ricevano le notifiche',
          'Nominare un backup per comunicazioni emergenza se tu non disponibile',
        ],
      },
    ],
  },
  {
    id: 'perfect-onboarding',
    title: 'Onboarding Perfetto',
    description:
      'Crea un percorso di inserimento strutturato che aumenta retention e produttività',
    category: 'Organizzazione',
    icon: '🚀',
    duration: '9 min',
    relatedPages: ['/onboarding', '/employees'],
    sections: [
      {
        title: 'Checklist Primo Giorno',
        content: `Il primo giorno determina l'impressione a lungo termine.

**Pre-arrivo (settimana prima):**
- Invia email di benvenuto con info pratiche
- Prepara postazione lavoro
- Configura account email
- Ordina badge/divisa se necessari
- Notifica il team dell'arrivo

**Mattina Giorno 1:**
- 09:00 Accoglienza personale (tu o HR)
- 09:15 Tour dello studio
- 09:30 Presentazione team
- 10:00 Consegna badge e materiali
- 10:30 Setup postazione (computer, telefono)
- 11:00 Firma documenti obbligatori

**Pomeriggio Giorno 1:**
- 14:00 Formazione sicurezza base
- 15:00 Presentazione procedure studio
- 16:00 Assegnazione buddy/mentor
- 17:00 Q&A e recap giornata

**Da NON dimenticare:**
- Foto per badge
- Codici accesso
- Password email/sistemi
- Consegna DPI
- Modulistica privacy`,
        tips: [
          'Prepara un welcome kit (penna, block notes, gadget aziendali)',
          'Pranzo di benvenuto con il team (facilita integrazione)',
          'Non sovraccaricare di informazioni: meglio spalmare su 3-5 giorni',
        ],
        links: [
          { label: 'Gestisci onboarding', href: '/onboarding' },
          { label: 'Aggiungi dipendente', href: '/employees/new' },
        ],
        checklist: [
          'Email benvenuto inviata 7 giorni prima',
          'Postazione preparata e funzionante',
          'Account IT configurati',
          'Badge/divisa ordinati',
          'Team notificato',
          'Documenti stampati e pronti',
          'Buddy assegnato',
          'Calendario formazione definito',
        ],
      },
      {
        title: 'Documenti Obbligatori',
        content: `La conformità legale parte dall'onboarding.

**Documenti da raccogliere:**

📋 **Amministrativi**
- Documento identità (copia)
- Codice fiscale
- Tessera sanitaria
- IBAN per bonifico stipendio
- Stato famiglia (per detrazioni)

📜 **Contrattuali**
- Contratto di assunzione (2 copie firmate)
- CCNL applicato (consegna + conferma ricezione)
- Lettera assunzione/inquadramento
- Patto di prova (se applicabile)

🔒 **Privacy e Sicurezza**
- Informativa privacy dipendenti
- Consenso trattamento dati
- Patto di riservatezza (NDA)
- Nomina autorizzato trattamento dati
- Policy uso email/strumenti aziendali

🛡️ **Sicurezza Lavoro**
- Verbale consegna DPI
- Presa visione DVR
- Attestato formazione sicurezza (da fare entro 60gg)
- Visita medica (se prevista)

**Gestione in GeniusHR:**
- Upload documenti in fascicolo dipendente
- Richiesta firma digitale per quelli obbligatori
- Tracking stato (firmato/non firmato)
- Alert scadenze (es. visita medica periodica)`,
        tips: [
          'Usa checklist digitale per non dimenticare nulla',
          'Archivia tutto digitalmente (backup automatico)',
          'Prepara cartella fisica solo per originali richiesti per legge',
        ],
      },
      {
        title: 'Formazione Sicurezza',
        content: `La formazione sicurezza è obbligatoria prima che il dipendente inizi a lavorare.

**Corsi obbligatori (D.Lgs. 81/2008):**

**Formazione Generale (4 ore)**
- Concetti di rischio
- Organizzazione prevenzione aziendale
- Diritti e doveri dei lavoratori
- Da completare: PRIMA dell'inizio attività

**Formazione Specifica (4-12 ore)**
- Rischi specifici del settore
- Per studio dentistico: rischio biologico, chimico, radiologico
- Da completare: entro 60 giorni dall'assunzione

**Primo Soccorso (12 ore)**
- Solo per addetti nominati
- Rinnovo ogni 3 anni

**Antincendio (4-8 ore)**
- Per addetti antincendio
- Rinnovo ogni 5 anni

**Tracciamento in GeniusHR:**
- Inserisci dipendente
- Sistema genera scadenzario formazione
- Alert 60 giorni prima scadenza
- Carica attestati quando completati
- Storico formazioni sempre disponibile

**Sanzioni mancata formazione:**
- Sospensione attività
- Multe fino a €6.000
- Responsabilità penale datore lavoro`,
        tips: [
          'Organizza sessioni formative di gruppo (più economico)',
          'Usa enti formativi accreditati (validità attestati)',
          'Conserva attestati per almeno 10 anni',
        ],
        checklist: [
          'Verificare che formazione generale sia fatta PRIMA inizio lavoro',
          'Calendario formazione specifica entro 60gg',
          'Identificare addetti primo soccorso/antincendio',
          'Caricare attestati nel sistema',
          'Impostare alert rinnovi',
        ],
      },
      {
        title: 'Periodo di Prova',
        content: `Il periodo di prova serve a valutare reciprocamente l'idoneità.

**Durate standard (CCNL Studi Professionali):**
- Quadri: 6 mesi
- Impiegati I-II livello: 6 mesi
- Impiegati III-IV livello: 4 mesi
- Impiegati V livello: 2 mesi

**Momenti di valutazione:**

**30 giorni:**
- Check informale con manager diretto
- Verifica adattamento
- Feedback reciproco
- Eventuali correzioni di rotta

**60 giorni (se prova 6 mesi):**
- Valutazione intermedia formale
- Compilazione scheda valutazione
- Decisione: conferma / proroga / risoluzione

**Fine prova:**
- Valutazione finale
- Esito: CONFERMATO / LICENZIATO
- Comunicazione formale
- Se confermato: celebra! (messaggio team, welcome ufficiale)

**GeniusHR - Gestione periodo prova:**
- Alert automatici a 30-60 giorni
- Template scheda valutazione
- Storico feedback
- Comunicazione esito tracciata

**Attenzione legale:**
Durante periodo prova:
- Recesso libero senza preavviso (entrambe parti)
- Non serve motivazione
- Comunicazione scritta raccomandata/PEC
- Niente licenziamento discriminatorio (sempre vietato)`,
        tips: [
          'Non aspettare ultimo giorno per decidere: valuta progressivamente',
          'Se hai dubbi, meglio risolvere che confermare (errore costoso)',
          'Documenta sempre i motivi della decisione (utile se contestato)',
        ],
      },
    ],
  },
  {
    id: 'compliance-management',
    title: 'Conformità Normativa',
    description: 'Rispetta gli obblighi D.Lgs. 81/08, gestisci la disciplina e conserva documenti',
    category: 'Compliance',
    icon: '⚖️',
    duration: '8 min',
    relatedPages: ['/safety', '/disciplinary'],
    sections: [
      {
        title: 'Obblighi D.Lgs. 81/08',
        content: `Il Testo Unico Sicurezza impone precisi obblighi al datore di lavoro.

**Documenti obbligatori:**

📄 **DVR - Documento Valutazione Rischi**
- Obbligatorio per tutte le aziende
- Aggiornamento: ogni modifica organizzativa rilevante
- Presa visione tracciata per ogni dipendente
- Sanzioni mancanza: arresto 3-6 mesi + ammenda €3.000-9.000

📊 **Registro Infortuni**
- Annotare ogni infortunio > 1 giorno assenza
- Conservazione 4 anni
- GeniusHR lo mantiene automaticamente

👷 **Nomine Sicurezza**
- RSPP (Responsabile Servizio Prevenzione Protezione)
- Medico Competente (se sorveglianza sanitaria obbligatoria)
- Addetti Primo Soccorso
- Addetti Antincendio
- RLS (Rappresentante Lavoratori Sicurezza)

**Scadenze formazione:**
- Formazione generale: prima inizio attività
- Formazione specifica: entro 60gg
- Rinnovo formazione: ogni 5 anni
- Primo Soccorso: ogni 3 anni
- Antincendio: ogni 5 anni

**Gestione in GeniusHR:**
Sezione Sicurezza → Dashboard
- Scadenzario formazioni
- Alert automatici
- Registro infortuni digitale
- Archivio DVR e nomine`,
        tips: [
          'Nomina RSPP esterno se non hai competenze interne',
          'Fai audit annuale di conformità con consulente sicurezza',
          'Non sottovalutare: sanzioni penali per datore lavoro',
        ],
        links: [
          { label: 'Vai a Sicurezza', href: '/safety' },
          { label: 'Scadenzario corsi', href: '/safety/training' },
        ],
      },
      {
        title: 'Procedura Disciplinare Corretta',
        content: `La procedura disciplinare prevista dall'Art. 7 Statuto Lavoratori deve essere seguita rigorosamente.

**Step obbligatori:**

**1. Contestazione Addebito**
- Comunicazione scritta raccomandata/PEC
- Descrizione precisa dei fatti
- Riferimenti normativi violati
- Possibili sanzioni applicabili
- Concessione termine difese (min 5 giorni)

**2. Attesa Difese**
- Dipendente ha 5 giorni per difendersi
- Può chiedere essere sentito (colloquio)
- Può farsi assistere da rappresentante sindacale
- Può presentare documenti/testimoni

**3. Valutazione**
- Esaminare attentamente le giustificazioni
- Valutare prove e controprove
- Decidere se procedere o archiviare

**4. Provvedimento**
- Se sanzione: comunicare per iscritto
- Indicare: fatti, sanzione, motivazione
- Tempistica: ragionevole (di solito entro 15gg)

**5. Esecuzione**
- Multa: massimo 4h retribuzione, in busta paga
- Sospensione: massimo 10gg
- Licenziamento: preavviso o per giusta causa

**Errori da evitare:**
❌ Saltare la contestazione scritta
❌ Non concedere 5 giorni per difese
❌ Sanzione sproporzionata al fatto
❌ Mancanza di prove documentate
❌ Violare privacy (non comunicare a terzi)

**GeniusHR - Gestione Disciplinare:**
- Workflow guidato step-by-step
- Template contestazioni
- Tracciamento tempistiche
- Archivio provvedimenti
- Alert scadenze`,
        tips: [
          'Prima di contestare: raccogli tutte le prove (email, testimoni)',
          'Consulta sempre CCNL per sanzioni proporzionate',
          'Considera arbitrato/conciliazione prima del licenziamento',
        ],
        links: [
          { label: 'Gestione disciplinare', href: '/disciplinary' },
          { label: 'Registro provvedimenti', href: '/disciplinary/register' },
        ],
      },
      {
        title: 'Gestione Whistleblowing',
        content: `Dal 15 luglio 2023 è obbligatorio un canale di segnalazione (D.Lgs. 24/2023).

**Chi deve attivarlo:**
- Aziende > 50 dipendenti: OBBLIGATORIO
- Aziende < 50 dipendenti: facoltativo (ma consigliato)

**Caratteristiche canale:**
- ✅ Anonimo (se richiesto dal segnalante)
- ✅ Sicuro (crittografia comunicazioni)
- ✅ Tracciato (ogni passaggio registrato)
- ✅ Riservato (accesso solo a persone autorizzate)

**Categorie segnalazioni:**
- Frodi e corruzione
- Violazioni sicurezza sul lavoro
- Discriminazione e molestie
- Violazioni privacy
- Irregolarità finanziarie
- Violazioni normative

**Obblighi del gestore:**
- Conferma ricezione: entro 7 giorni
- Feedback al segnalante: entro 3 mesi
- Protezione segnalante da ritorsioni
- Riservatezza identità (se richiesta)

**GeniusHR Whistleblowing:**
- Canale anonimo con codice accesso
- Messaggistica sicura bidirezionale
- Gestione ticket strutturata
- Alert tempistiche legali
- Report conformità

**Sanzioni mancato adempimento:**
- €10.000 - €50.000 per mancanza canale
- Responsabilità amministrativa ente
- Nullità licenziamento ritorsivo`,
        tips: [
          'Nomina gestore dedicato (persona fidata e discreta)',
          'Comunica esistenza canale a tutti i dipendenti',
          'Forma il gestore su normativa e gestione segnalazioni',
        ],
        links: [
          { label: 'Vai a Whistleblowing', href: '/whistleblowing' },
          { label: 'Segnalazioni ricevute', href: '/whistleblowing?status=received' },
        ],
      },
      {
        title: 'Conservazione Documenti',
        content: `La normativa prevede obblighi di conservazione documentale precisi.

**Tabella conservazione:**

**10 ANNI:**
- Fascicolo personale dipendente
- Contratti lavoro
- Schede formazione sicurezza
- Registro DPI
- Provvedimenti disciplinari
- Libro Unico Lavoro (LUL)
- Documenti contributivi e fiscali

**5 ANNI:**
- Buste paga
- Prospetti contributivi
- CU (Certificazioni Uniche)
- Richieste ferie/permessi
- Note spese

**4 ANNI:**
- Registro infortuni
- Comunicazioni infortuni INAIL

**PERMANENTE:**
- DVR aggiornato
- Nomine sicurezza
- Verbali rappresentanti lavoratori

**Modalità conservazione:**
- Formato digitale: OK (preferibile)
- Backup regolari
- Protezione da accessi non autorizzati
- Sistema di recupero rapido

**GeniusHR - Archivio:**
- Conservazione automatica con scadenze
- Backup giornalieri
- Conformità GDPR
- Export facilitato per controlli
- Calcolo automatico scadenze conservazione

**In caso di ispezione:**
- Il sistema genera report istantaneo
- Esporta documenti richiesti
- Log accessi e modifiche disponibili`,
        tips: [
          'Etichetta i documenti con data scadenza conservazione',
          'Fai pulizia annuale documenti scaduti (GDPR)',
          'Testa il processo di recupero documenti almeno 1 volta/anno',
        ],
        checklist: [
          'Verificare tutti i documenti siano archiviati digitalmente',
          'Configurare backup automatici giornalieri',
          'Impostare alert scadenza conservazione',
          'Nominare responsabile archivio documentale',
          'Documentare policy conservazione documenti',
        ],
      },
    ],
  },
  {
    id: 'consultant-collaboration',
    title: 'Collaborazione con il Consulente',
    description:
      'Configura accessi sicuri e condividi dati in modo efficiente con il tuo consulente del lavoro',
    category: 'Amministrazione',
    icon: '🤝',
    duration: '5 min',
    relatedPages: ['/consultant', '/settings/integrations'],
    sections: [
      {
        title: 'Configurare Accesso Consulente',
        content: `GeniusHR permette al tuo consulente di accedere ai dati necessari senza compromettere la privacy.

**Come invitare il consulente:**

1. **Vai su Impostazioni → Consulente del Lavoro**
2. Click "Invita Consulente"
3. Inserisci email consulente
4. Seleziona permessi (template "Consulente Standard")
5. Invia invito

**Permessi consulente:**
✅ Visualizza anagrafiche dipendenti
✅ Visualizza presenze e assenze
✅ Visualizza note spese approvate
✅ Carica cedolini e CU
✅ Visualizza variazioni contrattuali
❌ Non può modificare dati master
❌ Non vede documenti disciplinari
❌ Non accede a whistleblowing

**Cosa vede il consulente:**
- Dashboard dedicata con i suoi clienti
- Per ogni cliente: dipendenti attivi
- Presenze mese corrente
- Ferie/permessi approvati
- Variazioni da elaborare

**Vantaggi:**
- Fine ping-pong email con Excel allegati
- Dati sempre aggiornati in tempo reale
- Upload cedolini diretto (nessun intermediario)
- Storico comunicazioni tracciato`,
        tips: [
          'Crea account consulente DOPO aver inserito i dipendenti',
          'Verifica con consulente che abbia ricevuto invito (controlla spam)',
          'Se cambi consulente, revoca accesso al precedente',
        ],
        links: [
          { label: 'Invita consulente', href: '/settings/integrations' },
          { label: 'Area consulente', href: '/consultant' },
        ],
      },
      {
        title: 'Export Dati per Paghe',
        content: `Il consulente ha bisogno di dati in formato compatibile col suo software paghe.

**Formati supportati:**
- **CSV Standard:** compatibile Zucchetti, TeamSystem, Inaz
- **Excel:** per elaborazioni manuali
- **PDF:** per reportistica

**Dati esportabili:**

📊 **Presenze Mensili**
- Per dipendente: giorni lavorati, straordinari, assenze
- Formato: CSV con codici software paghe
- Esporta ultimo giorno del mese

🏖️ **Ferie e Permessi**
- Richieste approvate nel periodo
- Saldi aggiornati
- Residui anno precedente

💰 **Note Spese**
- Spese approvate da rimborsare
- Raggruppate per dipendente
- Pronte per liquidazione

📝 **Variazioni Contrattuali**
- Nuove assunzioni
- Cessazioni
- Variazioni orario/retribuzione
- Promozioni

**Processo mensile:**
1. Tu esporti dati GeniusHR (es. 28 del mese)
2. Invii al consulente (o lui scarica direttamente)
3. Consulente elabora cedolini
4. Consulente carica cedolini su GeniusHR
5. Tu distribuisci ai dipendenti

**Automazione:**
- Puoi configurare export automatico
- Il consulente riceve email il 28 con link download
- Zero intervento manuale`,
        tips: [
          'Valida dati prima di esportare (controlla anomalie presenze)',
          'Esporta sempre ultimo giorno utile del mese',
          'Mantieni nomenclatura coerente tra GeniusHR e software paghe',
        ],
      },
      {
        title: 'Comunicazioni Efficaci',
        content: `La comunicazione fluida con il consulente evita errori e ritardi.

**Canali di comunicazione:**

💬 **Messaggistica Interna**
- Usa il sistema messaggi GeniusHR
- Threads per argomento
- Tutto tracciato e archiviato
- Meglio di email disperse

📧 **Email:** per urgenze
☎️ **Telefono:** solo per questioni critiche

**Cosa comunicare al consulente:**

🔄 **Immediatamente:**
- Nuova assunzione (dati per primo cedolino)
- Dimissioni/licenziamento
- Infortunio con assenza
- Malattia lunga (> 7 giorni)
- Cambio dati bancari dipendente

📅 **Mensilmente:**
- Variazioni retributive
- Promozioni/cambio livello
- Variazioni orario (part-time)
- Premi/bonus da erogare

📆 **Annualmente:**
- Rinnovo CCNL
- Variazioni contributive
- Aggiornamento policy aziendali

**Template comunicazioni:**
GeniusHR include template per:
- Nuova assunzione
- Cessazione rapporto
- Variazione dati
- Richiesta consulenza

**Tempistiche standard:**
- Dati presenze: entro 28 del mese
- Cedolini caricati: entro 3 del mese successivo
- CU: entro 28 febbraio`,
        tips: [
          'Stabilisci workflow chiaro con consulente (chi fa cosa, quando)',
          'Fissa call mensile breve (30 min) per allineamento',
          'Usa checklist condivisa per scadenze',
        ],
        checklist: [
          'Invito consulente inviato e accettato',
          'Workflow export dati concordato',
          'Template comunicazioni configurati',
          'Calendario scadenze condiviso',
          'Responsabili identificati (lato tuo e lato consulente)',
        ],
      },
      {
        title: 'Gestione Modifiche',
        content: `Tracciare le modifiche è fondamentale per audit e conformità.

**Modifiche tracciate automaticamente:**
- Chi ha modificato
- Cosa è stato modificato
- Valore precedente → nuovo valore
- Data e ora
- IP address

**Tipologie modifiche:**

👤 **Dati Dipendente**
- Anagrafica
- Retribuzione
- Orario lavoro
- Mansione

📋 **Dati Amministrativi**
- IBAN
- Codice fiscale
- Dati familiari (per detrazioni)

🏢 **Organizzazione**
- Reparto
- Manager
- Sede di lavoro

**Report modifiche:**
Esporta mensile per consulente:
- Tutte le modifiche del mese
- Chi le ha fatte
- Per quale dipendente

**Utile per:**
- Controllo coerenza dati paghe
- Audit interni
- Risolvere discrepanze
- Verifiche ispettive

**Best practice:**
- Solo HR autorizzato a modificare dati master
- Modifiche retributive sempre documentate
- Alert automatico a consulente per modifiche critiche`,
        tips: [
          'Esporta log modifiche ogni fine mese',
          'Archivia con cedolini del periodo',
          'In caso di errore: documenta correzione nel log',
        ],
      },
    ],
  },
]

export function getTutorialById(id: string): Tutorial | undefined {
  return tutorials.find((t) => t.id === id)
}

export function getTutorialsByCategory(category: TutorialCategory): Tutorial[] {
  return tutorials.filter((t) => t.category === category)
}

export function getAllCategories(): TutorialCategory[] {
  return Array.from(new Set(tutorials.map((t) => t.category)))
}

export function getTutorialProgress(tutorial: Tutorial, currentSection: number): number {
  return Math.round(((currentSection + 1) / tutorial.sections.length) * 100)
}
