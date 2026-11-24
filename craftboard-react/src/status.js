export const SERVER_CONFIG = {
  selectel: {
    name: 'Сайт и VK-бот', provider: 'Selectel', host: '139.100.237.243',
    href: '/server-selectel.html', os: 'Ubuntu 24.04 LTS', specs: '2 vCPU · 2 GB RAM · 40 GB',
    projects: 'CraftBoard · VK-бот · тестовые BG Foot и Efgen Bosh',
  },
  amsterdam: {
    name: 'Telegram-бот', provider: 'DigitalOcean · Амстердам', host: '178.62.199.241',
    href: '/server-amsterdam.html', os: 'Ubuntu 26.04.1 LTS', specs: '1 vCPU · 1 GB RAM · 25 GB',
    projects: 'Telegram Poll Bot · Uptime Monitor',
  },
}

export function isCurrent(server, now = Date.now()) {
  const age = now / 1000 - server?.last_success_at
  return server?.connection === 'ok' && !server.stale &&
    Number.isFinite(server.last_success_at) && age >= -30 && age <= 90
}

export function serviceStatus(server, name, loading = false) {
  if (loading) return { label: 'Получаем данные…', tone: 'pending' }
  if (!isCurrent(server)) return { label: 'Нет связи с сервером', tone: 'pending' }
  const state = server.services?.[name]
  if (state === 'active') return { label: 'Служба запущена', tone: 'ok' }
  if (state === 'inactive') return { label: 'Служба остановлена', tone: 'down' }
  if (state === 'failed') return { label: 'Ошибка службы', tone: 'down' }
  if (state === 'activating' || state === 'reloading') return { label: 'Служба запускается', tone: 'pending' }
  if (state === 'deactivating') return { label: 'Служба останавливается', tone: 'pending' }
  return { label: 'Нет данных о службе', tone: 'pending' }
}

export function connectionStatus(server, loading = false) {
  if (loading) return { label: 'Получаем данные…', tone: 'pending' }
  return isCurrent(server)
    ? { label: 'Связь с сервером есть', tone: 'ok' }
    : { label: 'Нет связи с сервером', tone: 'pending' }
}

export function formatTime(timestamp) {
  if (!Number.isFinite(timestamp)) return 'Ещё не получено'
  return new Date(timestamp * 1000).toLocaleString('ru-RU', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
}

export function markUnavailable(servers = {}) {
  return Object.fromEntries(Object.entries(servers).map(([id, server]) => [id, {
    ...server, connection: 'unavailable', stale: Boolean(server.metrics),
  }]))
}
