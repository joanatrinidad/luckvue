import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import PlayerPage from './pages/PlayerPage'
import CategoryPage from './pages/CategoryPage'
import ShowPage from './pages/ShowPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/category/:name" element={<CategoryPage />} />
        <Route path="/show/tv/:id" element={<ShowPage />} />
        <Route path="/player/:type/:id" element={<PlayerPage />} />
      </Routes>
    </BrowserRouter>
  )
}
