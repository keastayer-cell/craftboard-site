import { useEffect, useState } from 'react'

const FILE_TREE_LINES = [
  '178.62.199.241 · DigitalOcean, Амстердам',
  '├── /opt/bot_tg/          # Telegram-бот',
  '├── /opt/uptime-monitor/  # проверки каждый час',
  '└── /opt/project-status/  # статусы проектов',
  '',
  '139.100.237.243 · Selectel',
  '├── /opt/vk-poll-bot/     # VK-бот',
  '├── /opt/status_api/      # API этой страницы',
  '└── /var/www/craftboard/  # этот сайт',
]

const USEFUL_COMMANDS_LINES = [
  '# новый VPS: Telegram-бот и monitoring',
  'ssh root@178.62.199.241',
  'systemctl status tg-poll-bot uptime-monitor.timer',
  'journalctl -u tg-poll-bot -n 50 --no-pager',
  '',
  '# старый VPS: сайт и VK-бот',
  'ssh root@139.100.237.243',
  'systemctl status nginx vk-poll-bot',
  'journalctl -u vk-poll-bot -n 50 --no-pager',
  'df -h /',
]

function FallbackStatus() {
  return {
    uptime: '—',
    cpu: '—',
    ram: { used_mb: '—', total_mb: '—', percent: '—' },
    disk: { used_gb: '—', total_gb: '—', percent: '—' },
    services: { nginx: 'unknown', 'vk-poll-bot': 'unknown' },
    project_services: {},
  }
}

export default function ServerPage() {
  const [data, setData] = useState(FallbackStatus())
  const [meta, setMeta] = useState('Загрузка...')

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const r = await fetch('/api/status', { cache: 'no-store' })
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        const next = await r.json()
        if (cancelled) return
        setData(next)
        setMeta(`Обновлено · ${new Date(next.timestamp * 1000).toLocaleTimeString('ru-RU')}`)
      } catch {
        if (cancelled) return
        setData(FallbackStatus())
        setMeta('Статус временно недоступен')
      }
    }

    load()
    const t = setInterval(load, 30000)
    return () => {
      cancelled = true
      clearInterval(t)
    }
  }, [])

  const badgeClass = (state) => {
    if (state === 'active') return 'badge badge-green'
    if (!state || state === 'unknown') return 'badge badge-yellow'
    return 'badge badge-red'
  }

  const badgeLabel = (state) => state === 'active' ? 'Работает' : !state || state === 'unknown' ? 'Нет данных' : 'Остановлен'

  return (
    <div className="page page-narrow">
      <a className="back" href="/">← Все проекты</a>

      <div className="hero">
        <div className="hero-icon">🖥️</div>
        <h1>Серверы и сервисы</h1>
        <p>Telegram-бот и monitoring работают на новом VPS в Амстердаме. Сайт CraftBoard и VK-бот остаются на сервере Selectel.</p>
        <div className="status"><span className="dot" />{meta}</div>

      </div>

      <section className="section">
        <h2>Selectel · 139.100.237.243</h2>
        <p className="service-meta">Метрики ниже относятся к серверу сайта и VK-бота.</p>
        <div className="spec-grid">
          <div className="spec-item"><div className="spec-label">Провайдер</div><div className="spec-value">Selectel</div></div>
          <div className="spec-item"><div className="spec-label">IP адрес</div><div className="spec-value">139.100.237.243</div></div>
          <div className="spec-item"><div className="spec-label">ОС</div><div className="spec-value">Ubuntu 24.04 LTS</div></div>
          <div className="spec-item"><div className="spec-label">Конфигурация</div><div className="spec-value">2 vCPU · 2 GB RAM · 40 GB</div></div>
          <div className="spec-item"><div className="spec-label">Uptime</div><div className="spec-value">{data.uptime}</div></div>
          <div className="spec-item"><div className="spec-label">CPU</div><div className="spec-value">{data.cpu}%</div></div>
          <div className="spec-item"><div className="spec-label">RAM</div><div className="spec-value">{data.ram.used_mb} / {data.ram.total_mb} MB ({data.ram.percent}%)</div></div>
          <div className="spec-item"><div className="spec-label">Disk</div><div className="spec-value">{data.disk.used_gb} / {data.disk.total_gb} GB ({data.disk.percent}%)</div></div>
          <div className="spec-item"><div className="spec-label">Пользователь</div><div className="spec-value">root</div></div>
        </div>
      </section>

      <section className="section">
        <h2>Окружение Selectel</h2>
        <table className="server-table">
          <thead>
            <tr><th>Компонент</th><th>Версия / Путь</th></tr>
          </thead>
          <tbody>
            <tr><td>Python</td><td>3.12.3 · /usr/bin/python3</td></tr>
            <tr><td>Node.js</td><td>20 LTS · /usr/bin/node</td></tr>
            <tr><td>Java</td><td>OpenJDK 21</td></tr>
            <tr><td>PostgreSQL</td><td>16</td></tr>
            <tr><td>nginx</td><td>1.24.0 · /etc/nginx/</td></tr>
            <tr><td>certbot</td><td>SSL/TLS · Let's Encrypt</td></tr>
          </tbody>
        </table>
      </section>

      <section className="section">
        <h2>Сайт и VK-бот · Selectel</h2>
        <div className="service-list">
          <div className="service-item">
            <div>
              <div className="service-name">nginx</div>
              <div className="service-meta">Веб-сервер · /etc/nginx/ · порт 80 / 443</div>
            </div>
            <span className={badgeClass(data.services?.nginx)}>{badgeLabel(data.services?.nginx)}</span>
          </div>
          <div className="service-item">
            <div>
              <div className="service-name">vk-poll-bot</div>
              <div className="service-meta">VK-бот · /opt/vk-poll-bot/ · 139.100.237.243</div>
            </div>
            <span className={badgeClass(data.services?.['vk-poll-bot'])}>{badgeLabel(data.services?.['vk-poll-bot'])}</span>
          </div>
        </div>
      </section>

      <section className="section">
        <h2>Telegram и monitoring · DigitalOcean</h2>
        <p className="service-meta">178.62.199.241 · Амстердам. Статусы получены с нового VPS.</p>
        <div className="service-list">
          <div className="service-item">
            <div>
              <div className="service-name">tg-poll-bot</div>
              <div className="service-meta">Telegram-бот · /opt/bot_tg/ · 178.62.199.241</div>
            </div>
            <span className={badgeClass(data.project_services?.['tg-poll-bot'])}>{badgeLabel(data.project_services?.['tg-poll-bot'])}</span>
          </div>
          <div className="service-item">
            <div>
              <div className="service-name">uptime-monitor.timer</div>
              <div className="service-meta">Проверки каждый час · /opt/uptime-monitor/ · 178.62.199.241</div>
            </div>
            <span className={badgeClass(data.project_services?.['uptime-monitor.timer'])}>{badgeLabel(data.project_services?.['uptime-monitor.timer'])}</span>
          </div>
        </div>
      </section>

      <section className="section">
        <h2>Где что работает</h2>
        <pre className="code-block">{FILE_TREE_LINES.join('\n')}</pre>
      </section>

      <section className="section">
        <h2>Полезные команды</h2>
        <pre className="code-block">{USEFUL_COMMANDS_LINES.join('\n')}</pre>
      </section>
    </div>
  )
}
