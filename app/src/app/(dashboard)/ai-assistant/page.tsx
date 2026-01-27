'use client'

import { useState, useRef, useEffect } from 'react'
import PageInfoTooltip from '@/components/PageInfoTooltip'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface QuickAction {
  label: string
  prompt: string
  icon: string
}

const quickActions: QuickAction[] = [
  {
    label: 'Genera lettera di assunzione',
    prompt: 'Genera una lettera di assunzione per un nuovo dipendente',
    icon: '📄',
  },
  {
    label: 'Calcola ferie residue',
    prompt: 'Come calcolo le ferie residue di un dipendente?',
    icon: '🏖️',
  },
  {
    label: 'CCNL Studi Professionali',
    prompt: 'Quali sono le principali norme del CCNL Studi Professionali?',
    icon: '📚',
  },
  {
    label: 'Procedura disciplinare',
    prompt: 'Quali sono i passaggi per avviare una procedura disciplinare?',
    icon: '⚖️',
  },
  {
    label: 'Sicurezza 81/08',
    prompt: 'Quali sono gli obblighi del datore di lavoro secondo il D.Lgs 81/08?',
    icon: '🛡️',
  },
  {
    label: 'Template email sollecito',
    prompt: 'Genera un template email per sollecitare la firma di un documento',
    icon: '✉️',
  },
]

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        'Ciao! Sono il tuo assistente HR powered by AI. Posso aiutarti con:\n\n- Generazione documenti HR\n- Domande su normative e CCNL\n- Procedure disciplinari\n- Calcoli ferie e permessi\n- Best practice HR\n\nCome posso aiutarti oggi?',
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend(prompt?: string) {
    const messageText = prompt || input.trim()
    if (!messageText || loading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          context: 'hr_assistant',
        }),
      })

      let assistantContent: string

      if (res.ok) {
        const data = await res.json()
        assistantContent = data.response || data.message || 'Risposta ricevuta'
      } else {
        // Fallback response for demo
        assistantContent = generateFallbackResponse(messageText)
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      // Fallback for demo purposes
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateFallbackResponse(messageText),
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
    } finally {
      setLoading(false)
    }
  }

  function generateFallbackResponse(query: string): string {
    const lowerQuery = query.toLowerCase()

    if (lowerQuery.includes('assunzione') || lowerQuery.includes('lettera')) {
      return `**Template Lettera di Assunzione**

Gentile [Nome Cognome],

con la presente Le comunichiamo la Sua assunzione presso [Nome Studio] con decorrenza dal [Data].

**Dettagli del contratto:**
- Qualifica: [Qualifica]
- Livello: [Livello CCNL]
- CCNL applicato: Studi Professionali
- Orario: [Full-time/Part-time] - [N] ore settimanali
- Retribuzione lorda mensile: € [Importo]
- Sede di lavoro: [Indirizzo]
- Periodo di prova: [N] giorni

La preghiamo di presentarsi il primo giorno di lavoro munito/a di:
- Documento d'identità
- Codice fiscale
- Coordinate bancarie per accredito stipendio

Cordiali saluti,
[Firma Datore di Lavoro]

---
*Vuoi che personalizzi questo template con i dati di un dipendente specifico?*`
    }

    if (lowerQuery.includes('ferie') || lowerQuery.includes('residue')) {
      return `**Calcolo Ferie Residue**

La formula per calcolare le ferie residue è:

\`\`\`
Ferie Residue = Ferie Maturate - Ferie Godute - Ferie Pianificate
\`\`\`

**Maturazione standard CCNL Studi Professionali:**
- 26 giorni lavorativi/anno (per anzianità > 10 anni)
- 22 giorni lavorativi/anno (per anzianità < 10 anni)

**Maturazione mensile:**
- 26 ÷ 12 = 2,17 giorni/mese
- 22 ÷ 12 = 1,83 giorni/mese

**Esempio pratico:**
Un dipendente assunto a Gennaio con diritto a 26 giorni, a fine Giugno avrà maturato:
- 2,17 × 6 = 13 giorni di ferie

*Vuoi che calcoli le ferie residue di un dipendente specifico?*`
    }

    if (lowerQuery.includes('ccnl') || lowerQuery.includes('contratto')) {
      return `**CCNL Studi Professionali - Punti Chiave**

**Orario di lavoro:**
- 40 ore settimanali (full-time)
- Distribuzione su 5 o 6 giorni

**Ferie e permessi:**
- 26 giorni di ferie/anno (anzianità > 10 anni)
- 22 giorni di ferie/anno (anzianità < 10 anni)
- 32 ore di permessi retribuiti (ROL)
- 8 ore per ex festività

**Livelli e inquadramento:**
- Da Livello 1 (quadri) a Livello 5
- Minimi tabellari aggiornati annualmente

**Periodo di prova:**
- Quadri e 1° livello: 180 giorni
- 2° e 3° livello: 120 giorni
- 4° e 5° livello: 60 giorni

**Preavviso dimissioni:**
- Quadri: 90 giorni
- 1° livello: 60 giorni
- Altri livelli: 30 giorni

*Hai domande specifiche su un articolo del CCNL?*`
    }

    if (lowerQuery.includes('disciplinare') || lowerQuery.includes('procedura')) {
      return `**Procedura Disciplinare - Step by Step**

**1. Contestazione scritta**
Inviare al dipendente una lettera con:
- Descrizione dettagliata del fatto
- Data, ora e luogo
- Riferimento alla norma violata
- Invito a presentare giustificazioni entro 5 giorni

**2. Attesa giustificazioni**
- Termine minimo: 5 giorni lavorativi
- Il dipendente può chiedere di essere ascoltato

**3. Valutazione**
- Esaminare le giustificazioni
- Decidere se procedere o archiviare

**4. Applicazione sanzione**
Gradazione delle sanzioni:
1. Richiamo verbale
2. Ammonizione scritta
3. Multa (max 4 ore retribuzione)
4. Sospensione (max 10 giorni)
5. Licenziamento disciplinare

**Importante:**
- Rispettare sempre il principio di proporzionalità
- Conservare tutta la documentazione
- Rispettare i termini temporali

*Vuoi che generi un template di contestazione disciplinare?*`
    }

    if (lowerQuery.includes('81/08') || lowerQuery.includes('sicurezza')) {
      return `**D.Lgs 81/08 - Obblighi Datore di Lavoro**

**Obblighi non delegabili (Art. 17):**
1. Valutazione dei rischi (DVR)
2. Nomina RSPP

**Obblighi delegabili (Art. 18):**
- Nominare il medico competente
- Designare gli addetti emergenze
- Fornire DPI adeguati
- Garantire formazione ai lavoratori
- Aggiornare le misure di prevenzione

**Formazione obbligatoria:**
| Corso | Durata | Aggiornamento |
|-------|--------|---------------|
| Generale | 4 ore | - |
| Specifica (rischio basso) | 4 ore | 6 ore/5 anni |
| Antincendio (basso) | 4 ore | 2 ore/5 anni |
| Primo soccorso | 12 ore | 4 ore/3 anni |

**Sanzioni:**
- Mancata valutazione rischi: arresto 3-6 mesi o ammenda €2.740-€7.014
- Mancata formazione: arresto 2-4 mesi o ammenda €1.315-€5.699

*Hai bisogno di verificare le scadenze formative dei tuoi dipendenti?*`
    }

    if (lowerQuery.includes('sollecito') || lowerQuery.includes('email') || lowerQuery.includes('firma')) {
      return `**Template Email Sollecito Firma**

---

**Oggetto:** Sollecito firma documento - [Nome Documento]

Gentile [Nome Dipendente],

Le ricordo che il documento **"[Nome Documento]"** è in attesa della Sua firma digitale.

**Dettagli:**
- Documento: [Nome Documento]
- Inviato il: [Data Invio]
- Scadenza: [Data Scadenza]

Per procedere alla firma, acceda al suo portale dipendente GeniusHR e segua le istruzioni.

**Link diretto:** [URL firma]

La preghiamo di completare la firma entro la data indicata per garantire la corretta gestione amministrativa.

Per qualsiasi difficoltà, non esiti a contattarci.

Cordiali saluti,
Ufficio HR

---

*Posso personalizzare questo template con i dati di un documento specifico?*`
    }

    // Default response
    return `Grazie per la tua domanda! Sto elaborando una risposta personalizzata.

Per fornirti informazioni più accurate, potresti specificare:
- Il contesto specifico (assunzione, licenziamento, ferie, ecc.)
- Il CCNL di riferimento
- Eventuali casi particolari

Nel frattempo, ecco alcune risorse utili:
- **Normativa**: D.Lgs 81/08 (Sicurezza), GDPR (Privacy)
- **CCNL**: Studi Professionali, Commercio, Metalmeccanico
- **Strumenti**: Generatore documenti, Calcolatore ferie

*Come posso aiutarti nello specifico?*`
  }

  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col">
      <div className="p-6 border-b border-gray-200 dark:border-zinc-700">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Assistente AI HR
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Powered by AI - Supporto per documenti, normative e procedure HR
            </p>
          </div>
          <PageInfoTooltip
            title="Assistente AI"
            description="Chiedi all'intelligenza artificiale di aiutarti con documenti HR, calcoli, normative CCNL e procedure. Genera lettere, template e ottieni risposte immediate."
            tips={[
              'Usa le azioni rapide per le richieste più comuni',
              'L\'AI può generare template personalizzati per la tua azienda',
              'Le risposte non sostituiscono la consulenza legale professionale'
            ]}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-b border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900/50">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          Azioni rapide:
        </p>
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => handleSend(action.prompt)}
              disabled={loading}
              className="px-3 py-1.5 text-sm bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <span>{action.icon}</span>
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white'
              }`}
            >
              <div className="whitespace-pre-wrap text-sm">{message.content}</div>
              <div
                className={`text-xs mt-2 ${
                  message.role === 'user'
                    ? 'text-blue-200'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {message.timestamp.toLocaleTimeString('it-IT', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-zinc-800 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: '0.2s' }}
                />
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: '0.4s' }}
                />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800">
        <div className="flex gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Scrivi la tua domanda HR..."
            rows={1}
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-zinc-600 rounded-xl bg-white dark:bg-zinc-700 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Invia
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
          Le risposte sono generate da AI e non sostituiscono la consulenza legale
          professionale
        </p>
      </div>
    </div>
  )
}
