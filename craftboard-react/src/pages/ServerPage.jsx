import { useEffect, useState } from 'react'

const FILE_TREE_LINES = [
  '/',
  '├── opt/',
  '│   └── bot_tg/           # бот',
  '│       ├── bot.py',
  '│       ├── .env',
  '│       ├── state.json',
  '│       └── bot.log',
  '├── root/',
  '│   └── venv/             # Python окружение',
  '├── etc/',
  '│   ├── nginx/            # конфиг nginx',
  '│   └── systemd/system/',
  '│       └── tg-poll-bot.service',
  '└── var/',
  '    └── www/html/         # этот сайт',
]

const USEFUL_COMMANDS_LINES = [
  '# подключиться',
  'ssh root@195.133.49.214',
  '',
  '# статус nginx',
  'systemctl status nginx',
  '',
  '# статус бота',
  'systemctl status tg-poll-bot',
  '',
  '# логи бота',
  'journalctl -u tg-poll-bot -f',
  '',
  '# свободное место',
  'df -h /',
]

function FallbackStatus() {
  return {
    uptime: '—',
    cpu: '—',
    ram: { used_mb: '—', total_mb: '—', percent: '—' },
    disk: { used_gb: '—', total_gb: '—', percent: '—' },
    services: { nginx: 'unknown', 'tg-poll-bot': 'unknown' },
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
        setMeta(`Online · 195.133.49.214 · ${new Date().toLocaleTimeString('ru-RU')}`)
      } catch {
        if (cancelled) return
        setMeta('Нет данных')
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

  const badgeLabel = (state) => (state === 'active' ? 'running' : (state || 'unknown'))

  return (
    <div className="page page-narrow">
      <a className="back" href="/">← Все проекты</a>

      <div className="hero">
        <div className="hero-icon">🖥️</div>
        <h1>VPS сервер</h1>
        <p>Виртуальный сервер на RuVDS под управлением Ubuntu 24.04 LTS. Хостит бота и будущие проекты.</p>
        <div className="status"><span className="dot" />{meta}</div>
        <div className="tags">
          <span className="tag">Ubuntu 24.04 LTS</span>
          <span className="tag">nginx 1.24.0</span>
          <span className="tag">certbot 2.9.0</span>
          <span className="tag">Python 3.12</span>
          <span className="tag">systemd</span>
        </div>
      </div>

      <section className="section">
        <h2>Конфигурация</h2>
        <div className="spec-grid">
          <div className="spec-item"><div className="spec-label">Провайдер</div><div className="spec-value">RuVDS</div></div>
          <div className="spec-item"><div className="spec-label">IP адрес</div><div className="spec-value">195.133.49.214</div></div>
          <div className="spec-item"><div className="spec-label">ОС</div><div className="spec-value">Ubuntu 24.04 LTS</div></div>
          <div className="spec-item"><div className="spec-label">Uptime</div><div className="spec-value">{data.uptime}</div></div>
          <div className="spec-item"><div className="spec-label">CPU</div><div className="spec-value">{data.cpu}%</div></div>
          <div className="spec-item"><div className="spec-label">RAM</div><div className="spec-value">{data.ram.used_mb} / {data.ram.total_mb} MB ({data.ram.percent}%)</div></div>
          <div className="spec-item"><div className="spec-label">Disk</div><div className="spec-value">{data.disk.used_gb} / {data.disk.total_gb} GB ({data.disk.percent}%)</div></div>
          <div className="spec-item"><div className="spec-label">Пользователь</div><div className="spec-value">root</div></div>
        </div>
      </section>

      <section className="section">
        <h2>Что установлено</h2>
        <table className="server-table">
          <thead>
            <tr><th>Компонент</th><th>Версия / Путь</th></tr>
          </thead>
          <tbody>
            <tr><td>Python</td><td>3.12.3 · /usr/bin/python3</td></tr>
            <tr><td>Python venv</td><td>/root/venv/</td></tr>
            <tr><td>nginx</td><td>1.24.0 · /etc/nginx/</td></tr>
            <tr><td>certbot</td><td>2.9.0 · SSL/TLS (Let's Encrypt)</td></tr>
            <tr><td>python-telegram-bot</td><td>20.7</td></tr>
            <tr><td>APScheduler</td><td>3.10.4</td></tr>
            <tr><td>python-dotenv</td><td>1.0.0</td></tr>
          </tbody>
        </table>
      </section>

      <section className="section">
        <h2>Сервисы</h2>
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
              <div className="service-name">tg-poll-bot</div>
              <div className="service-meta">Telegram бот · /opt/bot_tg/ · systemd</div>
            </div>
            <span className={badgeClass(data.services?.['tg-poll-bot'])}>{badgeLabel(data.services?.['tg-poll-bot'])}</span>
          </div>
        </div>
      </section>

      <section className="section">
        <h2>Структура файлов на сервере</h2>
        <pre className="code-block">{FILE_TREE_LINES.join('\n')}</pre>
      </section>

      <section className="section">
        <h2>Полезные команды</h2>
        <pre className="code-block">{USEFUL_COMMANDS_LINES.join('\n')}</pre>
      </section>
    </div>
  )
}
