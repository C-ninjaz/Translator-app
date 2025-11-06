import { Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Home from './pages/Home.jsx'
import Random from './pages/Random.jsx'
import Translator from './pages/Translator.jsx'

export default function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container-page py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/translate" element={<Translator />} />
          <Route path="/random" element={<Random />} />
        </Routes>
      </main>
    </div>
  )
}
