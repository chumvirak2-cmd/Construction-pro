'use client'

import { useState, useEffect } from 'react'
import { Geolocation } from '@capacitor/geolocation'

interface WorkerLocationPageProps {
  phone?: string
}

export default function WorkerLocationPage({ phone = '' }: WorkerLocationPageProps) {
  const [workerPhone, setWorkerPhone] = useState(phone)
  const [location, setLocation] = useState<{ lat: number; lng: number; accuracy: number } | null>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [autoTrack, setAutoTrack] = useState(false)

  useEffect(() => {
    const savedPhone = localStorage.getItem('cp_worker_phone')
    if (savedPhone && !phone) {
      setWorkerPhone(savedPhone)
    }
  }, [phone])

  const getLocation = async () => {
    try {
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true
      })
      setLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy
      })
      return position.coords
    } catch (err) {
      setStatus('error')
      setMessage('Failed to get location. Please enable location access.')
      return null
    }
  }

  const sendLocation = async () => {
    if (!workerPhone.trim()) {
      setStatus('error')
      setMessage('Please enter your phone number')
      return
    }

    setStatus('loading')
    setMessage('')

    localStorage.setItem('cp_worker_phone', workerPhone)

    const coords = await getLocation()
    if (!coords) return

    try {
      const response = await fetch('/api/worker-location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: workerPhone,
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracy: coords.accuracy
        })
      })

      const data = await response.json()

      if (data.success) {
        setStatus('success')
        if (data.isOutsideSite) {
          setMessage(`⚠️ Alert: You are ${data.distanceFromSite}m outside the site boundary (${data.siteRadius}m). Please return to the site.`)
        } else {
          setMessage(`✓ Location sent successfully. You are within the site.`)
        }
      } else {
        setStatus('error')
        setMessage(data.error || 'Failed to send location')
      }
    } catch {
      setStatus('error')
      setMessage('Network error. Please try again.')
    }
  }

  useEffect(() => {
    if (autoTrack && workerPhone) {
      sendLocation()
      const interval = setInterval(sendLocation, 60000)
      return () => clearInterval(interval)
    }
  }, [autoTrack, workerPhone])

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-xl font-bold text-center mb-6">📍 Worker Location Tracker</h1>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Phone Number</label>
          <input
            type="tel"
            value={workerPhone}
            onChange={(e) => setWorkerPhone(e.target.value)}
            placeholder="Enter your phone number"
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
          />
          <p className="text-xs text-gray-500 mt-1">Use the same phone number registered with the site</p>
        </div>

        {location && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm">
            <div className="font-medium mb-2">Current Location:</div>
            <div>Lat: {location.lat.toFixed(6)}</div>
            <div>Lng: {location.lng.toFixed(6)}</div>
            <div>Accuracy: ±{Math.round(location.accuracy)}m</div>
          </div>
        )}

        <button
          onClick={sendLocation}
          disabled={status === 'loading'}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {status === 'loading' ? 'Sending...' : '📍 Send My Location'}
        </button>

        <div className="mt-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={autoTrack}
              onChange={(e) => setAutoTrack(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm">Auto-track every 60 seconds</span>
          </label>
        </div>

        {message && (
          <div className={`mt-4 p-3 rounded-lg text-sm ${
            status === 'success' ? 'bg-green-100 text-green-800' :
            status === 'error' ? 'bg-red-100 text-red-800' :
            'bg-blue-100 text-blue-800'
          }`}>
            {message}
          </div>
        )}

        <div className="mt-6 text-xs text-gray-500 text-center">
          Construction Pro - Worker Tracking System
        </div>
      </div>
    </div>
  )
}