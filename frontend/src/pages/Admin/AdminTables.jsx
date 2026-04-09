import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import api from '../../api'

export default function AdminTables() {
  const { t } = useTranslation()
  const [tables, setTables] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ tableNumber: '', capacity: 4 })
  const [saving, setSaving] = useState(false)
  const [qrModal, setQrModal] = useState(null)

  const load = () => {
    setLoading(true)
    api.get('/tables').then(r => setTables(r.data)).catch(()=>{}).finally(()=>setLoading(false))
  }

  useEffect(()=>{ load() }, [])

  const handleCreate = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await api.post('/tables', { tableNumber: Number(form.tableNumber), capacity: Number(form.capacity) })
      toast.success('Table created'); setShowForm(false); setForm({tableNumber:'',capacity:4}); load()
    } catch(err){ toast.error(err.response?.data?.message||'Error') }
    finally{ setSaving(false) }
  }

  const handleDelete = async (id) => {
    if(!window.confirm('Delete table?')) return
    try{ await api.delete(`/tables/${id}`); toast.success('Deleted'); load() }
    catch(err){ toast.error(err.response?.data?.message||'Error') }
  }

  const handleRegenQR = async (id) => {
    try{ await api.post(`/tables/${id}/qr`); toast.success('QR regenerated'); load() }
    catch(err){ toast.error('Error') }
  }

  const STATUS_COLOR = { available:'bg-green-900/40 text-green-400', occupied:'bg-red-900/40 text-red-400', reserved:'bg-yellow-900/40 text-yellow-400' }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold text-cafe-900">{t('nav.tables')}</h2>
        <button onClick={()=>setShowForm(true)} className="btn-primary">+ Add Table</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-300 rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-cafe-100">
            <h3 className="font-display text-xl font-bold text-cafe-900 mb-4">Add Table</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div><label className="label">{t('table.tableNumber')}</label>
                <input type="number" className="input" value={form.tableNumber} onChange={e=>setForm({...form,tableNumber:e.target.value})} required min="1" /></div>
              <div><label className="label">{t('table.capacity')}</label>
                <input type="number" className="input" value={form.capacity} onChange={e=>setForm({...form,capacity:e.target.value})} required min="1" /></div>
              <div className="flex gap-2 pt-1">
                <button type="submit" disabled={saving} className="btn-primary flex-1">{saving?'...':t('common.save')}</button>
                <button type="button" onClick={()=>setShowForm(false)} className="btn-secondary flex-1">{t('common.cancel')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {qrModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={()=>setQrModal(null)}>
          <div className="bg-dark-300 rounded-2xl shadow-2xl p-6 text-center max-w-xs border border-cafe-100" onClick={e=>e.stopPropagation()}>
            <h3 className="font-display text-lg font-bold text-cafe-900 mb-1">Table {qrModal.tableNumber}</h3>
            <p className="text-cafe-400 text-xs mb-4">{t('table.scanToOrder')}</p>
            {qrModal.qrCode ? (
              <img src={qrModal.qrCode} alt="QR Code" className="w-48 h-48 mx-auto border border-cafe-200 rounded-lg" />
            ) : <p className="text-cafe-400 py-8">No QR code generated</p>}
            <button onClick={()=>handleRegenQR(qrModal._id)} className="btn-secondary btn-sm mt-4 w-full">↻ Regenerate QR</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-cafe-400">{t('common.loading')}</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {tables.map(table => (
            <div key={table._id} className="card text-center hover:shadow-md hover:border-cafe-200 transition-all">
              <div className="text-4xl mb-2">🪑</div>
              <p className="font-display font-bold text-2xl text-cafe-900">T{table.tableNumber}</p>
              <p className="text-xs text-cafe-400">Cap: {table.capacity}</p>
              <span className={`badge mt-2 ${STATUS_COLOR[table.status]}`}>{table.status}</span>
              <div className="flex gap-1 mt-3 flex-col">
                <button onClick={()=>setQrModal(table)} className="btn-secondary btn-sm text-xs w-full">📷 {t('table.qrCode')}</button>
                <button onClick={()=>handleDelete(table._id)} className="btn-danger btn-sm text-xs w-full">{t('common.delete')}</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}