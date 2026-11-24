import { useEffect, useState } from 'react'
import { marked } from 'marked'
import useServerStatus from '../hooks/useServerStatus'
import ServiceStatus from '../components/ServiceStatus'
import { formatTime } from '../status'

export default function MonitorPage() {
  const { servers, loading } = useServerStatus()
  const server = servers.amsterdam
  const [html, setHtml] = useState('<p>Загрузка...</p>')

  useEffect(() => {
    const run = async () => {
      try {
        const r = await fetch(
          'https://raw.githubusercontent.com/keastayer-cell/monitoring/main/README.md',
          { cache: 'no-store' },
        )
        if (!r.ok) throw new Error('README not found')
        setHtml(marked.parse(await r.text()))
      } catch {
        setHtml('<p>Не удалось загрузить README.</p>')
      }
    }
    run()
  }, [])

  return (
    <div className="page page-narrow">
      <a className="back" href="/">← Все проекты</a>
      <section className="section monitor-current">
        <h2>Текущее состояние проверок</h2>
        <p className="service-meta">DigitalOcean · 178.62.199.241</p>
        <ServiceStatus server={server} name="uptime-monitor.timer" loading={loading} />
        <p className="status-time">Последнее успешное обновление: {formatTime(server?.last_success_at)}</p>
        <p className="section-note">Руководство ниже описывает настройку мониторинга. Текущее состояние расписания берётся с сервера.</p>
      </section>
      <div className="markdown md-body" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  )
}
