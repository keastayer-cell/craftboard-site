import VkBotPage from './pages/VkBotPage'
import HomePage from './pages/HomePage'
import ServerPage from './pages/ServerPage'
import BotPage from './pages/BotPage'
import MonitorPage from './pages/MonitorPage'

export default function App() {
  if (['/server.html', '/server-selectel.html'].includes(window.location.pathname)) return <ServerPage server="selectel" />
  if (window.location.pathname === '/server-amsterdam.html') return <ServerPage server="amsterdam" />
  if (window.location.pathname === '/vk-poll-bot.html') return <VkBotPage />
  if (window.location.pathname === '/tg-poll-bot.html') return <BotPage />
  if (window.location.pathname === '/uptime-monitor.html') return <MonitorPage />
  return <HomePage />
}
