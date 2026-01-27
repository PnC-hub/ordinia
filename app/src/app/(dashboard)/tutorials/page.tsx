'use client'

import { useState } from 'react'
import PageInfoTooltip from '@/components/PageInfoTooltip'

interface Tutorial {
  id: string
  title: string
  description: string
  category: string
  icon: string
  duration: string
  content: TutorialSection[]
}

interface TutorialSection {
  title: string
  content: string
  tips?: string[]
}

const tutorials: Tutorial[] = [
  {
    id: 'gestione-presenze',
    title: 'Monitoraggio Orario di Lavoro',
    description: 'Scopri come tracciare efficacemente le presenze dei tuoi collaboratori',
    category: 'Presenze',
    icon: '⏱️',
    duration: '5 min',
    content: [
      {
        title: 'Introduzione al Tracciamento Presenze',
        content: `Il monitoraggio dell'orario lavorativo rappresenta un aspetto fondamentale per ogni organizzazione.

Con GeniusHR puoi gestire le timbrature in modo digitale, eliminando badge fisici e fogli cartacei. I tuoi collaboratori possono registrare entrata e uscita direttamente dal proprio smartphone o dal portale web.

Il sistema calcola automaticamente:
- Ore ordinarie lavorate
- Eventuali straordinari
- Pause e interruzioni
- Totale mensile per elaborazione cedolino`,
        tips: [
          'Configura le soglie di tolleranza per ritardi e uscite anticipate',
          'Abilita la geolocalizzazione per verificare la posizione delle timbrature',
          'Imposta notifiche automatiche per anomalie'
        ]
      },
      {
        title: 'Configurazione Turni e Orari',
        content: `Definisci gli schemi orari della tua azienda in modo flessibile.

Puoi creare profili orari differenziati per:
- Uffici con orario standard 9-18
- Reparti con turnazione
- Collaboratori part-time
- Lavoratori in smart working

Ogni profilo può avere regole specifiche per la pausa pranzo, la flessibilità in entrata/uscita e il calcolo degli straordinari.`,
        tips: [
          'Crea template riutilizzabili per i turni più comuni',
          'Usa la funzione "copia settimana" per pianificare velocemente'
        ]
      }
    ]
  },
  {
    id: 'gestione-ferie',
    title: 'Amministrazione Ferie e Permessi',
    description: 'Gestisci assenze, ferie e permessi con approvazioni digitali',
    category: 'Assenze',
    icon: '🏖️',
    duration: '7 min',
    content: [
      {
        title: 'Il Ciclo delle Richieste di Assenza',
        content: `GeniusHR digitalizza completamente il processo di richiesta e approvazione delle assenze.

Il flusso standard prevede:
1. Il collaboratore invia la richiesta dal portale
2. Il responsabile riceve una notifica
3. Approva o rifiuta con un click
4. Il dipendente viene informato dell'esito
5. Il calendario si aggiorna automaticamente

Tipologie di assenza gestite:
- Ferie annuali
- Permessi retribuiti (ROL, ex festività)
- Malattia
- Congedi parentali
- Permessi studio
- Altre assenze personalizzabili`,
        tips: [
          'Imposta periodi di blocco ferie (es. chiusura aziendale)',
          'Configura il numero minimo di giorni di preavviso',
          'Abilita l\'approvazione automatica per permessi brevi'
        ]
      },
      {
        title: 'Calcolo Automatico dei Residui',
        content: `Il sistema mantiene aggiornato il contatore di ferie e permessi per ogni dipendente.

La maturazione avviene secondo il CCNL applicato:
- Contratti con 26 giorni annui: 2,17 giorni/mese
- Contratti con 22 giorni annui: 1,83 giorni/mese

Il calcolo considera:
- Maturato dall'inizio dell'anno
- Goduto fino ad oggi
- Pianificato e approvato
- Residuo disponibile

Puoi visualizzare lo storico completo e generare report per l'ufficio paghe.`,
        tips: [
          'Esporta i dati in formato compatibile con i software paghe',
          'Monitora i dipendenti con troppi giorni accumulati'
        ]
      }
    ]
  },
  {
    id: 'rimborso-spese',
    title: 'Gestione Note Spese e Rimborsi',
    description: 'Semplifica la rendicontazione delle spese sostenute dai collaboratori',
    category: 'Amministrazione',
    icon: '💰',
    duration: '6 min',
    content: [
      {
        title: 'Digitalizzazione delle Note Spese',
        content: `Elimina le ricevute cartacee e i fogli Excel per la gestione dei rimborsi.

Con GeniusHR i dipendenti possono:
- Fotografare gli scontrini con lo smartphone
- Compilare i dati della spesa
- Allegare documentazione di supporto
- Inviare la richiesta di rimborso

Il sistema effettua controlli automatici su:
- Limiti di spesa per categoria
- Documentazione obbligatoria allegata
- Duplicazioni involontarie`,
        tips: [
          'Definisci categorie di spesa specifiche per la tua azienda',
          'Imposta massimali per categoria (es. max €50 per pranzo)',
          'Richiedi sempre la foto della ricevuta originale'
        ]
      },
      {
        title: 'Rimborso Chilometrico',
        content: `Per le trasferte con mezzo proprio, configura il calcolo automatico del rimborso chilometrico.

Parametri configurabili:
- Tariffa per km (tabelle ACI o personalizzata)
- Indennità forfettaria per trasferta
- Limiti geografici

Il dipendente inserisce:
- Località di partenza e arrivo
- Motivo della trasferta
- Km percorsi (calcolabili automaticamente)

Il sistema genera il prospetto per la liquidazione in busta paga.`,
        tips: [
          'Aggiorna annualmente le tariffe ACI',
          'Considera l\'integrazione con Google Maps per il calcolo km'
        ]
      }
    ]
  },
  {
    id: 'buste-paga',
    title: 'Distribuzione Cedolini Digitali',
    description: 'Condividi le buste paga in modo sicuro e tracciabile',
    category: 'Cedolini',
    icon: '📄',
    duration: '4 min',
    content: [
      {
        title: 'Upload e Distribuzione Automatica',
        content: `GeniusHR permette di caricare i cedolini mensili e distribuirli automaticamente ai dipendenti.

Il processo:
1. L'ufficio paghe genera i PDF dei cedolini
2. Li carica su GeniusHR (singolarmente o in blocco)
3. Il sistema li associa ai dipendenti tramite codice fiscale o matricola
4. I collaboratori ricevono una notifica
5. Possono consultare e scaricare dal proprio portale

Vantaggi rispetto all'invio email:
- Archivio centralizzato e sempre accessibile
- Tracciabilità delle visualizzazioni
- Nessun rischio di smarrimento
- Conforme al GDPR`,
        tips: [
          'Usa la nomenclatura standard per l\'upload automatico',
          'Abilita la firma digitale per conferma ricezione',
          'Conserva i cedolini per almeno 5 anni'
        ]
      }
    ]
  },
  {
    id: 'comunicazioni-hr',
    title: 'Comunicazione con il Personale',
    description: 'Invia avvisi, circolari e comunicazioni a tutta l\'azienda',
    category: 'Comunicazione',
    icon: '📢',
    duration: '3 min',
    content: [
      {
        title: 'Bacheca Aziendale Digitale',
        content: `Sostituisci le bacheche fisiche e le email massive con la comunicazione integrata di GeniusHR.

Puoi pubblicare:
- Circolari aziendali
- Avvisi importanti
- Policy e regolamenti aggiornati
- News e comunicazioni interne

Ogni messaggio può essere:
- Inviato a tutti o a gruppi specifici
- Con richiesta di presa visione
- Con allegati (PDF, immagini)
- Programmato per data futura`,
        tips: [
          'Usa la conferma di lettura per comunicazioni importanti',
          'Crea gruppi di distribuzione (es. "Sede Milano", "Reparto Vendite")',
          'Archivia le comunicazioni per avere uno storico consultabile'
        ]
      }
    ]
  },
  {
    id: 'onboarding-dipendente',
    title: 'Processo di Inserimento Nuovi Assunti',
    description: 'Crea un\'esperienza di onboarding strutturata e professionale',
    category: 'Onboarding',
    icon: '🚀',
    duration: '8 min',
    content: [
      {
        title: 'Checklist di Onboarding',
        content: `Un processo di inserimento ben strutturato aumenta la produttività e la retention dei nuovi assunti.

GeniusHR permette di creare checklist personalizzate con:
- Documenti da far firmare (contratto, privacy, NDA)
- Informazioni da raccogliere (IBAN, dati anagrafici)
- Formazione obbligatoria da completare
- Materiali da consegnare (badge, attrezzatura)
- Task per i vari reparti coinvolti

Il sistema traccia lo stato di avanzamento e invia promemoria automatici per i task in scadenza.`,
        tips: [
          'Prepara kit di benvenuto digitali con materiali aziendali',
          'Assegna un buddy/mentor al nuovo assunto',
          'Pianifica check-in a 30, 60 e 90 giorni'
        ]
      },
      {
        title: 'Firma Digitale dei Documenti',
        content: `Elimina la carta e velocizza le assunzioni con la firma elettronica integrata.

Documenti firmabili digitalmente:
- Contratto di assunzione
- Informativa privacy
- Patto di non concorrenza
- Accordo smart working
- Consegna DPI

Il dipendente firma dal proprio dispositivo, riceve copia del documento firmato e tutto viene archiviato con validità legale.`,
        tips: [
          'Usa template predefiniti per i documenti più comuni',
          'Imposta scadenze per la firma con solleciti automatici',
          'Verifica la conformità legale della firma elettronica usata'
        ]
      }
    ]
  },
  {
    id: 'sicurezza-lavoro',
    title: 'Gestione Sicurezza e D.Lgs 81/08',
    description: 'Mantieni la conformità normativa sulla sicurezza sul lavoro',
    category: 'Sicurezza',
    icon: '🛡️',
    duration: '6 min',
    content: [
      {
        title: 'Scadenziario Formazione Sicurezza',
        content: `Il D.Lgs 81/08 prevede obblighi formativi con scadenze precise. GeniusHR li monitora per te.

Corsi tracciati:
- Formazione generale (4 ore, nessuna scadenza)
- Formazione specifica (4-12 ore, aggiornamento quinquennale)
- Antincendio (4-16 ore, aggiornamento quinquennale)
- Primo soccorso (12-16 ore, aggiornamento triennale)
- Preposti e dirigenti
- Corsi specifici (carrelli, PLE, lavori in quota)

Il sistema ti avvisa 60 giorni prima della scadenza per organizzare i rinnovi.`,
        tips: [
          'Carica gli attestati come documenti del dipendente',
          'Usa i report per pianificare sessioni formative di gruppo',
          'Verifica che il DVR sia allineato ai ruoli effettivi'
        ]
      },
      {
        title: 'Consegna DPI e Attrezzature',
        content: `Documenta la consegna dei Dispositivi di Protezione Individuale con firma digitale.

Per ogni consegna registra:
- Tipologia di DPI
- Data di consegna
- Firma di ricezione
- Scadenza (per DPI con durata limitata)

In caso di ispezione, avrai tutta la documentazione pronta e accessibile.`,
        tips: [
          'Crea modelli di consegna per mansione',
          'Imposta reminder per sostituzione DPI scaduti'
        ]
      }
    ]
  },
  {
    id: 'procedura-disciplinare',
    title: 'Gestione Provvedimenti Disciplinari',
    description: 'Conduci correttamente le procedure disciplinari rispettando la legge',
    category: 'Disciplinare',
    icon: '⚖️',
    duration: '7 min',
    content: [
      {
        title: 'Il Processo Disciplinare Corretto',
        content: `Una procedura disciplinare mal gestita può essere impugnata dal lavoratore. GeniusHR ti guida passo dopo passo.

Le fasi obbligatorie:
1. Contestazione scritta dell'addebito
2. Concessione di almeno 5 giorni per le giustificazioni
3. Valutazione delle difese del lavoratore
4. Eventuale applicazione della sanzione

Sanzioni previste (in ordine di gravità):
- Richiamo verbale
- Ammonizione scritta
- Multa (max 4 ore di retribuzione)
- Sospensione (max 10 giorni)
- Licenziamento disciplinare

Il sistema archivia ogni fase con date e documenti, creando un fascicolo completo.`,
        tips: [
          'Rispetta sempre i termini temporali previsti dal CCNL',
          'Non applicare mai sanzioni sproporzionate al fatto',
          'Conserva le prove (email, testimonianze, registrazioni)'
        ]
      }
    ]
  },
  {
    id: 'collaborazione-consulente',
    title: 'Collaborazione con il Consulente del Lavoro',
    description: 'Condividi dati e documenti con il tuo consulente in modo efficiente',
    category: 'Consulente',
    icon: '🤝',
    duration: '4 min',
    content: [
      {
        title: 'Area Dedicata al Consulente',
        content: `GeniusHR semplifica lo scambio di informazioni con il tuo studio di consulenza.

Il consulente può accedere a:
- Anagrafiche dipendenti aggiornate
- Presenze e assenze del mese
- Variazioni contrattuali
- Note spese da liquidare
- Documenti da elaborare

Puoi esportare i dati in formati compatibili con i principali software paghe (Zucchetti, TeamSystem, Inaz).

Fine del ping-pong di email e telefonate: tutto è centralizzato e sempre disponibile.`,
        tips: [
          'Crea un utente dedicato per lo studio consulenza',
          'Imposta permessi di sola lettura dove necessario',
          'Usa la messaggistica interna per richieste specifiche'
        ]
      }
    ]
  }
]

