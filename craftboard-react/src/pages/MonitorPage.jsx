import { useEffect, useState } from 'react'
import { marked } from 'marked'

export default function MonitorPage() {
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
      <div className="markdown md-body" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  )
}
