import { useState, useEffect, useCallback } from 'react'
import type { AdminReservationsResponse } from '../types'

interface UseAdminReservationsOptions {
  eventDate: string
  status?: string
  pollMs?: number
}

export function useAdminReservations({ 
  eventDate, 
  status = 'all', 
  pollMs = 5000 
}: UseAdminReservationsOptions) {
  const [data, setData] = useState<AdminReservationsResponse['items']>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const API = import.meta.env.VITE_API_URL || 'https://obake-uketuke-app-ae91e2b5463a.herokuapp.com/api'

  const fetchOnce = useCallback(async () => {
    if (!eventDate) return
    
    setLoading(true)
    setError(null)
    
    try {
      const qs = new URLSearchParams({ 
        event_date: eventDate, 
        status,
        limit: '100' // 最初は100件固定
      })
      
      const res = await fetch(`${API}/admin/reservations?${qs}`)
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      
      const json: AdminReservationsResponse = await res.json()
      setData(json.items)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '予約一覧の取得に失敗しました'
      setError(errorMessage)
      console.error('Failed to fetch admin reservations:', err)
    } finally {
      setLoading(false)
    }
  }, [API, eventDate, status])

  useEffect(() => {
    fetchOnce()
    const id = setInterval(fetchOnce, pollMs)
    return () => clearInterval(id)
  }, [fetchOnce, pollMs])

  return { 
    data, 
    loading, 
    error, 
    refetch: fetchOnce 
  }
} 