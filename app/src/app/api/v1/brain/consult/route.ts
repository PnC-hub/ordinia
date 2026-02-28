// app/api/v1/brain/consult/route.ts
// Ordinia inter-agent consult stub — AI Brain not yet integrated
// Uses rule-based response, redirects complex queries to Imperum HR tools

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-inter-agent-secret')
  if (!secret || secret !== process.env.INTER_AGENT_SECRET) {
    return NextResponse.json({ error: 'Inter-agent secret non valido' }, { status: 401 })
  }

  let body: { question?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Body JSON non valido' }, { status: 400 })
  }

  if (!body.question?.trim()) {
    return NextResponse.json({ error: 'Question richiesta' }, { status: 400 })
  }

  return NextResponse.json({
    answer: `Dati HR strutturati disponibili via Ordinia. AI Brain non ancora integrato in questo sistema. Per dati HR dettagliati usa i tools get_hr_overview / get_employee_list / get_payroll_history disponibili in Imperum.`,
    confidence: 0.3,
    caveats: ['Ordinia AI Brain non ancora disponibile — usando data tools diretti'],
    domain: 'hr',
  })
}