const categories = [...new Set(tutorials.map(t => t.category))]

export default function TutorialsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null)
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0)

  const filteredTutorials = selectedCategory
    ? tutorials.filter(t => t.category === selectedCategory)
    : tutorials

  const handleTutorialClick = (tutorial: Tutorial) => {
    setSelectedTutorial(tutorial)
    setCurrentSectionIndex(0)
  }

  const handleBack = () => {
    setSelectedTutorial(null)
    setCurrentSectionIndex(0)
  }

  const handleNextSection = () => {
    if (selectedTutorial && currentSectionIndex < selectedTutorial.content.length - 1) {
      setCurrentSectionIndex(prev => prev + 1)
    }
  }

  const handlePrevSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(prev => prev - 1)
    }
  }

  if (selectedTutorial) {
    const section = selectedTutorial.content[currentSectionIndex]
    const progress = ((currentSectionIndex + 1) / selectedTutorial.content.length) * 100

    return (
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
        >
          <span>←</span>
          <span>Torna ai tutorial</span>
        </button>

        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-zinc-700">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-4xl">{selectedTutorial.icon}</span>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedTutorial.title}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {selectedTutorial.description}
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-2 bg-gray-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {currentSectionIndex + 1} / {selectedTutorial.content.length}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {section.title}
            </h2>

            <div className="prose prose-gray dark:prose-invert max-w-none">
              {section.content.split('\n\n').map((paragraph, i) => (
                <p key={i} className="text-gray-700 dark:text-gray-300 mb-4 whitespace-pre-line">
                  {paragraph}
                </p>
              ))}
            </div>

            {section.tips && section.tips.length > 0 && (
              <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-3 flex items-center gap-2">
                  <span>💡</span>
                  Suggerimenti Pratici
                </h4>
                <ul className="space-y-2">
                  {section.tips.map((tip, i) => (
                    <li key={i} className="text-sm text-blue-800 dark:text-blue-300 flex items-start gap-2">
                      <span className="text-blue-500">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="p-6 border-t border-gray-200 dark:border-zinc-700 flex justify-between">
            <button
              onClick={handlePrevSection}
              disabled={currentSectionIndex === 0}
              className="px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Precedente
            </button>

            {currentSectionIndex < selectedTutorial.content.length - 1 ? (
              <button
                onClick={handleNextSection}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Successivo →
              </button>
            ) : (
              <button
                onClick={handleBack}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                ✓ Completato
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Centro Formazione
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Guide pratiche per utilizzare al meglio GeniusHR
            </p>
          </div>
          <PageInfoTooltip
            title="Centro Formazione"
            description="Qui trovi tutorial interattivi per imparare a utilizzare tutte le funzionalità di GeniusHR. Ogni guida include esempi pratici e suggerimenti operativi."
            tips={[
              'Inizia dai tutorial base se sei un nuovo utente',
              'Consulta i tutorial specifici quando hai dubbi',
              'I suggerimenti pratici ti aiutano ad evitare errori comuni'
            ]}
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedCategory === null
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700'
          }`}
        >
          Tutti
        </button>
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === category
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 border border-gray-200 dark:border-zinc-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Tutorial Disponibili</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{tutorials.length}</p>
        </div>
        <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Categorie</p>
          <p className="text-3xl font-bold text-blue-600">{categories.length}</p>
        </div>
        <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 border border-green-200 dark:border-green-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Tempo Totale</p>
          <p className="text-3xl font-bold text-green-600">
            {tutorials.reduce((acc, t) => acc + parseInt(t.duration), 0)} min
          </p>
        </div>
        <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Sezioni</p>
          <p className="text-3xl font-bold text-purple-600">
            {tutorials.reduce((acc, t) => acc + t.content.length, 0)}
          </p>
        </div>
      </div>

      {/* Tutorials Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTutorials.map(tutorial => (
          <button
            key={tutorial.id}
            onClick={() => handleTutorialClick(tutorial)}
            className="bg-white dark:bg-zinc-800 rounded-xl p-5 border border-gray-200 dark:border-zinc-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors text-left group"
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-3xl">{tutorial.icon}</span>
              <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-gray-400 rounded">
                {tutorial.duration}
              </span>
            </div>

            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {tutorial.title}
            </h3>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {tutorial.description}
            </p>

            <div className="flex items-center justify-between">
              <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                {tutorial.category}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {tutorial.content.length} sezioni
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Help Section */}
      <div className="mt-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl">
            🤖
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">Hai bisogno di aiuto personalizzato?</h3>
            <p className="text-blue-100 text-sm">
              L'assistente AI può rispondere a domande specifiche sulla gestione HR
            </p>
          </div>
          <a
            href="/ai-assistant"
            className="px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
          >
            Chiedi all'AI
          </a>
        </div>
      </div>
    </div>
  )
}
