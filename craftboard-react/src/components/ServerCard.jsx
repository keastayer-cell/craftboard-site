import { connectionStatus, formatTime, isCurrent, SERVER_CONFIG } from '../status'
import ServiceStatus from './ServiceStatus'

export default function ServerCard({ id, server, loading, onDetails }) {
  const config = SERVER_CONFIG[id]
  const connection = connectionStatus(server, loading)
  const metrics = server?.metrics
  const stale = !isCurrent(server) && Boolean(metrics)
  const values = [
    ['CPU', metrics ? `${metrics.cpu}%` : '—'],
    ['Память', metrics ? `${metrics.ram.used_mb} / ${metrics.ram.total_mb} МБ` : '—'],
    ['Диск', metrics ? `${metrics.disk.used_gb} / ${metrics.disk.total_gb} ГБ` : '—'],
  ]
  const services = id === 'selectel'
    ? [['nginx', 'Сайт CraftBoard'], ['vk-poll-bot', 'VK-бот']]
    : [['tg-poll-bot', 'Telegram-бот'], ['uptime-monitor.timer', 'Проверки и алерты']]
  return <article className={`server-card${stale ? ' server-card-stale' : ''}`} data-server={id}>
    <div className="server-card-heading"><div>
      <div className="server-provider">{config.provider}</div>
      <h3>{config.name}</h3>
      <div className="server-card-ip">{config.host}</div>
    </div><span className={`badge badge-${connection.tone === 'ok' ? 'green' : 'yellow'}`}>
      {connection.label}
    </span></div>
    <p className="server-card-projects">{config.projects}</p>
    <p className="status-time">Последнее успешное обновление: <time>{formatTime(server?.last_success_at)}</time></p>
    {stale && <p className="stale-note">Нет новых данных. Показатели ниже устарели.</p>}
    <dl className={`server-metrics${stale ? ' metrics-stale' : ''}`}>
      {values.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
    </dl>
    <div className="server-card-services">{services.map(([name, label]) => <div key={name}>
      <span>{label}</span><ServiceStatus server={server} name={name} loading={loading} />
    </div>)}</div>
    <button className="server-details-link" onClick={() => onDetails(config.href)}>Подробнее о сервере →</button>
  </article>
}
