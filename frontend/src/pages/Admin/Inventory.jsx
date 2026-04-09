import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import api from '../../api'

const EMPTY = { name:'', unit:'units', currentStock:0, minimumStock:10, costPerUnit:0, supplier:'' }

export default function Inventory() {
  const { t } = useTranslation()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [restockId, setRestockId] = useState(null)
  const [restockQty, setRestockQty] = useState('')
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    api.get('/inventory').then(r=>setItems(r.data)).catch(()=>{}).finally(()=>setLoading(false))
  }

  useEffect(()=>{ load() }, [])

  const openCreate = () => { setEditing(null); setForm(EMPTY); setShowForm(true) }
  const openEdit = (item) => { setEditing(item._id); setForm({...item}); setShowForm(true) }

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      if (editing) { await api.put(`/inventory/${editing}`, form); toast.success('Updated') }
      else { await api.post('/inventory', form); toast.success('Created') }
      setShowForm(false); load()
    } catch(err){ toast.error(err.response?.data?.message||'Error') }
    finally{ setSaving(false) }
  }

  const handleDelete = async (id) => {
    if(!window.confirm('Delete?')) return
    try{ await api.delete(`/inventory/${id}`); toast.success('Deleted'); load() }
    catch(err){ toast.error('Error') }
  }

  const handleRestock = async (id) => {
    if(!restockQty||isNaN(restockQty)) return toast.error('Enter valid quantity')
    try{
      await api.post(`/inventory/${id}/restock`, { quantity: Number(restockQty) })
      toast.success('Restocked!'); setRestockId(null); setRestockQty(''); load()
    } catch(err){ toast.error('Error') }
  }

  const lowStock = items.filter(i => i.currentStock <= i.minimumStock)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold text-cafe-900">{t('nav.inventory')}</h2>
        <button onClick={openCreate} className="btn-primary">+ Add Item</button>
      </div>

      {lowStock.length > 0 && (
        <div className="bg-amber-900/20 border border-amber-700/30 rounded-xl p-4">
          <p className="font-semibold text-amber-400 text-sm mb-1">⚠️ {t('inventory.lowStock')} Alert ({lowStock.length})</p>
          <div className="flex flex-wrap gap-2">
            {lowStock.map(i=>(
              <span key={i._id} className="text-xs bg-amber-900/30 text-amber-400 px-2 py-1 rounded-lg">
                {i.name}: {i.currentStock} {i.unit}
              </span>
            ))}
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-300 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-cafe-100">
            <h3 className="font-display text-xl font-bold text-cafe-900 mb-4">{editing?'Edit':'Add'} Inventory Item</h3>
            <form onSubmit={handleSave} className="space-y-3">
              <div><label className="label">{t('common.name')}</label>
                <input className="input" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">{t('inventory.unit')}</label>
                  <input className="input" value={form.unit} onChange={e=>setForm({...form,unit:e.target.value})} /></div>
                <div><label className="label">{t('inventory.currentStock')}</label>
                  <input type="number" className="input" value={form.currentStock} onChange={e=>setForm({...form,currentStock:Number(e.target.value)})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">{t('inventory.minimumStock')}</label>
                  <input type="number" className="input" value={form.minimumStock} onChange={e=>setForm({...form,minimumStock:Number(e.target.value)})} /></div>
                <div><label className="label">Cost/Unit (₹)</label>
                  <input type="number" className="input" value={form.costPerUnit} onChange={e=>setForm({...form,costPerUnit:Number(e.target.value)})} /></div>
              </div>
              <div><label className="label">{t('inventory.supplier')}</label>
                <input className="input" value={form.supplier} onChange={e=>setForm({...form,supplier:e.target.value})} /></div>
              <div className="flex gap-2 pt-1">
                <button type="submit" disabled={saving} className="btn-primary flex-1">{saving?'...':t('common.save')}</button>
                <button type="button" onClick={()=>setShowForm(false)} className="btn-secondary flex-1">{t('common.cancel')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-cafe-400">{t('common.loading')}</div>
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full table-auto">
            <thead className="bg-dark-400 border-b border-cafe-100">
              <tr><th>{t('common.name')}</th><th>{t('inventory.currentStock')}</th><th>{t('inventory.minimumStock')}</th><th>{t('inventory.unit')}</th><th>{t('inventory.supplier')}</th><th>Cost</th><th>Status</th><th>{t('common.actions')}</th></tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item._id}>
                  <td className="font-medium text-cafe-800">{item.name}</td>
                  <td className={`font-semibold font-mono ${item.currentStock<=item.minimumStock?'text-red-400':'text-forest-500'}`}>{item.currentStock}</td>
                  <td className="text-cafe-500">{item.minimumStock}</td>
                  <td className="text-cafe-500">{item.unit}</td>
                  <td className="text-cafe-500">{item.supplier||'—'}</td>
                  <td className="text-cafe-500">₹{item.costPerUnit}</td>
                  <td>
                    {item.currentStock <= item.minimumStock
                      ? <span className="badge bg-red-900/40 text-red-400">Low</span>
                      : <span className="badge bg-green-900/40 text-green-400">OK</span>}
                  </td>
                  <td>
                    <div className="flex gap-1 flex-wrap">
                      {restockId===item._id ? (
                        <div className="flex gap-1">
                          <input type="number" className="input w-20 py-1" placeholder="Qty" value={restockQty} onChange={e=>setRestockQty(e.target.value)} />
                          <button onClick={()=>handleRestock(item._id)} className="btn-primary btn-sm text-xs">{t('inventory.restock')}</button>
                          <button onClick={()=>setRestockId(null)} className="btn-secondary btn-sm text-xs">✕</button>
                        </div>
                      ) : (
                        <button onClick={()=>setRestockId(item._id)} className="btn-secondary btn-sm text-xs">+Stock</button>
                      )}
                      <button onClick={()=>openEdit(item)} className="btn-secondary btn-sm text-xs">{t('common.edit')}</button>
                      <button onClick={()=>handleDelete(item._id)} className="btn-danger btn-sm text-xs">{t('common.delete')}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}