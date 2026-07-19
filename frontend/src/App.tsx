import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import WorldsPage from './pages/WorldsPage'
import EntitiesPage from './pages/EntitiesPage'
import RelationsPage from './pages/RelationsPage'
import TimelinePage from './pages/TimelinePage'
import MemoriesPage from './pages/MemoriesPage'
import RulesPage from './pages/RulesPage'
import WritingPage from './pages/WritingPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/worlds" replace />} />
        <Route element={<AppLayout />}>
          <Route path="/worlds" element={<WorldsPage />} />
          <Route path="/entities" element={<EntitiesPage />} />
          <Route path="/relations" element={<RelationsPage />} />
          <Route path="/timeline" element={<TimelinePage />} />
          <Route path="/memories" element={<MemoriesPage />} />
          <Route path="/rules" element={<RulesPage />} />
          <Route path="/writing" element={<WritingPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
