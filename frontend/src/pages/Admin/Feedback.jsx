import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'

const EXPORTS = [
  { key: 'orders', label: 'Orders', icon: '📋', description: 'All orders with customer details, items, amounts, and status' },
  { key: 'menu', label: 'Menu Items', icon: '🍽️', description: 'Full menu with categories, pricing, and ratings' },
  { key: 'inventory', label: 'Inventory', icon: '📦', description: 'Stock levels, suppliers, and restock history' },
  { key: 'staff', label: 'Staff', icon: '👥', description: 'Staff roster with roles, shifts, and hours worked' },
]

export default function Exports() {
  const { t } = useTranslation()
  const [downloading, setDownloading] = useState(null)

  const handleExport = async (key) => {
    setDownloading(key)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/export/${key}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!response.ok) throw new Error('Export failed')
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${key}_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
      toast.success(`${key} exported successfully!`)
    } catch (err) {
      toast.error('Export failed')
    } finally {
      setDownloading(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold text-cafe-900">{t('nav.exports')}</h2>
        <p className="text-sm text-cafe-400">Download data as CSV files</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {EXPORTS.map(exp => (
          <div key={exp.key} className="card hover:shadow-md hover:border-cafe-200 transition-all group">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-dark-400 rounded-xl flex items-center justify-center text-3xl group-hover:bg-warmOrange-50 transition-colors flex-shrink-0">
                {exp.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-display font-semibold text-cafe-900">{exp.label}</h3>
                <p className="text-sm text-cafe-500 mt-1">{exp.description}</p>
                <button
                  onClick={() => handleExport(exp.key)}
                  disabled={downloading === exp.key}
                  className="btn-primary btn-sm mt-3"
                >
                  {downloading === exp.key ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Exporting...
                    </span>
                  ) : `⬇ Export ${exp.label} CSV`}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card bg-dark-400 border-cafe-200">
        <h3 className="font-semibold text-cafe-700 mb-2">💡 Export Notes</h3>
        <ul className="text-sm text-cafe-500 space-y-1 list-disc list-inside">
          <li>All exports are in CSV format, compatible with Excel and Google Sheets</li>
          <li>Data is exported in real-time from the current database</li>
          <li>Orders export includes full item details and payment information</li>
          <li>Staff export includes total hours worked across all shifts</li>
        </ul>
      </div>
    </div>
  )
}