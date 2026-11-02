import { useEffect, useState } from 'react'

export default function VkBotPage() {
  const [state, setState] = useState('unknown')
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const response = await fetch('/api/status', { cache: 'no-store' })
        if (!response.ok) throw new Error('Нет данных')
        const data = await response.json()
        if (!cancelled) setState(data.services?.['vk-poll-bot'] || 'unknown')
      } catch { if (!cancelled) setState('unknown') }
    }
    load()
    const timer = setInterval(load, 30000)
    return () => { cancelled = true; clearInterval(timer) }
  }, [])
  return <div className="page page-narrow">
    <a className="back" href="/">← Все проекты</a>
    <div className="hero">
      <div className="hero-icon">💬</div><h1>VK Poll Bot</h1>
      <p>Бот для записи на игру и опросов в беседе ВКонтакте.</p>
      <div className={state === 'active' ? 'status' : state === 'unknown' ? 'status status-pending' : 'status status-down'}>
        {state === 'active' ? 'Работает на сервере' : state === 'unknown' ? 'Статус временно недоступен' : 'Сервис остановлен'}
      </div>
      <div className="service-meta">Selectel · 139.100.237.243</div>
    </div>
    <section className="section"><h2>Возможности</h2>
      <p>Опросы с кнопками голосования, приглашённые через +1, напоминания, рейтинги игроков и распределение по командам.</p>
    </section>
    <section className="section"><h2>Основные команды</h2>
      <table className="server-table"><thead><tr><th>Команда</th><th>Действие</th></tr></thead><tbody>
        <tr><td>/status</td><td>Текущий состав</td></tr>
        <tr><td>/poll</td><td>Создать опрос (администратор)</td></tr>
        <tr><td>/close</td><td>Закрыть опрос (администратор)</td></tr>
        <tr><td>+1 ФИО</td><td>Записать приглашённого</td></tr>
      </tbody></table>
    </section>
    <section className="section"><h2>Сервер</h2><p><a href="/server-selectel.html">Selectel · сервис vk-poll-bot · /opt/vk-poll-bot/</a></p></section>
  </div>
}
