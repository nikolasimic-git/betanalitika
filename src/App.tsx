import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './auth'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Landing from './pages/Landing'
import Picks from './pages/Picks'
import History from './pages/History'
import Pricing from './pages/Pricing'
import Login from './pages/Login'
import Admin from './pages/Admin'

export default function App() {
  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/picks" element={<Picks />} />
            <Route path="/history" element={<History />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  )
}
