import HomePage from './pages/HomePage'
import ServerPage from './pages/ServerPage'
import BotPage from './pages/BotPage'

export default function App() {
  if (window.location.pathname === '/server.html') return <ServerPage />
  if (window.location.pathname === '/tg-poll-bot.html') return <BotPage />
  return <HomePage />
}
