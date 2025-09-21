"use client"

import React, { useEffect, useRef, useState } from 'react'

type AddressComponents = {
  street_number?: string
  route?: string
  sublocality?: string
  locality?: string
  administrative_area_level_1?: string
  country?: string
  postal_code?: string
}

export type PickedAddress = {
  lat?: number | null
  lng?: number | null
  formatted: string
  components: AddressComponents | null
}

type Props = {
  initial?: PickedAddress | null
  onChange?: (addr: PickedAddress | null) => void
}

// Simple helper: Haversine distance in kilometers
function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (v: number) => (v * Math.PI) / 180
  const R = 6371 // km
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export default function MapAddressPicker({ initial = null, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const mapRef = useRef<HTMLDivElement | null>(null)
  const markerRef = useRef<any>(null)
  const [picked, setPicked] = useState<PickedAddress | null>(initial)
  const [inputValue, setInputValue] = useState<string>(initial?.formatted || '')
  const [loadingMap, setLoadingMap] = useState(false)
  const [gmok, setGmOk] = useState<boolean>(false)

  // Delivery center and rules (example) — adjust to your store location
  const STORE_CENTER = { lat: 10.762622, lng: 106.660172 } // Ho Chi Minh City center
  const DELIVERY_MAX_KM = 30 // max delivery radius

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!key) return setGmOk(false)
    // load Google Maps script if not present
    if (typeof window === 'undefined') return
    if ((window as any).google && (window as any).google.maps) {
      setGmOk(true)
      return initMap()
    }

    setLoadingMap(true)
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places&v=weekly`
    script.async = true
    script.defer = true
    script.onload = () => {
      setGmOk(true)
      setLoadingMap(false)
      initMap()
    }
    script.onerror = () => {
      setGmOk(false)
      setLoadingMap(false)
    }
    document.head.appendChild(script)

    return () => {
      // noop
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (onChange) onChange(picked)
  }, [picked, onChange])

  function extractComponents(place: any): AddressComponents {
    const comps: AddressComponents = {}
    if (!place || !place.address_components) return comps
    place.address_components.forEach((c: any) => {
      if (c.types.includes('street_number')) comps.street_number = c.long_name
      if (c.types.includes('route')) comps.route = c.long_name
      if (c.types.includes('sublocality') || c.types.includes('sublocality_level_1')) comps.sublocality = c.long_name
      if (c.types.includes('locality')) comps.locality = c.long_name
      if (c.types.includes('administrative_area_level_1')) comps.administrative_area_level_1 = c.long_name
      if (c.types.includes('country')) comps.country = c.long_name
      if (c.types.includes('postal_code')) comps.postal_code = c.long_name
    })
    return comps
  }

  function initMap() {
    if (!(window as any).google || !(window as any).google.maps) return
    const gm = (window as any).google.maps

    // initial center
    const center = initial ? { lat: initial.lat, lng: initial.lng } : STORE_CENTER

    const map = new gm.Map(mapRef.current, {
      center,
      zoom: initial ? 16 : 12,
    })

    const marker = new gm.Marker({
      position: center,
      map,
      draggable: true,
    })
    markerRef.current = marker

    const geocoder = new gm.Geocoder()

    marker.addListener('dragend', () => {
      const pos = marker.getPosition()
      const lat = pos.lat()
      const lng = pos.lng()
      geocoder.geocode({ location: { lat, lng } }, (results: any) => {
        const formatted = (results && results[0] && results[0].formatted_address) || ''
        const comps = (results && results[0]) ? extractComponents(results[0]) : {}
        setPicked({ lat, lng, formatted, components: comps })
        map.panTo({ lat, lng })
      })
    })

    // Places Autocomplete
    if (inputRef.current) {
      const ac = new (gm.places.Autocomplete)(inputRef.current, { fields: ['geometry', 'formatted_address', 'address_components'] })
      ac.addListener('place_changed', () => {
        const place = ac.getPlace()
        if (!place.geometry || !place.geometry.location) return
        const lat = place.geometry.location.lat()
        const lng = place.geometry.location.lng()
        marker.setPosition({ lat, lng })
        map.panTo({ lat, lng })
        map.setZoom(16)
        const formatted = place.formatted_address || ''
        const comps = extractComponents(place)
        const newPicked = { lat, lng, formatted, components: comps }
        setPicked(newPicked)
        setInputValue(formatted)
        if (onChange) onChange(newPicked)
      })
    }
  }

  const withinDelivery = picked && picked.lat != null && picked.lng != null ? haversine(STORE_CENTER.lat, STORE_CENTER.lng, picked.lat as number, picked.lng as number) <= DELIVERY_MAX_KM : true
  const distanceKm = picked && picked.lat != null && picked.lng != null ? haversine(STORE_CENTER.lat, STORE_CENTER.lng, picked.lat as number, picked.lng as number) : 0

  // Simple shipping fee rule: base 30k + 3k per km after 5km
  function computeShipping(km: number) {
    const base = 30000
    if (km <= 5) return base
    return Math.round(base + (km - 5) * 3000)
  }

  return (
    <div className="space-y-2">
      <div>
        <input
          ref={inputRef}
          placeholder="Gõ địa chỉ để tìm (Google Autocomplete)"
          className="w-full border p-3 rounded"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              // user pressed Enter without selecting autocomplete: accept typed address
              e.preventDefault()
              if (inputValue.trim()) {
                const newPicked = { lat: null, lng: null, formatted: inputValue.trim(), components: null }
                setPicked(newPicked)
                if (onChange) onChange(newPicked)
              }
            }
          }}
          onBlur={() => {
            // on blur, if Google Autocomplete didn't set a place, accept typed value
            if (inputValue.trim() && (!picked || picked.formatted !== inputValue.trim())) {
              const newPicked = { lat: picked?.lat ?? null, lng: picked?.lng ?? null, formatted: inputValue.trim(), components: picked?.components ?? null }
              setPicked(newPicked)
              if (onChange) onChange(newPicked)
            }
          }}
        />
      </div>

      {gmok ? (
        <div>
          <div ref={mapRef} style={{ width: '100%', height: 300 }} className="rounded" />
        </div>
      ) : null}

      <div className="text-sm text-rose-700">
        {picked ? (
          <div>
            <div><strong>Địa chỉ:</strong> {picked.formatted}</div>
            {picked.lat != null && picked.lng != null ? (
              <div><strong>Tọa độ:</strong> {picked.lat.toFixed(6)}, {picked.lng.toFixed(6)}</div>
            ) : null}
            <div><strong>Khoảng cách:</strong> {distanceKm.toFixed(2)} km</div>
            <div><strong>Phí giao:</strong> {withinDelivery ? computeShipping(distanceKm).toLocaleString('vi-VN') + 'đ' : 'Ngoài vùng giao hàng'}</div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
