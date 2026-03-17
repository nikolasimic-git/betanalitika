import { Link } from 'react-router-dom'
import { MapPinOff, Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <div className="animate-fade-in">
        <MapPinOff className="mx-auto h-16 w-16 text-muted mb-6" />
        <h1 className="text-6xl font-bold text-accent mb-4">404</h1>
        <h2 className="text-xl font-bold mb-2">Stranica nije pronađena</h2>
        <p className="text-muted mb-8">
          Izgleda da si zalutao... Ova stranica ne postoji ili je premeštena.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-darker hover:bg-accent-dim"
        >
          <Home className="h-4 w-4" /> Vrati se na početnu
        </Link>
      </div>
    </div>
  )
}
