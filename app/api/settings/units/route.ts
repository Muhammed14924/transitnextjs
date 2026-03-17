import { getSessionUser, unauthorized, forbidden, serverError } from '@/app/lib/api-helper'
import { hasPermission } from '@/app/lib/auth'
import { prisma } from '@/app/lib/db'

export async function GET(_req: Request) {
  const user = await getSessionUser()
  if (!user) return unauthorized()
  if (!await hasPermission(user, 'VIEW_UNIT')) return forbidden()

  try {
    const data = await prisma.units.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    })
    return Response.json(data)
  } catch (_e) {
    return serverError()
  }
}

export async function POST(req: Request) {
  const user = await getSessionUser()
  if (!user) return unauthorized()
  if (!await hasPermission(user, 'CREATE_UNIT')) return forbidden()

  try {
    const body = await req.json()
    const record = await prisma.units.create({ data: body })
    return Response.json(record, { status: 201 })
  } catch (_e) {
    return serverError()
  }
}

export async function PUT(req: Request) {
  const user = await getSessionUser()
  if (!user) return unauthorized()
  if (!await hasPermission(user, 'EDIT_UNIT')) return forbidden()

  try {
    const body = await req.json()
    const record = await prisma.units.update({ where: { id: body.id }, data: body })
    return Response.json(record)
  } catch (_e) {
    return serverError()
  }
}

export async function DELETE(req: Request) {
  const user = await getSessionUser()
  if (!user) return unauthorized()
  if (!await hasPermission(user, 'DELETE_UNIT')) return forbidden()

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return Response.json({ error: 'ID is required' }, { status: 400 })
    await prisma.units.delete({ where: { id: parseInt(id) } })
    return Response.json({ success: true })
  } catch (_e) {
    return serverError()
  }
}
