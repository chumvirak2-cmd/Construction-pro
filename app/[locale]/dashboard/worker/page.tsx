'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authDb, attendanceDb } from '../../../lib/db'
import Link from 'next/link'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface AttendanceRecord {
  id: string
  workerId: string
  date: string
  checkIn: string | null
  checkOut: string | null
  status: 'present' | 'absent' | 'late'
}

export default function WorkerDashboard() {
  const router = useRouter()
  const [user, setUser] = useState(authDb.getCurrentUser())
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isCheckedIn, setIsCheckedIn] = useState(false)
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [notification, setNotification] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      router.push('/')
      return
    }

    if (user.managementLevel !== 'worker') {
      router.push('/dashboard')
      return
    }

    // Load attendance records
    const records = attendanceDb.getByWorker(user.id) as unknown as AttendanceRecord[]
    setAttendanceRecords(records)
    
    // Check current status
    const today = new Date().toISOString().split('T')[0]
    const todayRecord = records.find(r => r.date === today)
    if (todayRecord && todayRecord.checkIn && !todayRecord.checkOut) {
      setIsCheckedIn(true)
    }
  }, [user, router])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
      
      // Check for missing check-in/out
      const now = new Date()
      const hour = now.getHours()
      const minutes = now.getMinutes()
      
      // Check-in reminder at 9:00 AM if not checked in
      if (hour === 9 && minutes === 0 && !isCheckedIn) {
        setNotification('⚠️ You haven\'t checked in yet!')
        setTimeout(() => setNotification(null), 5000)
      }
      
      // Check-out reminder at 5:00 PM if checked in
      if (hour === 17 && minutes === 0 && isCheckedIn) {
        setNotification('⚠️ Don\'t forget to check out!')
        setTimeout(() => setNotification(null), 5000)
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [isCheckedIn])

  if (!user || user.managementLevel !== 'worker') {
    return null
  }

  const handleCheckIn = () => {
    const now = new Date()
    const today = now.toISOString().split('T')[0]
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    
    const existingRecord = attendanceRecords.find(r => r.date === today)
    
    if (existingRecord) {
      attendanceDb.update(existingRecord.id, { checkIn: timeString, status: 'present' })
    } else {
      attendanceDb.create({
        workerId: user.id,
        date: today,
        checkIn: timeString,
        checkOut: null,
        status: 'present'
      } as any)
    }
    
    setIsCheckedIn(true)
    setNotification('✅ Checked in successfully!')
    setTimeout(() => setNotification(null), 3000)
    
    // Reload records
    const records = attendanceDb.getByWorker(user.id) as unknown as AttendanceRecord[]
    setAttendanceRecords(records)
  }

  const handleCheckOut = () => {
    const now = new Date()
    const today = now.toISOString().split('T')[0]
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    
    const existingRecord = attendanceRecords.find(r => r.date === today)
    
    if (existingRecord) {
      attendanceDb.update(existingRecord.id, { checkOut: timeString })
    }
    
    setIsCheckedIn(false)
    setNotification('✅ Checked out successfully!')
    setTimeout(() => setNotification(null), 3000)
    
    // Reload records
    const records = attendanceDb.getByWorker(user.id) as unknown as AttendanceRecord[]
    setAttendanceRecords(records)
  }

  const exportToExcel = () => {
    const data = filteredRecords.map(record => ({
      Date: record.date,
      'Check In': record.checkIn || 'N/A',
      'Check Out': record.checkOut || 'N/A',
      Status: record.status
    }))
    
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Attendance')
    XLSX.writeFile(wb, `attendance_${user.id}_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const exportToPDF = () => {
    const doc = new jsPDF()
    doc.text(`Attendance Record - ${user.fullName}`, 14, 20)
    
    const tableData = filteredRecords.map(record => [
      record.date,
      record.checkIn || 'N/A',
      record.checkOut || 'N/A',
      record.status
    ])
    
    autoTable(doc, {
      head: [['Date', 'Check In', 'Check Out', 'Status']],
      body: tableData,
      startY: 30
    })
    
    doc.save(`attendance_${user.id}_${new Date().toISOString().split('T')[0]}.pdf`)
  }

  const filteredRecords = attendanceRecords.filter(record => 
    record.date.includes(searchTerm) ||
    record.status.includes(searchTerm.toLowerCase()) ||
    (record.checkIn && record.checkIn.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (record.checkOut && record.checkOut.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="min-h-screen flex flex-col p-4 landscape:p-8 bg-gray-50">
      {/* Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg animate-pulse">
          {notification}
        </div>
      )}

      <div className="w-full max-w-6xl mx-auto space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div>
              <h1 className="text-2xl font-bold">Welcome, {user.fullName}</h1>
              <p className="text-green-100">Worker Dashboard</p>
            </div>
            <div className="mt-4 md:mt-0 text-left md:text-right">
              <p className="text-3xl font-mono">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="text-sm text-green-100">
                {currentTime.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
        </div>

        {/* Check In/Out Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={handleCheckIn}
            disabled={isCheckedIn}
            className={`p-8 rounded-xl text-white font-bold text-xl transition-all ${
              isCheckedIn ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 active:scale-95'
            }`}
          >
            CHECK IN
          </button>
          <button
            onClick={handleCheckOut}
            disabled={!isCheckedIn}
            className={`p-8 rounded-xl text-white font-bold text-xl transition-all ${
              !isCheckedIn ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600 active:scale-95'
            }`}
          >
            CHECK OUT
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-blue-500 text-center">
            <p className="text-sm text-gray-500">Total Days</p>
            <p className="text-2xl font-bold text-gray-800">{attendanceRecords.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-green-500 text-center">
            <p className="text-sm text-gray-500">Present</p>
            <p className="text-2xl font-bold text-gray-800">{attendanceRecords.filter(r => r.status === 'present').length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-purple-500 text-center">
            <p className="text-sm text-gray-500">Status</p>
            <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              {isCheckedIn ? 'Checked In' : 'Active'}
            </span>
          </div>
        </div>

        {/* Attendance Records */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-4">
            <h2 className="text-lg font-bold text-gray-800">Attendance Records</h2>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 border rounded-lg"
              />
              <button
                onClick={exportToExcel}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Excel
              </button>
              <button
                onClick={exportToPDF}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                PDF
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4">Date</th>
                  <th className="text-left py-2 px-4">Check In</th>
                  <th className="text-left py-2 px-4">Check Out</th>
                  <th className="text-left py-2 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-4">{record.date}</td>
                    <td className="py-2 px-4">{record.checkIn || '-'}</td>
                    <td className="py-2 px-4">{record.checkOut || '-'}</td>
                    <td className="py-2 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        record.status === 'present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredRecords.length === 0 && (
            <p className="text-center text-gray-500 py-8">No attendance records found</p>
          )}
        </div>
      </div>
    </div>
  )
}
