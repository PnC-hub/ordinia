import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employeeId')
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()))

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { employee: true, tenant: true },
    })

    if (!user?.employee?.id && !user?.tenantId) {
      return NextResponse.json({ error: 'Accesso non autorizzato' }, { status: 403 })
    }

    // Determine which employee to get balance for
    let targetEmployeeId = employeeId

    // If employee, can only see their own
    if (user.employee && !user.tenantId) {
      targetEmployeeId = user.employee.id
    }

    if (!targetEmployeeId) {
      return NextResponse.json({ error: 'ID dipendente richiesto' }, { status: 400 })
    }

    // Get balance for the year
    let balance = await prisma.leaveBalance.findUnique({
      where: {
        employeeId_year: {
          employeeId: targetEmployeeId,
          year,
        },
      },
    })

    // If no balance exists, create one with defaults
    if (!balance) {
      const employee = await prisma.employee.findUnique({
        where: { id: targetEmployeeId },
      })

      if (!employee) {
        return NextResponse.json({ error: 'Dipendente non trovato' }, { status: 404 })
      }

      balance = await prisma.leaveBalance.create({
        data: {
          employeeId: targetEmployeeId,
          tenantId: employee.tenantId,
          year,
          vacationTotal: 26,
          vacationUsed: 0,
          vacationPending: 0,
          vacationCarryOver: 0,
          rolTotal: 56, // 56 ore = 7 giorni ROL standard
          rolUsed: 0,
          rolPending: 0,
          exFestTotal: 32, // 32 ore = 4 giorni ex festività
          exFestUsed: 0,
          exFestPending: 0,
          sickDaysUsed: 0,
          law104Total: 0,
          law104Used: 0,
        },
      })
    }

    // Format response
    const response = {
      year: balance.year,
      vacation: {
        total: Number(balance.vacationTotal),
        used: Number(balance.vacationUsed),
        pending: Number(balance.vacationPending),
        carryOver: Number(balance.vacationCarryOver),
        available: Number(balance.vacationTotal) + Number(balance.vacationCarryOver) - Number(balance.vacationUsed) - Number(balance.vacationPending),
      },
      rol: {
        total: Number(balance.rolTotal),
        used: Number(balance.rolUsed),
        pending: Number(balance.rolPending),
        available: Number(balance.rolTotal) - Number(balance.rolUsed) - Number(balance.rolPending),
      },
      exFest: {
        total: Number(balance.exFestTotal),
        used: Number(balance.exFestUsed),
        pending: Number(balance.exFestPending),
        available: Number(balance.exFestTotal) - Number(balance.exFestUsed) - Number(balance.exFestPending),
      },
      sick: {
        daysUsed: balance.sickDaysUsed,
      },
      law104: {
        total: Number(balance.law104Total),
        used: Number(balance.law104Used),
        available: Number(balance.law104Total) - Number(balance.law104Used),
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching leave balance:', error)
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}

// Update leave balance (admin only)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    // Get user and verify admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { tenant: true },
    })

    if (!user?.tenantId) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })
    }

    const body = await request.json()
    const { employeeId, year, vacation, rol, exFest, law104 } = body

    if (!employeeId || !year) {
      return NextResponse.json(
        { error: 'employeeId e year sono obbligatori' },
        { status: 400 }
      )
    }

    // Verify employee belongs to tenant
    const employee = await prisma.employee.findFirst({
      where: {
        id: employeeId,
        tenantId: user.tenantId,
      },
    })

    if (!employee) {
      return NextResponse.json({ error: 'Dipendente non trovato' }, { status: 404 })
    }

    // Build update data
    const updateData: Record<string, number> = {}

    if (vacation) {
      if (vacation.total !== undefined) updateData.vacationTotal = vacation.total
      if (vacation.carryOver !== undefined) updateData.vacationCarryOver = vacation.carryOver
    }

    if (rol) {
      if (rol.total !== undefined) updateData.rolTotal = rol.total
    }

    if (exFest) {
      if (exFest.total !== undefined) updateData.exFestTotal = exFest.total
    }

    if (law104) {
      if (law104.total !== undefined) updateData.law104Total = law104.total
    }

    // Upsert balance
    const balance = await prisma.leaveBalance.upsert({
      where: {
        employeeId_year: {
          employeeId,
          year,
        },
      },
      update: updateData,
      create: {
        employeeId,
        tenantId: user.tenantId,
        year,
        vacationTotal: vacation?.total ?? 26,
        vacationCarryOver: vacation?.carryOver ?? 0,
        rolTotal: rol?.total ?? 56,
        exFestTotal: exFest?.total ?? 32,
        law104Total: law104?.total ?? 0,
      },
    })

    return NextResponse.json({
      year: balance.year,
      vacation: {
        total: Number(balance.vacationTotal),
        carryOver: Number(balance.vacationCarryOver),
      },
      rol: {
        total: Number(balance.rolTotal),
      },
      exFest: {
        total: Number(balance.exFestTotal),
      },
      law104: {
        total: Number(balance.law104Total),
      },
    })
  } catch (error) {
    console.error('Error updating leave balance:', error)
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}
