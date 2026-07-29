import HomePage from './pages/HomePage'
import ServerPage from './pages/ServerPage'
import BotPage from './pages/BotPage'
import MonitorPage from './pages/MonitorPage'

export default function App() {
  if (window.location.pathname === '/server.html') return <ServerPage />
  if (window.location.pathname === '/tg-poll-bot.html') return <BotPage />
  if (window.location.pathname === '/uptime-monitor.html') return <MonitorPage />
  return <HomePage />
}
