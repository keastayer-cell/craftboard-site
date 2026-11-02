import { useEffect, useState } from 'react'

const PROJECTS = [
  { name: 'Telegram Poll Bot', icon: '🤖', href: '/tg-poll-bot.html', service: 'tg-poll-bot', host: '178.62.199.241', description: 'Опросы в Telegram: голоса участников, приглашённые и напоминания об игре.', tags: ['Python', 'Telegram API', 'APScheduler', 'systemd'] },
  { name: 'Uptime Monitor', icon: '📡', href: '/uptime-monitor.html', service: 'uptime-monitor.timer', host: '178.62.199.241', description: 'Проверки сайтов, сервисов и Telegram API с уведомлениями о сбоях.', tags: ['Python', 'HTTP', 'Telegram API', 'systemd'] },
  { name: 'VK Poll Bot', icon: '💬', href: '/vk-poll-bot.html', service: 'vk-poll-bot', host: '139.100.237.243', description: 'Опросы во ВКонтакте: запись на игру, приглашённые и составы команд.', tags: ['Python', 'VK API', 'APScheduler', 'systemd'] },
]

function monitorStatusLabel(state) {
  if (state === 'active') return 'Работает на сервере'
  if (state === 'loading') return 'Проверяем состояние...'
  if (state === 'unknown') return 'Статус временно недоступен'
  return 'Сервис остановлен'
}

export default function HomePage() {
  const [open, setOpen] = useState(false)
  const [serverPage, setServerPage] = useState('/server-selectel.html')
  const [pwd, setPwd] = useState('')
  const [error, setError] = useState('')
  const [services, setServices] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const loadMonitorState = async () => {
      try {
        const response = await fetch('/api/status', { cache: 'no-store' })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const data = await response.json()
        if (!cancelled) {
          setServices({ ...data.services, ...data.project_services })
          setLoading(false)
        }
      } catch {
        if (!cancelled) {
          setServices({})
          setLoading(false)
        }
      }
    }

    loadMonitorState()
    const timer = setInterval(loadMonitorState, 30000)
    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [])

  const statusClass = (state) => state === 'active'
    ? 'status'
    : state === 'loading' || state === 'unknown'
      ? 'status status-pending'
      : 'status status-down'

  const submitPassword = (e) => {
    e.preventDefault()
    if ((pwd || '').trim() === '2113') {
      setOpen(false)
      setPwd('')
      setError('')
      window.location.assign(serverPage)
      return
    }
    setError('Неверный пароль')
    setPwd('')
  }

  return (
    <div className="page">
      {open && (
        <div className="modal-overlay" onClick={() => setOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">🔒</div>
            <h3>ServerConfig</h3>
            <p className="modal-sub">Введите пароль для доступа</p>
            <form onSubmit={submitPassword}>
              <input
                autoFocus
                className="modal-input"
                type="password"
                placeholder="Пароль"
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
              />
              <div className="modal-error">{error}</div>
              <div className="modal-actions">
                <button type="submit" className="btn-primary">Войти</button>
                <button type="button" className="btn-cancel" onClick={() => setOpen(false)}>Отмена</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="server-badges" aria-label="Серверы и размещённые проекты">
        <button className="server-badge" onClick={() => { setServerPage('/server-selectel.html'); setOpen(true) }}>
          <div className="server-badge-title">🖥 ServerConfig · Selectel</div>
          <div className="server-badge-row">Ubuntu 24.04 LTS</div>
          <div className="server-badge-row">2 vCPU · 2 GB RAM</div>
          <div className="server-badge-row server-badge-ip">139.100.237.243</div>
          <div className="server-badge-projects">
            <span>CraftBoard · VK-бот</span>
            <span>BG Foot · тест</span>
            <span>Efgen Bosh · тест</span>
          </div>
        </button>
        <button className="server-badge" onClick={() => { setServerPage('/server-amsterdam.html'); setOpen(true) }}>
          <div className="server-badge-title">🖥 ServerConfig · DigitalOcean</div>
          <div className="server-badge-row">Ubuntu 26.04.1 LTS · Амстердам</div>
          <div className="server-badge-row">1 vCPU · 512 MB RAM</div>
          <div className="server-badge-row server-badge-ip">178.62.199.241</div>
          <div className="server-badge-projects">
            <span>Telegram Poll Bot</span>
            <span>Uptime Monitor</span>
          </div>
        </button>
      </div>

      <header className="hero-header">
        <h1>CraftBoard</h1>
        <p>
          Небольшая живая витрина моих проектов. Собрал ради интереса,
          без больших планов — а она взяла и работает.
        </p>
      </header>

      <div className="grid project-grid">
        {PROJECTS.map((project) => {
          const state = loading ? 'loading' : services[project.service] || 'unknown'
          return <a className="card project-card" href={project.href} key={project.service}>
            <div className="card-icon" aria-hidden="true">{project.icon}</div>
            <h2>{project.name}</h2>
            <p>{project.description}</p>
            <div className="tags">{project.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div>
            <div className="card-footer">
              <div className={statusClass(state)} aria-live="polite">{monitorStatusLabel(state)}</div>
              <div className="service-meta">VPS · {project.host}</div>
            </div>
          </a>
        })}
      </div>
    </div>
  )
}
