// src/components/brain/BrainMessage.tsx
interface BrainMessageProps {
  role: 'user' | 'assistant'
  content: string
  timestamp?: Date
}

function renderMarkdown(text: string): string {
  return text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/```[\w]*\n([\s\S]*?)```/g, '<pre class="bg-slate-800 text-green-300 rounded-lg p-3 my-2 text-xs overflow-x-auto"><code>$1</code></pre>')
    .replace(/`([^`]+)`/g, '<code class="bg-slate-200 dark:bg-slate-700 px-1 rounded text-xs font-mono">$1</code>')
    .replace(/^### (.+)$/gm, '<h4 class="font-bold text-sm mt-3 mb-1 text-slate-800 dark:text-slate-200">$1</h4>')
    .replace(/^## (.+)$/gm, '<h3 class="font-bold text-base mt-3 mb-1 text-slate-800 dark:text-slate-200">$1</h3>')
    .replace(/^# (.+)$/gm, '<h2 class="font-bold text-lg mt-3 mb-1 text-slate-800 dark:text-slate-200">$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc text-sm">$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal text-sm">$1</li>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>')
}

export default function BrainMessage({ role, content, timestamp }: BrainMessageProps) {
  const isUser = role === 'user'

  return (
    <div className={`flex gap-3 mb-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold ${
        isUser
          ? 'bg-violet-500'
          : 'bg-gradient-to-br from-indigo-500 to-violet-600'
      }`}>
        {isUser ? '👤' : '🧠'}
      </div>

      <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
        isUser
          ? 'bg-violet-600 text-white rounded-tr-sm'
          : 'bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-slate-200 rounded-tl-sm'
      }`}>
        {isUser ? (
          <p className="whitespace-pre-wrap">{content}</p>
        ) : (
          <div
            className="brain-message prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
          />
        )}
        {timestamp && (
          <p className={`text-xs mt-2 ${isUser ? 'text-violet-200' : 'text-slate-400'}`}>
            {timestamp.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>
    </div>
  )
}
