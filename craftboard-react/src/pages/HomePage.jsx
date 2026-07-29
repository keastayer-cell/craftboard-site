import { useState } from 'react'

export default function HomePage() {
  const [open, setOpen] = useState(false)
  const [pwd, setPwd] = useState('')
  const [error, setError] = useState('')
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
          <div className="status">Работает на сервере</div>
        </a>

        <a
          className="card"
          href="https://github.com/keastayer-cell/monitoring"
          target="_blank"
          rel="noreferrer"
        >
          <div className="card-icon">📡</div>
          <h2>Uptime Monitor</h2>
          <p>Сервис для проверки доступности сайтов, systemd-сервисов и Telegram Bot API.</p>
          <div className="tags">
            <span className="tag">Python</span>
            <span className="tag">HTTP</span>
            <span className="tag">systemd</span>
            <span className="tag">Telegram</span>
          </div>
          <div className="status status-paused">Перенесён · запуск отключён</div>
        </a>
      </div>
    </div>
  )
}
