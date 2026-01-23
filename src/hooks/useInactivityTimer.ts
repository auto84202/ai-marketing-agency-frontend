'use client'

import { useEffect, useRef, useCallback } from 'react'

const INACTIVITY_TIMEOUT = 60 * 60 * 1000 // 1 hour (60 minutes) in milliseconds
const ACTIVITY_STORAGE_KEY = 'last_activity_time'

interface UseInactivityTimerOptions {
  onInactive: () => void
  timeout?: number
  enabled?: boolean
}

/**
 * Custom hook to track user inactivity and trigger callback after specified timeout
 */
export function useInactivityTimer({
  onInactive,
  timeout = INACTIVITY_TIMEOUT,
  enabled = true
}: UseInactivityTimerOptions) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastActivityRef = useRef<number>(Date.now())
  const onInactiveRef = useRef(onInactive)
  const enabledRef = useRef(enabled)
  const timeoutRefValue = useRef(timeout)

  // Keep refs updated
  useEffect(() => {
    onInactiveRef.current = onInactive
    enabledRef.current = enabled
    timeoutRefValue.current = timeout
  }, [onInactive, enabled, timeout])

  // Reset activity timer
  const resetTimer = useCallback(() => {
    if (!enabledRef.current) return

    const now = Date.now()
    lastActivityRef.current = now
    
    // Store last activity time in localStorage for cross-tab sync
    localStorage.setItem(ACTIVITY_STORAGE_KEY, now.toString())

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      onInactiveRef.current()
    }, timeoutRefValue.current)
  }, [])

  // Check for inactivity on mount and when storage changes (cross-tab sync)
  useEffect(() => {
    if (!enabledRef.current) return

    // Check last activity from localStorage
    const storedActivityTime = localStorage.getItem(ACTIVITY_STORAGE_KEY)
    const currentTimeout = timeoutRefValue.current
    
    if (storedActivityTime) {
      const lastActivity = parseInt(storedActivityTime, 10)
      const now = Date.now()
      const timeSinceActivity = now - lastActivity

      // If more than timeout has passed, log out immediately
      if (timeSinceActivity >= currentTimeout) {
        onInactiveRef.current()
        return
      }

      // Otherwise, set timer for remaining time
      const remainingTime = currentTimeout - timeSinceActivity
      lastActivityRef.current = lastActivity

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        onInactiveRef.current()
      }, remainingTime)
    } else {
      // No stored activity, start fresh
      resetTimer()
    }

    // Listen for storage changes (activity in other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === ACTIVITY_STORAGE_KEY && e.newValue) {
        const newActivityTime = parseInt(e.newValue, 10)
        const now = Date.now()
        const timeSinceActivity = now - newActivityTime
        const currentTimeout = timeoutRefValue.current

        if (timeSinceActivity >= currentTimeout) {
          onInactiveRef.current()
          return
        }

        lastActivityRef.current = newActivityTime

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }

        timeoutRef.current = setTimeout(() => {
          onInactiveRef.current()
        }, currentTimeout - timeSinceActivity)
      }
    }

    window.addEventListener('storage', handleStorageChange)

    // Track user activity events
    const activityEvents = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ]

    // Throttle activity tracking to avoid excessive resets (max once per 5 seconds)
    let lastResetTime = 0
    const THROTTLE_MS = 5000

    const handleActivity = () => {
      const now = Date.now()
      if (now - lastResetTime < THROTTLE_MS) {
        return
      }
      lastResetTime = now
      resetTimer()
    }

    // Attach activity listeners
    activityEvents.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true })
    })

    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleActivity)
      })
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [enabled, resetTimer]) // enabled is checked via ref inside, resetTimer is stable

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return { resetTimer }
}

