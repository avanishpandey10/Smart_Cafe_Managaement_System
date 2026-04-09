import { useState, useEffect } from 'react'

export default function KitchenTimer({ approvedAt }) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!approvedAt) return
    const start = new Date(approvedAt).getTime()
    const update = () => setElapsed(Math.floor((Date.now() - start) / 1000))
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [approvedAt])

  const mins = Math.floor(elapsed / 60)
  const secs = elapsed % 60
  const isWarning = mins >= 10
  const isDanger = mins >= 20

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-semibold ${
      isDanger ? 'bg-red-900/40 text-red-400' :
      isWarning ? 'bg-orange-900/40 text-orange-400' :
      'bg-green-900/40 text-green-400'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${isDanger ? 'bg-red-500' : isWarning ? 'bg-orange-500' : 'bg-green-500'} animate-pulse`} />
      {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
    </div>
  )
}