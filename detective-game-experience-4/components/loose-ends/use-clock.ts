'use client'

import { useEffect, useState } from 'react'

/**
 * In-world clock, frozen to the 2019 timeframe for period accuracy but ticking
 * so the taskbar feels alive.
 */
export function useClock() {
  const [now, setNow] = useState(() => new Date(2019, 4, 2, 21, 47, 0)) // 2 May 2019, 9:47pm

  useEffect(() => {
    const id = setInterval(() => setNow((d) => new Date(d.getTime() + 1000)), 1000)
    return () => clearInterval(id)
  }, [])

  const time = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  const date = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

  return { time, date }
}
