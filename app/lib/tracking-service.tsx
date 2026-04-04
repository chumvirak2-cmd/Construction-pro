'use client'

import { useState, useEffect } from 'react'
import { Geolocation } from '@capacitor/geolocation'

interface TrackingServiceProps {
  enabled?: boolean
  intervalMs?: number
}

export default function TrackingService({ enabled = true, intervalMs = 60000 }: TrackingServiceProps) {
  const [lastLocation, setLastLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled) return

    const sendLocation = async () => {
      try {
        const position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true
        })

        const { latitude, longitude, accuracy } = position.coords
        setLastLocation({ lat: latitude, lng: longitude })

        const phone = localStorage.getItem('cp_worker_phone')
        if (!phone) return

        const response = await fetch('/api/worker-location', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone,
            latitude,
            longitude,
            accuracy
          })
        })

        const data = await response.json()
        if (data.isOutsideSite && 'Notification' in window) {
          if (Notification.permission === 'granted') {
            new Notification('⚠️ Site Alert', {
              body: `You are ${data.distanceFromSite}m away from the construction site. Please return within ${data.siteRadius}m.`
            })
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to get location')
      }
    }

    sendLocation()
    const interval = setInterval(sendLocation, intervalMs)

    return () => clearInterval(interval)
  }, [enabled, intervalMs])

  return null
}

export async function getCurrentLocation(): Promise<{ lat: number; lng: number; accuracy: number }> {
  const position = await Geolocation.getCurrentPosition({
    enableHighAccuracy: true
  })
  return {
    lat: position.coords.latitude,
    lng: position.coords.longitude,
    accuracy: position.coords.accuracy
  }
}

export async function sendLocationToServer(phone: string): Promise<boolean> {
  try {
    const position = await getCurrentLocation()
    const response = await fetch('/api/worker-location', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone,
        latitude: position.lat,
        longitude: position.lng,
        accuracy: position.accuracy
      })
    })
    return response.ok
  } catch {
    return false
  }
}