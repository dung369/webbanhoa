"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'

type FavItem = { id: string; name?: string; price?: number; image?: string }

type FavContext = {
  favorites: FavItem[]
  toggleFavorite: (item: FavItem) => void
  isFavorite: (id: string) => boolean
  count: number
}

const FavoritesContext = createContext<FavContext | null>(null)

const STORAGE_KEY = 'wb_favorites'

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<FavItem[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setFavorites(JSON.parse(raw))
    } catch (e) {
      setFavorites([])
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
    } catch (e) {
      // ignore
    }
  }, [favorites])

  const toggleFavorite = (item: FavItem) => {
    setFavorites((prev) => {
      const exists = prev.find((p) => String(p.id) === String(item.id))
      if (exists) return prev.filter((p) => String(p.id) !== String(item.id))
      return [{ id: item.id, name: item.name, price: item.price, image: item.image }, ...prev]
    })
  }

  const isFavorite = (id: string) => favorites.some((p) => String(p.id) === String(id))

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite, count: favorites.length }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext)
  if (!ctx) throw new Error('useFavorites must be used inside FavoritesProvider')
  return ctx
}

export type { FavItem }
