import { useEffect, useState } from 'react'

export default function BotDetails({ project }) {
  const [state, setState] = useState('loading')
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const response = await fetch('/api/status', { cache: 'no-store' })
        if (!response.ok) throw new Error('Нет данных')
        const data = await response.json()
        if (!cancelled) setState(data[project.source]?.[project.service] || 'unknown')
      } catch { if (!cancelled) setState('unknown') }
    }
    load()
    const timer = setInterval(load, 30000)
    return () => { cancelled = true; clearInterval(timer) }
  }, [project])
  const label = state === 'active' ? 'Работает на сервере' : state === 'loading' ? 'Проверяем состояние...' : state === 'unknown' ? 'Статус временно недоступен' : 'Сервис остановлен'
  const statusClass = state === 'active' ? 'status' : ['loading', 'unknown'].includes(state) ? 'status status-pending' : 'status status-down'
  return <div className="page page-narrow bot-details">
    <a className="back" href="/">← Все проекты</a>
    <header className="hero">
      <div className="hero-icon">{project.icon}</div>
      <h1>{project.title}</h1>
      <p>{project.description}</p>
      <div className={statusClass} aria-live="polite">{label}</div>
      <div className="service-meta">{project.host}</div>
      <div className="tags">{project.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div>
    </header>
    <section className="section"><h2>Как это работает</h2><ol>{project.steps.map((step) => <li key={step}>{step}</li>)}</ol></section>
    {project.sections.map((section) => <section className="section" key={section.title}>
      <h2>{section.title}</h2>
      {section.paragraphs?.map((text) => <p key={text}>{text}</p>)}
      {section.items && <ul>{section.items.map((text) => <li key={text}>{text}</li>)}</ul>}
    </section>)}
    <section className="section"><h2>Команды</h2><div className="table-scroll">
      <table className="server-table"><thead><tr><th>Команда</th><th>Что делает</th><th>Кому доступна</th></tr></thead><tbody>
        {project.commands.map(([command, action, audience]) => <tr key={command}><td><code>{command}</code></td><td>{action}</td><td>{audience}</td></tr>)}
      </tbody></table>
    </div></section>
    <section className="section"><h2>Расписание по умолчанию</h2>
      <div className="spec-grid">{project.schedule.map(([label, value]) => <div className="spec-item" key={label}><div className="spec-label">{label}</div><div className="spec-value">{value}</div></div>)}</div>
      <p>Время московское. Настройки, сохранённые через /settime и /setdays, имеют приоритет. Текущее расписание можно узнать командой /settime у администратора.</p>
    </section>
    <section className="section"><h2>Где работает</h2><p>{project.host}. Сервис {project.service}.</p><a href={project.serverPage}>Конфигурация и состояние сервера →</a></section>
  </div>
}
