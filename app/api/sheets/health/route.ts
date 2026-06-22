import { NextResponse } from 'next/server'
import { getSheetsService, SHEET_TABS } from '@/lib/googleSheets'

export async function GET() {
  try {
    const service = await getSheetsService()
    const spreadsheet = await service.sheets.spreadsheets.get({ spreadsheetId: service.spreadsheetId })
    const existingSheets = spreadsheet.data.sheets?.map((sheet: any) => sheet.properties?.title).filter(Boolean) || []

    return NextResponse.json({
      configured: true,
      spreadsheetId: service.spreadsheetId,
      tabs: Object.values(SHEET_TABS),
      existingSheets
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Google Sheets is not configured'
    console.error(message, error)
    return NextResponse.json({ configured: false, error: message }, { status: 503 })
  }
}
