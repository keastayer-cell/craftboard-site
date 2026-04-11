import { useEffect, useState } from 'react'
import { marked } from 'marked'

function stripHiddenSections(markdown) {
  const hiddenTitles = [
    'Stage тест без остановки прода',
    'Как работаем с Copilot',
  ]

  const lines = markdown.split('\n')
  const out = []
  let skip = false

  for (const line of lines) {
    const heading = line.match(/^##\s+(.+)$/)
    if (heading) {
      const title = heading[1].trim()
      if (hiddenTitles.includes(title)) {
        skip = true
        continue
      }
      skip = false
    }

    if (!skip) out.push(line)
  }

  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n'
}

export default function BotPage() {
  const [html, setHtml] = useState('<p>Загрузка...</p>')

  useEffect(() => {
    const run = async () => {
      try {
        const r = await fetch('https://raw.githubusercontent.com/keastayer-cell/tg-poll-bot/main/README.md', { cache: 'no-store' })
        if (!r.ok) throw new Error('README not found')
        const md = await r.text()
        setHtml(marked.parse(stripHiddenSections(md)))
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
