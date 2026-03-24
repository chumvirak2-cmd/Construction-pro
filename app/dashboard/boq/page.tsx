'use client'

import { useState } from 'react'
import * as XLSX from 'xlsx'

export default function BOQ() {
  const [system, setSystem] = useState('')
  const [inputs, setInputs] = useState<any>({})
  const [result, setResult] = useState<any>(null)
  const [uploadedData, setUploadedData] = useState<any>(null)
  const [uploadedHeaders, setUploadedHeaders] = useState<string[]>([])
  const [sheetRows, setSheetRows] = useState<any[][]>([])
  const [headerRowIndex, setHeaderRowIndex] = useState<number | null>(null)
  const [detectedHeaderRow, setDetectedHeaderRow] = useState<number | null>(null)
  const [mappedColumns, setMappedColumns] = useState<{ qty?: string; unitPrice?: string; description?: string }>({})

  const parseNumber = (value: any) => {
    if (value === null || value === undefined) return undefined
    if (typeof value === 'number') return value

    const str = String(value).trim()
    if (!str) return undefined

    // Remove common non-numeric characters (currency symbols, commas, spaces)
    const normalized = str.replace(/[,$\s]/g, '').replace(/[^0-9.\-]/g, '')
    const n = Number(normalized)
    return Number.isNaN(n) ? undefined : n
  }

  const buildFromHeaderRow = (rowIndex: number | null, rowArray: any[][]) => {
    if (rowIndex === null || rowIndex < 0 || rowIndex >= rowArray.length) {
      setUploadedData(null)
      setUploadedHeaders([])
      setMappedColumns({})
      return
    }

    const normalize = (value: any) =>
      String(value ?? '')
        .trim()
        .replace(/\s+/g, ' ')

    const headers = (rowArray[rowIndex] as any[]).map((h) => normalize(h))
    const dataRows = rowArray.slice(rowIndex + 1)

    const jsonData = dataRows
      .filter((row) => row.some((cell) => cell !== '' && cell !== null && cell !== undefined))
      .map((row) => {
        const obj: any = {}
        headers.forEach((header, idx) => {
          obj[header] = row[idx]
        })
        return obj
      })

    setUploadedData(jsonData)
    setUploadedHeaders(headers)

    // Auto-detect common columns
    const qtyCol = headers.find((h) => /(qty|quantity|q'ty)/i.test(h))
    const unitPriceCol = headers.find((h) => /(unit rate|unit price|rate|price)/i.test(h))
    const descCol = headers.find((h) => /(description|desc|item)/i.test(h))
    setMappedColumns({ qty: qtyCol, unitPrice: unitPriceCol, description: descCol })
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (evt) => {
        try {
          const data = evt.target?.result
          const workbook = XLSX.read(data, { type: 'array' })
          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]

          // Convert sheet to a row array so we can find the real header row (the row containing Item No / Description etc.)
          const rowArray = XLSX.utils.sheet_to_json<string[]>(worksheet, { header: 1, defval: '' })
          setSheetRows(rowArray)

          const normalize = (value: any) =>
            String(value ?? '')
              .trim()
              .replace(/\s+/g, ' ')

          const headerKeywords = [
            /item\s*no/i,
            /description/i,
            /desc/i,
            /qty|quantity/i,
            /unit\s*rate|unit\s*price|rate|price/i,
          ]

          // Prefer a row that explicitly contains an "Item No" header (common in BOQ templates)
          const itemNoRowIdx = rowArray.findIndex((row) =>
            (row || []).some((cell) => /item\s*no\.?/i.test(String(cell)))
          )

          const headerScores = rowArray.map((row) => {
            const cells = (row || []).map(normalize)
            const score = headerKeywords.reduce((acc, regex) => {
              return acc + (cells.some((c) => regex.test(c)) ? 1 : 0)
            }, 0)
            return score
          })

          const bestHeaderIdx = itemNoRowIdx >= 0 ? itemNoRowIdx : headerScores.indexOf(Math.max(...headerScores))
          const hasHeaders = bestHeaderIdx >= 0 && headerScores[bestHeaderIdx] > 0

          setDetectedHeaderRow(hasHeaders ? bestHeaderIdx : -1)
          setHeaderRowIndex(hasHeaders ? bestHeaderIdx : null)

          buildFromHeaderRow(hasHeaders ? bestHeaderIdx : null, rowArray)

          console.log('Uploaded data:', rowArray)
        } catch (err) {
          console.error('XLSX parsing error:', err)
          alert('Could not parse the uploaded file. Please ensure it is a valid XLSX file.')
        }
      }
      reader.readAsArrayBuffer(file)
    }
  }

  const downloadTemplate = () => {
    const headers = ['No', 'Description', 'Unit Rate in USD', 'UoM', 'Remarks']
    const exampleRows = [
      [1, 'To supply and install 10m LC/LC Fiber Patch Cord 50/125 OM2', 18.0, 'Duplex, MM', ''],
      [2, 'To supply and install 15m LC/LC Fiber Patch Cord 50/125 OM2', 22.5, 'Duplex, MM', ''],
      [3, 'To supply and install 20m LC/LC Fiber Patch Cord 50/125 OM4', 25.5, 'Duplex, MM', ''],
      [4, 'To supply and install 30m LC/LC Fiber Patch Cord 50/125 OM4', 28.5, 'Duplex, MM', ''],
      [5, 'Grand total', 0, '', ''],
    ]

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...exampleRows])
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'BOQ Template')
    XLSX.writeFile(workbook, 'boq-template.xlsx')
  }

  const handleCalculate = () => {
    if (!uploadedData || !mappedColumns.unitPrice) {
      alert('Please upload an Excel file and ensure the Unit Price column is mapped.')
      return
    }

    const filteredRows = (uploadedData as any[]).filter((row) => {
      // Remove any summary/total rows that are already in the file (e.g., "Grand total")
      const desc = mappedColumns.description ? String(row[mappedColumns.description] ?? '').trim() : ''
      if (/grand\s*total/i.test(desc)) return false

      // Skip rows that have no meaningful pricing data
      const rawUnitPrice = row[mappedColumns.unitPrice!]
      const parsedUnitPrice = parseNumber(rawUnitPrice)
      if (parsedUnitPrice === undefined) return false

      // Also drop fully-empty rows to avoid skewing totals
      const hasData = Object.values(row).some((v) => v !== null && v !== undefined && String(v).trim() !== '')
      return hasData
    })

    const itemsWithTotals = filteredRows.map((row) => {
      const qty = mappedColumns.qty ? parseNumber(row[mappedColumns.qty]) ?? 0 : 1
      const unitPrice = parseNumber(row[mappedColumns.unitPrice!]) ?? 0
      const total = qty * unitPrice
      return { ...row, calculatedQty: qty, calculatedUnitPrice: unitPrice, calculatedTotal: total }
    })

    const grandTotal = itemsWithTotals.reduce((sum, item) => sum + item.calculatedTotal, 0)

    setResult({ items: itemsWithTotals, grandTotal })
  }

  const downloadExcel = () => {
    if (!result || !result.items) return

    const exportData = result.items.map((item: any) => ({
      'Description': item[mappedColumns.description!] || 'N/A',
      'Quantity': item.calculatedQty || 0,
      'Unit Price': item.calculatedUnitPrice || 0,
      'Total Cost': item.calculatedTotal || 0
    }))

    // Add grand total row
    exportData.push({
      'Description': 'GRAND TOTAL',
      'Quantity': '',
      'Unit Price': '',
      'Total Cost': result.grandTotal || 0
    })

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'BOQ Result')

    // Set column widths
    ws['!cols'] = [
      { wch: 50 }, // Description
      { wch: 12 }, // Quantity
      { wch: 15 }, // Unit Price
      { wch: 15 }  // Total Cost
    ]

    XLSX.writeFile(wb, `boq-result-${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Calculate BOQ</h1>
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex-1">
          <label className="block text-sm font-medium">Upload XLSX File</label>
          <input
            type="file"
            accept=".xlsx"
            onChange={handleFileUpload}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          />
        </div>
        <button
          type="button"
          onClick={downloadTemplate}
          className="mt-2 md:mt-0 inline-flex items-center justify-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
        >
          Download XLSX Template
        </button>
      </div>

      {uploadedData && (
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Uploaded file detected</h2>
          <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-500">Description column</p>
              <p className="font-medium">{mappedColumns.description || 'Not found'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Qty column</p>
              <p className="font-medium">{mappedColumns.qty || 'Not found'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Unit Price column</p>
              <p className="font-medium">{mappedColumns.unitPrice || 'Not found'}</p>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            The system automatically detects column headers, so you only need to upload and calculate.
          </p>
        </div>
      )}

      {uploadedData && (
        <>
          <button
            onClick={handleCalculate}
            disabled={!mappedColumns.unitPrice}
            className={`mt-4 px-4 py-2 rounded text-white ${
              mappedColumns.unitPrice ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            Calculate BOQ
          </button>
          {!mappedColumns.unitPrice && (
            <p className="text-sm text-red-500 mt-2">
              Please select the correct Unit Price column above before calculating.
            </p>
          )}
        </>
      )}
      {result && result.items && (
        <div className="mt-4">
          <h2 className="text-xl font-bold">BOQ Calculation Result</h2>
          <div className="mt-2 text-sm text-gray-600">
            Total cost (Qty × Unit Price) is shown per line, and the grand total is calculated below.
          </div>
          <table className="min-w-full border border-gray-300 mt-4">
            <thead>
              <tr className="bg-yellow-200">
                <th className="border px-4 py-2 text-left text-sm font-semibold">Description</th>
                {mappedColumns.qty && (
                  <th className="border px-4 py-2 text-right text-sm font-semibold">Qty</th>
                )}
                <th className="border px-4 py-2 text-right text-sm font-semibold">Unit Price</th>
                <th className="border px-4 py-2 text-right text-sm font-semibold">Total Cost</th>
              </tr>
            </thead>
            <tbody>
              {result.items.map((item: any, index: number) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border px-4 py-2 text-sm">{item[mappedColumns.description!] || 'N/A'}</td>
                  {mappedColumns.qty && (
                    <td className="border px-4 py-2 text-right text-sm">{item.calculatedQty?.toFixed ? item.calculatedQty.toFixed(2) : item.calculatedQty ?? 0}</td>
                  )}
                  <td className="border px-4 py-2 text-right text-sm">{item.calculatedUnitPrice?.toFixed ? item.calculatedUnitPrice.toFixed(2) : item.calculatedUnitPrice ?? 0}</td>
                  <td className="border px-4 py-2 text-right text-sm">{(item.calculatedTotal || 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-100">
                <td colSpan={mappedColumns.qty ? 3 : 2} className="border px-4 py-2 text-right font-bold">Grand Total</td>
                <td className="border px-4 py-2 text-right font-bold">{(result.grandTotal || 0).toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
          <div className="mt-4">
            <button onClick={downloadExcel} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              📥 Download Excel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}