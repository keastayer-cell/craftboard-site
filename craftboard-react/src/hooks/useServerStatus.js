import { useEffect, useState } from 'react'
import { markUnavailable } from '../status'

export default function useServerStatus() {
  const [result, setResult] = useState({ servers: {}, loading: true })
  useEffect(() => {
    let cancelled = false
    let controller
    let busy = false
    const load = async () => {
      if (busy) return
      busy = true
      controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 8000)
      try {
        const response = await fetch('/api/status', { cache: 'no-store', signal: controller.signal })
        if (!response.ok) throw new Error('Нет связи')
        const data = await response.json()
        if (data.version !== 2 || !data.servers?.selectel || !data.servers?.amsterdam) {
          throw new Error('Нет данных серверов')
        }
        if (!cancelled) setResult({ servers: data.servers, loading: false })
      } catch {
        if (!cancelled) setResult((previous) => ({ servers: markUnavailable(previous.servers), loading: false }))
      } finally {
        clearTimeout(timeout)
        busy = false
      }
    }
    const onVisible = () => { if (document.visibilityState === 'visible') load() }
    load()
    const timer = setInterval(load, 30000)
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      cancelled = true
      clearInterval(timer)
      controller?.abort()
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])
  return result
}
