import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend
} from 'chart.js'
import { Bar, Line, Doughnut } from 'react-chartjs-2'
import api from '../../api'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend)

// Dark warm palette
const CHART_COLORS = ['#40916c','#52b788','#74c69d','#c47a45','#e09660','#f0b078','#95d5b2']

export default function Analytics() {
  const { t } = useTranslation()
  const [stats, setStats] = useState(null)
  const [sales, setSales] = useState([])
  const [popular, setPopular] = useState([])
  const [revByCategory, setRevByCategory] = useState([])
  const [period, setPeriod] = useState('week')
  const [loading, setLoading] = useState(true)

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [s, sl, p, rc] = await Promise.all([
        api.get('/analytics/stats'),
        api.get(`/analytics/sales?period=${period}`),
        api.get('/analytics/popular'),
        api.get('/analytics/revenue-by-category'),
      ])
      setStats(s.data)
      setSales(sl.data)
      setPopular(p.data)
      setRevByCategory(rc.data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchAll() }, [period])

  const StatCard = ({ label, value, icon, color }) => (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-cafe-500 font-medium">{label}</p>
          <p className={`text-3xl font-bold font-display mt-1 ${color}`}>{value}</p>
        </div>
        <div className="text-4xl opacity-40">{icon}</div>
      </div>
    </div>
  )

  const darkChartDefaults = {
    color: '#a89888',
    borderColor: '#2a2724',
  }

  const salesChart = {
    labels: sales.map(s => s._id),
    datasets: [{
      label: 'Revenue (₹)',
      data: sales.map(s => s.revenue),
      backgroundColor: 'rgba(64, 145, 108, 0.15)',
      borderColor: '#40916c',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
    }]
  }

  const ordersChart = {
    labels: sales.map(s => s._id),
    datasets: [{
      label: 'Orders',
      data: sales.map(s => s.count),
      backgroundColor: '#c47a45',
      borderRadius: 6,
    }]
  }

  const popularChart = {
    labels: popular.slice(0, 6).map(i => i.name),
    datasets: [{
      data: popular.slice(0, 6).map(i => i.totalQuantity),
      backgroundColor: CHART_COLORS,
      borderWidth: 0,
    }]
  }

  const categoryChart = {
    labels: revByCategory.map(c => c._id || 'Unknown'),
    datasets: [{
      label: 'Revenue (₹)',
      data: revByCategory.map(c => c.revenue),
      backgroundColor: CHART_COLORS,
      borderRadius: 6,
    }]
  }

  const chartOpts = (title) => ({
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      y: { grid: { color: '#2a2724' }, ticks: { color: '#8a7e72' } },
      x: { grid: { display: false }, ticks: { color: '#8a7e72' } },
    },
  })

  if (loading) return <div className="text-center py-16 text-cafe-400">{t('common.loading')}</div>

  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label={t('analytics.totalRevenue')} value={`₹${(stats?.totalRevenue || 0).toLocaleString()}`} icon="💰" color="text-forest-500" />
        <StatCard label={t('analytics.todayRevenue')} value={`₹${(stats?.todayRevenue || 0).toLocaleString()}`} icon="📈" color="text-blue-400" />
        <StatCard label={t('analytics.totalOrders')} value={stats?.totalOrders || 0} icon="📋" color="text-cafe-800" />
        <StatCard label={t('analytics.todayOrders')} value={stats?.todayOrders || 0} icon="🛎️" color="text-warmOrange-600" />
        <StatCard label={t('analytics.totalCustomers')} value={stats?.totalUsers || 0} icon="👥" color="text-purple-400" />
        <StatCard label="Active Menu Items" value={stats?.menuCount || 0} icon="🍽️" color="text-cafe-700" />
      </div>

      {/* Period filter */}
      <div className="flex gap-2">
        {[['week', t('analytics.week')], ['month', t('analytics.month')], ['year', t('analytics.year')]].map(([val, lbl]) => (
          <button key={val} onClick={() => setPeriod(val)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${period === val ? 'bg-forest-500 text-white' : 'bg-dark-300 text-cafe-500 hover:bg-cafe-100 border border-cafe-200'}`}>
            {lbl}
          </button>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-display font-semibold text-cafe-800 mb-4">{t('analytics.salesChart')}</h3>
          <Line data={salesChart} options={chartOpts('Sales')} />
        </div>
        <div className="card">
          <h3 className="font-display font-semibold text-cafe-800 mb-4">Orders per Day</h3>
          <Bar data={ordersChart} options={chartOpts('Orders')} />
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-display font-semibold text-cafe-800 mb-4">{t('analytics.popularItems')}</h3>
          {popular.length > 0 ? (
            <Doughnut data={popularChart} options={{ responsive: true, plugins: { legend: { position: 'right', labels: { color: '#a89888' } } } }} />
          ) : <p className="text-cafe-400 text-center py-8">No data yet</p>}
        </div>
        <div className="card">
          <h3 className="font-display font-semibold text-cafe-800 mb-4">{t('analytics.revenueByCategory')}</h3>
          {revByCategory.length > 0 ? (
            <Bar data={categoryChart} options={{ ...chartOpts('Category'), indexAxis: 'y' }} />
          ) : <p className="text-cafe-400 text-center py-8">No data yet</p>}
        </div>
      </div>

      {/* Popular items table */}
      {popular.length > 0 && (
        <div className="card overflow-hidden">
          <h3 className="font-display font-semibold text-cafe-800 mb-4">{t('analytics.popularItems')} — Top 10</h3>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead className="bg-dark-400">
                <tr>
                  <th>#</th><th>Item</th><th>Qty Sold</th><th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {popular.map((item, i) => (
                  <tr key={i}>
                    <td className="font-mono text-cafe-400">{i + 1}</td>
                    <td className="font-medium text-cafe-800">{item.name}</td>
                    <td className="text-cafe-600">{item.totalQuantity}</td>
                    <td className="font-semibold text-forest-500">₹{item.totalRevenue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}