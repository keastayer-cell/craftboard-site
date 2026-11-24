import { useState } from 'react'
import useServerStatus from '../hooks/useServerStatus'
import ServerCard from '../components/ServerCard'
import ServiceStatus from '../components/ServiceStatus'
import { formatTime } from '../status'

const PROJECTS = [
  { name: 'Telegram Poll Bot', icon: '🤖', href: '/tg-poll-bot.html', service: 'tg-poll-bot', serverId: 'amsterdam', host: '178.62.199.241', description: 'Опросы в Telegram: голоса участников, приглашённые и напоминания об игре.', tags: ['Python', 'Telegram API', 'APScheduler', 'systemd'] },
  { name: 'Uptime Monitor', icon: '📡', href: '/uptime-monitor.html', service: 'uptime-monitor.timer', serverId: 'amsterdam', host: '178.62.199.241', description: 'Проверки сайтов, сервисов и Telegram API с уведомлениями о сбоях.', tags: ['Python', 'HTTP', 'Telegram API', 'systemd'] },
  { name: 'VK Poll Bot', icon: '💬', href: '/vk-poll-bot.html', service: 'vk-poll-bot', serverId: 'selectel', host: '139.100.237.243', description: 'Опросы во ВКонтакте: запись на игру, приглашённые и составы команд.', tags: ['Python', 'VK API', 'APScheduler', 'systemd'] },
]

export default function HomePage() {
  const [open, setOpen] = useState(false)
  const [serverPage, setServerPage] = useState('/server-selectel.html')
  const [pwd, setPwd] = useState('')
  const [error, setError] = useState('')
  const { servers, loading } = useServerStatus()

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

      <header className="hero-header">
        <h1>CraftBoard</h1>
        <p>
          Небольшая живая витрина моих проектов. Собрал ради интереса,
          без больших планов — а она взяла и работает.
        </p>
      </header>

      <section className="servers-section" aria-labelledby="servers-title">
        <h2 id="servers-title">Серверы</h2>
        <p className="section-note">У каждого сервера свои показатели и службы. Данные обновляются каждые 30 секунд.</p>
        <div className="servers-grid">{['selectel', 'amsterdam'].map((id) =>
          <ServerCard key={id} id={id} server={servers[id]} loading={loading}
            onDetails={(href) => { setServerPage(href); setOpen(true) }} />
        )}</div>
        <p className="section-note">Статус службы показывает состояние systemd. Ответы ботов на команды и доставку сообщений сайт не проверяет.</p>
      </section>
      <div className="projects-heading"><h2>Проекты</h2></div>
      <div className="grid project-grid">
        {PROJECTS.map((project) => {
          const server = servers[project.serverId]
          return <a className="card project-card" href={project.href} key={project.service}>
            <div className="card-icon" aria-hidden="true">{project.icon}</div>
            <h2>{project.name}</h2>
            <p>{project.description}</p>
            <div className="tags">{project.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div>
            <div className="card-footer">
              <ServiceStatus server={server} name={project.service} loading={loading} />
              <div className="service-meta">VPS · {project.host}</div>
              <div className="status-time">Данные: {formatTime(server?.last_success_at)}</div>
            </div>
          </a>
        })}
      </div>
    </div>
  )
}
