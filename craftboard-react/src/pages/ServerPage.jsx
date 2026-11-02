import { useEffect, useState } from 'react'

const SERVERS = {
  selectel: {
    name: 'Selectel', ip: '139.100.237.243', os: 'Ubuntu 24.04 LTS',
    specs: '2 vCPU · 2 GB RAM · 40 GB',
    description: 'CraftBoard, VK-бот и тестовые приложения BG Foot и Efgen Bosh.',
    services: [
      ['nginx', 'CraftBoard · /var/www/craftboard/'],
      ['vk-poll-bot', 'VK-бот · /opt/vk-poll-bot/'],
      ['football-stats-app@test', 'BG Foot · тестовый backend'],
      ['football-stats-mailer@test', 'BG Foot · тестовая рассылка'],
      ['efgen-bosh-app@test', 'Efgen Bosh · тестовое приложение'],
    ],
    files: ['/var/www/craftboard/  # сайт', '/opt/vk-poll-bot/     # VK-бот', '/opt/football-stats-app/', '/opt/status_api/      # статусы сервера'],
  },
  amsterdam: {
    name: 'DigitalOcean · Амстердам', ip: '178.62.199.241', os: 'Ubuntu 26.04.1 LTS',
    specs: '1 vCPU · 512 MB RAM · 10 GB',
    description: 'Telegram Poll Bot и Uptime Monitor. Проверки доступности запускаются каждый час.',
    services: [
      ['tg-poll-bot', 'Telegram Poll Bot · /opt/bot_tg/'],
      ['uptime-monitor.timer', 'Uptime Monitor · /opt/uptime-monitor/ · каждый час'],
    ],
    files: ['/opt/bot_tg/          # Telegram-бот', '/opt/uptime-monitor/  # monitoring', '/opt/project-status/  # статусы сервера'],
  },
}

function emptyStatus() {
  return { uptime: '—', cpu: '—', ram: { used_mb: '—', total_mb: '—', percent: '—' }, disk: { used_gb: '—', total_gb: '—', percent: '—' }, services: {} }
}

export default function ServerPage({ server = 'selectel' }) {
  const config = SERVERS[server]
  const [data, setData] = useState(emptyStatus)
  const [meta, setMeta] = useState('Загрузка...')

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const response = await fetch('/api/status', { cache: 'no-store' })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const all = await response.json()
        const next = server === 'amsterdam' ? all.project_server : all
        if (!next?.ram || !next?.disk || !next?.timestamp) throw new Error('Нет данных сервера')
        if (cancelled) return
        setData(next)
        setMeta(`Обновлено · ${new Date(next.timestamp * 1000).toLocaleTimeString('ru-RU')}`)
      } catch {
        if (cancelled) return
        setData(emptyStatus())
        setMeta('Статус временно недоступен')
      }
    }
    load()
    const timer = setInterval(load, 30000)
    return () => { cancelled = true; clearInterval(timer) }
  }, [server])

  const badgeClass = (state) => state === 'active' ? 'badge badge-green' : !state || state === 'unknown' ? 'badge badge-yellow' : 'badge badge-red'
  const badgeLabel = (state) => state === 'active' ? 'Работает' : !state || state === 'unknown' ? 'Нет данных' : 'Остановлен'
  const specs = [
    ['Провайдер', config.name], ['IP адрес', config.ip], ['ОС', config.os], ['Конфигурация', config.specs],
    ['Uptime', data.uptime], ['CPU', `${data.cpu}%`],
    ['RAM', `${data.ram.used_mb} / ${data.ram.total_mb} MB (${data.ram.percent}%)`],
    ['Disk', `${data.disk.used_gb} / ${data.disk.total_gb} GB (${data.disk.percent}%)`],
  ]
  const commands = [`ssh root@${config.ip}`, '', ...config.services.map(([name]) => `systemctl status ${name}`), '', `journalctl -u ${server === 'amsterdam' ? 'tg-poll-bot' : 'vk-poll-bot'} -n 50 --no-pager`, 'df -h /']

  return (
    <div className="page page-narrow">
      <a className="back" href="/">← Все проекты</a>
      <div className="hero">
        <div className="hero-icon">🖥️</div>
        <h1>{config.name}</h1>
        <p>{config.ip} · {config.description}</p>
        <div className="status">{meta}</div>
      </div>
      <section className="section">
        <h2>Конфигурация</h2>
        <div className="spec-grid">
          {specs.map(([label, value]) => <div className="spec-item" key={label}><div className="spec-label">{label}</div><div className="spec-value">{value}</div></div>)}
        </div>
      </section>
      <section className="section">
        <h2>Что работает на сервере</h2>
        <div className="service-list">
          {config.services.map(([name, description]) => <div className="service-item" key={name}>
            <div><div className="service-name">{name}</div><div className="service-meta">{description}</div></div>
            <span className={badgeClass(data.services[name])}>{badgeLabel(data.services[name])}</span>
          </div>)}
        </div>
      </section>
      <section className="section"><h2>Файлы и приложения</h2><pre className="code-block">{config.files.join('\n')}</pre></section>
      <section className="section"><h2>Полезные команды</h2><pre className="code-block">{commands.join('\n')}</pre></section>
    </div>
  )
}
