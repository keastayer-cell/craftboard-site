import { serviceStatus } from '../status'

export default function ServiceStatus({ server, name, loading }) {
  const { label, tone } = serviceStatus(server, name, loading)
  return <span className={`badge badge-${tone === 'ok' ? 'green' : tone === 'down' ? 'red' : 'yellow'}`}>
    {label}
  </span>
}
