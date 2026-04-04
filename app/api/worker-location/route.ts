import { NextRequest, NextResponse } from 'next/server'
import { workersDb, workerLocationDb, trackingAlertDb, siteConfigDb } from '../../lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, latitude, longitude, accuracy } = body

    if (!phone || !latitude || !longitude) {
      return NextResponse.json(
        { error: 'Phone, latitude, and longitude are required' },
        { status: 400 }
      )
    }

    const workers = workersDb.getAll()
    const worker = workers.find(w => w.phone === phone)

    if (!worker) {
      return NextResponse.json(
        { error: 'Worker not found with this phone number' },
        { status: 404 }
      )
    }

    const siteConfig = siteConfigDb.get()
    const siteLat = siteConfig?.latitude || 40.7128
    const siteLng = siteConfig?.longitude || -74.0060
    const siteRadius = siteConfig?.radiusMeters || 500

    const location = workerLocationDb.create({
      phone,
      workerId: worker.id,
      latitude,
      longitude,
      accuracy: accuracy || 0,
      timestamp: new Date().toISOString()
    }, siteLat, siteLng, siteRadius)

    return NextResponse.json({
      success: true,
      location,
      isOutsideSite: location.isOutsideSite,
      distanceFromSite: location.distanceFromSite,
      siteRadius,
      alertGenerated: location.isOutsideSite
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process location update' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const phone = searchParams.get('phone')
    const workerId = searchParams.get('workerId')

    if (phone) {
      const location = workerLocationDb.getLatestByPhone(phone)
      return NextResponse.json({ location })
    }

    if (workerId) {
      const workers = workersDb.getAll()
      const worker = workers.find(w => w.id === workerId)
      if (worker) {
        const location = workerLocationDb.getLatestByPhone(worker.phone)
        return NextResponse.json({ location })
      }
      return NextResponse.json({ error: 'Worker not found' }, { status: 404 })
    }

    const activeWorkers = workerLocationDb.getActiveWorkers()
    const activeAlerts = trackingAlertDb.getActive()

    return NextResponse.json({
      activeWorkers,
      alerts: activeAlerts,
      siteConfig: siteConfigDb.get()
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get location data' },
      { status: 500 }
    )
  }
}