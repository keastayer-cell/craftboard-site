import { useEffect, useState } from 'react'

const MONITOR_SERVICE = 'uptime-monitor.timer'
const BOT_SERVICE = 'tg-poll-bot'

function monitorStatusLabel(state) {
  if (state === 'active') return 'Работает на сервере'
  if (state === 'loading') return 'Проверяем состояние...'
  if (state === 'unknown') return 'Статус временно недоступен'
  return 'Сервис остановлен'
}

export default function HomePage() {
  const [open, setOpen] = useState(false)
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
          setServices(data.project_services || {})
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

  const monitorState = loading ? 'loading' : services[MONITOR_SERVICE] || 'unknown'
  const botState = loading ? 'loading' : services[BOT_SERVICE] || 'unknown'
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
      window.location.assign('/server.html')
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

      <button className="server-badge" onClick={() => setOpen(true)}>
        <div className="server-badge-title">🖥 ServerConfig</div>
        <div className="server-badge-row"><span className="dot" /> Ubuntu 24.04 LTS</div>
        <div className="server-badge-row">Selectel · 2 vCPU · 2 GB RAM</div>
        <div className="server-badge-row server-badge-ip">139.100.237.243</div>
      </button>

      <header className="hero-header">
        <h1>CraftBoard</h1>
        <p>
          Небольшая живая витрина моих проектов. Собрал ради интереса,
          без больших планов — а она взяла и работает.
        </p>
      </header>

      <div className="grid">
        <a className="card" href="/tg-poll-bot.html">
          <div className="card-icon">🤖</div>
          <h2>Telegram Poll Bot</h2>
          <p>Бот для автоматического создания опросов в групповом чате.</p>
          <div className="tags">
            <span className="tag">Python</span>
            <span className="tag">Telegram Bot API</span>
            <span className="tag">APScheduler</span>
            <span className="tag">VPS</span>
          </div>
          <div className={statusClass(botState)} aria-live="polite">
            {monitorStatusLabel(botState)}
          </div>
          <div className="service-meta">VPS · 178.62.199.241</div>
        </a>

        <a className="card" href="/uptime-monitor.html">
          <div className="card-icon">📡</div>
          <h2>Uptime Monitor</h2>
          <p>Сервис для проверки доступности сайтов, systemd-сервисов и Telegram Bot API.</p>
          <div className="tags">
            <span className="tag">Python</span>
            <span className="tag">HTTP</span>
            <span className="tag">systemd</span>
            <span className="tag">Telegram</span>
          </div>
          <div className={statusClass(monitorState)} aria-live="polite">
            {monitorStatusLabel(monitorState)}
          </div>
          <div className="service-meta">VPS · 178.62.199.241</div>
        </a>
      </div>
    </div>
  )
}
