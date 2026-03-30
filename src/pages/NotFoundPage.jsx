import { useNavigate } from 'react-router-dom'
import { Receipt } from 'lucide-react'

export default function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-obsidian-950 flex flex-col items-center justify-center text-center p-6">
      <p className="font-mono text-receipt-gold text-7xl font-semibold mb-4">404</p>
      <h1 className="font-display text-2xl text-white mb-2">Page not found</h1>
      <p className="text-sm text-obsidian-500 mb-8">The page you're looking for doesn't exist.</p>
      <button className="btn-primary" onClick={() => navigate('/')}>
        <Receipt size={15} />
        Back to Dashboard
      </button>
    </div>
  )
}
