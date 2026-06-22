import { NextRequest, NextResponse } from 'next/server'
import { appendRow, deleteRow, ensureSheetHeaders, generateId, getSheetsService, readAll, resolveCollection, SheetRow, updateRow } from '@/lib/googleSheets'

type RouteContext = {
  params: Promise<{ collection: string }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { collection } = await context.params
    const resolved = resolveCollection(collection)
    const service = await getSheetsService()
    await ensureSheetHeaders(service, resolved.collection)

    const rows = await readAll(service, resolved.tab)
    const id = request.nextUrl.searchParams.get('id')

    if (id) {
      const row = rows.find(item => String(item.id) === id)
      return NextResponse.json(row || null, { status: row ? 200 : 404 })
    }

    return NextResponse.json(rows)
  } catch (error) {
    return sheetErrorResponse(error, 'Failed to read Google Sheets data')
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { collection } = await context.params
    const resolved = resolveCollection(collection)
    const service = await getSheetsService()
    await ensureSheetHeaders(service, resolved.collection)

    const body = await readRequestBody(request)
    const now = new Date().toISOString()
    const row: SheetRow = {
      ...body,
      id: String(body.id || generateId()),
      createdAt: body.createdAt || now,
      updatedAt: body.updatedAt || now
    }

    await appendRow(service, resolved.tab, row)
    return NextResponse.json(row, { status: 201 })
  } catch (error) {
    return sheetErrorResponse(error, 'Failed to create Google Sheets record')
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { collection } = await context.params
    const resolved = resolveCollection(collection)
    const service = await getSheetsService()
    await ensureSheetHeaders(service, resolved.collection)

    const body = await readRequestBody(request)
    const id = String(request.nextUrl.searchParams.get('id') || body.id || '')

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    }

    const updatedRecord = await updateRow(service, resolved.tab, id, {
      ...body,
      id,
      updatedAt: new Date().toISOString()
    })

    if (!updatedRecord) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 })
    }

    const rows = await readAll(service, resolved.tab)
    const updated = rows.find(item => String(item.id) === id)

    return NextResponse.json(updated || { id, ...body })
  } catch (error) {
    return sheetErrorResponse(error, 'Failed to update Google Sheets record')
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { collection } = await context.params
    const resolved = resolveCollection(collection)
    const service = await getSheetsService()
    await ensureSheetHeaders(service, resolved.collection)

    const body = await readRequestBody(request)
    const id = String(request.nextUrl.searchParams.get('id') || body.id || '')

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    }

    const deleted = await deleteRow(service, resolved.tab, id)

    if (!deleted) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 })
    }

    return NextResponse.json({ deleted: id })
  } catch (error) {
    return sheetErrorResponse(error, 'Failed to delete Google Sheets record')
  }
}

async function readRequestBody(request: NextRequest): Promise<SheetRow> {
  const contentType = request.headers.get('content-type') || ''

  if (contentType.includes('application/json')) {
    return await request.json()
  }

  const formData = await request.formData()
  return Object.fromEntries(formData.entries()) as SheetRow
}

function sheetErrorResponse(error: unknown, fallbackMessage: string) {
  const message = error instanceof Error ? error.message : fallbackMessage
  console.error(message, error)
  return NextResponse.json({ error: message }, { status: 500 })
}
