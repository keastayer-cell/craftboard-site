import useServerStatus from '../hooks/useServerStatus'
import ServiceStatus from '../components/ServiceStatus'
import { connectionStatus, formatTime, isCurrent, SERVER_CONFIG } from '../status'

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
    specs: '1 vCPU · 1 GB RAM · 25 GB',
    description: 'Telegram Poll Bot и Uptime Monitor. Состояние расписания проверок показано ниже.',
    services: [
      ['tg-poll-bot', 'Telegram Poll Bot · /opt/bot_tg/'],
      ['uptime-monitor.timer', 'Uptime Monitor · /opt/uptime-monitor/ · каждый час'],
    ],
    files: ['/opt/bot_tg/          # Telegram-бот', '/opt/uptime-monitor/  # monitoring', '/opt/project-status/  # статусы сервера'],
  },
}

export default function ServerPage({ server = 'selectel' }) {
  const config = { ...SERVERS[server], os: SERVER_CONFIG[server].os, specs: SERVER_CONFIG[server].specs }
  const { servers, loading } = useServerStatus()
  const snapshot = servers[server]
  const data = snapshot?.metrics
  const stale = Boolean(data) && !isCurrent(snapshot)
  const connection = connectionStatus(snapshot, loading)
  const specs = [
    ['Провайдер', config.name], ['IP адрес', config.ip], ['ОС', config.os], ['Конфигурация', config.specs],
    ['Uptime', data?.uptime ?? '—'], ['CPU', data ? `${data.cpu}%` : '—'],
    ['RAM', data ? `${data.ram.used_mb} / ${data.ram.total_mb} MB (${data.ram.percent}%)` : '—'],
    ['Disk', data ? `${data.disk.used_gb} / ${data.disk.total_gb} GB (${data.disk.percent}%)` : '—'],
  ]
  const commands = [server === 'amsterdam' ? 'ssh digitalocean-443' : `ssh root@${config.ip}`, '', ...config.services.map(([name]) => `systemctl status ${name}`), '', `journalctl -u ${server === 'amsterdam' ? 'tg-poll-bot' : 'vk-poll-bot'} -n 50 --no-pager`, 'df -h /']

  return (
    <div className="page page-narrow">
      <a className="back" href="/">← Все проекты</a>
      <div className="hero">
        <div className="hero-icon">🖥️</div>
        <h1>{config.name}</h1>
        <p>{config.ip} · {config.description}</p>
        <div className={`status${connection.tone === 'ok' ? '' : ' status-pending'}`}>{connection.label}</div>
        <p className="status-time">Последнее успешное обновление: {formatTime(snapshot?.last_success_at)}</p>
        {stale && <p className="stale-note">Нет новых данных. Показатели ниже устарели.</p>}
      </div>
      <section className="section">
        <h2>Конфигурация</h2>
        <div className={`spec-grid${stale ? ' metrics-stale' : ''}`}>
          {specs.map(([label, value]) => <div className="spec-item" key={label}><div className="spec-label">{label}</div><div className="spec-value">{value}</div></div>)}
        </div>
      </section>
      <section className="section">
        <h2>Службы сервера</h2>
        <p className="section-note">Проверяется состояние systemd. Ответы ботов и работа приложений отдельно не проверяются.</p>
        <div className="service-list">
          {config.services.map(([name, description]) => <div className="service-item" key={name}>
            <div><div className="service-name">{name}</div><div className="service-meta">{description}</div></div>
            <ServiceStatus server={snapshot} name={name} loading={loading} />
          </div>)}
        </div>
      </section>
      <section className="section"><h2>Файлы и приложения</h2><pre className="code-block">{config.files.join('\n')}</pre></section>
      <section className="section"><h2>Полезные команды</h2><pre className="code-block">{commands.join('\n')}</pre></section>
    </div>
  )
}
