import { useEffect, useState } from 'react'

const QUERY = '(min-width: 960px)'

export function useIsDesktop() {
  const [is, setIs] = useState(() => typeof window !== 'undefined' && window.matchMedia(QUERY).matches)
  useEffect(() => {
    const mq = window.matchMedia(QUERY)
    const on = () => setIs(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return is
}
