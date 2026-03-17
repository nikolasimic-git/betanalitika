import { useToast } from '../contexts/ToastContext'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'

const styles = {
  success: { bg: 'bg-green-600/90', icon: <CheckCircle className="h-5 w-5" /> },
  error: { bg: 'bg-red-600/90', icon: <XCircle className="h-5 w-5" /> },
  warning: { bg: 'bg-yellow-500/90', icon: <AlertTriangle className="h-5 w-5" /> },
  info: { bg: 'bg-blue-500/90', icon: <Info className="h-5 w-5" /> },
}

export default function ToastContainer() {
  const { toasts, removeToast } = useToast()

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => {
        const s = styles[toast.type]
        return (
          <div
            key={toast.id}
            className={`${s.bg} pointer-events-auto flex items-center gap-3 rounded-lg px-4 py-3 text-white text-sm shadow-lg backdrop-blur-sm transition-all duration-300 ${
              toast.leaving ? 'opacity-0 translate-x-full' : 'animate-slide-in-right'
            }`}
          >
            {s.icon}
            <span className="flex-1">{toast.message}</span>
            <button onClick={() => removeToast(toast.id)} className="shrink-0 opacity-70 hover:opacity-100">
              <X className="h-4 w-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
