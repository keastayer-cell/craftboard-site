import { Navigate, Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage'
import ServerPage from './pages/ServerPage'
import BotPage from './pages/BotPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/index.html" element={<Navigate to="/" replace />} />
      <Route path="/server.html" element={<ServerPage />} />
      <Route path="/tg-poll-bot.html" element={<BotPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
