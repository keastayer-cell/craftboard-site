import { connectionStatus, formatTime, SERVER_CONFIG } from '../status'

export default function ServerBadge({ id, server, loading, onDetails }) {
  const config = SERVER_CONFIG[id]
  const connection = connectionStatus(server, loading)
  return <button className="server-badge" data-server={id}
    title={`${connection.label}. Данные: ${formatTime(server?.last_success_at)}`}
    onClick={() => onDetails(config.href)}>
    <div className="server-badge-title">🖥 ServerConfig · {id === 'selectel' ? 'Selectel' : 'DigitalOcean'}</div>
    <div className="server-badge-row">{config.os}{id === 'amsterdam' ? ' · Амстердам' : ''}</div>
    <div className="server-badge-row">{id === 'selectel' ? '2 vCPU · 2 GB RAM' : '1 vCPU · 1 GB RAM'}</div>
    <div className="server-badge-row server-badge-ip">{config.host}</div>
    <div className="server-badge-projects">
      {id === 'selectel'
        ? <><span>CraftBoard · VK-бот</span><span>BG Foot · тест</span><span>Efgen Bosh · тест</span></>
        : <><span>Telegram Poll Bot</span><span>Uptime Monitor</span></>}
    </div>
  </button>
}
