import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { fetchMenu, createMenuItem, updateMenuItem, deleteMenuItem } from '../../redux/slices/menuSlice'

const CATEGORIES = ['Beverages','Snacks','Meals','Desserts','Specials']
const EMPTY = { name:'', description:'', price:'', category:'Beverages', available:true, image:'' }

export default function AdminMenu() {
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const { items, loading } = useSelector(s => s.menu)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  useEffect(() => { dispatch(fetchMenu()) }, [dispatch])

  const openCreate = () => { setEditing(null); setForm(EMPTY); setShowForm(true) }
  const openEdit = (item) => { setEditing(item._id); setForm({ ...item }); setShowForm(true) }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing) {
        await dispatch(updateMenuItem({ id: editing, ...form, price: Number(form.price) })).unwrap()
        toast.success('Item updated')
      } else {
        await dispatch(createMenuItem({ ...form, price: Number(form.price) })).unwrap()
        toast.success('Item created')
      }
      setShowForm(false)
    } catch (err) { toast.error(err) }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return
    try {
      await dispatch(deleteMenuItem(id)).unwrap()
      toast.success('Item deleted')
    } catch (err) { toast.error(err) }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold text-cafe-900">{t('nav.menu')}</h2>
        <button onClick={openCreate} className="btn-primary">{t('menu.addItem')}</button>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-300 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-cafe-100">
            <div className="p-6">
              <h3 className="font-display text-xl font-bold text-cafe-900 mb-4">
                {editing ? t('menu.editItem') : t('menu.addItem')}
              </h3>
              <form onSubmit={handleSave} className="space-y-3">
                <div><label className="label">{t('common.name')}</label>
                  <input className="input" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required /></div>
                <div><label className="label">{t('menu.description')}</label>
                  <textarea className="input resize-none" rows={2} value={form.description} onChange={e=>setForm({...form,description:e.target.value})} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="label">{t('menu.price')} (₹)</label>
                    <input type="number" className="input" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} required min="0" step="0.01" /></div>
                  <div><label className="label">{t('menu.category')}</label>
                    <select className="input" value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>
                      {CATEGORIES.map(c=><option key={c}>{c}</option>)}
                    </select></div>
                </div>
                <div><label className="label">Image URL</label>
                  <input className="input" value={form.image} onChange={e=>setForm({...form,image:e.target.value})} placeholder="https://..." /></div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="avail" checked={form.available} onChange={e=>setForm({...form,available:e.target.checked})} className="w-4 h-4 accent-forest-500" />
                  <label htmlFor="avail" className="text-sm text-cafe-600">{t('menu.available')}</label>
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="submit" disabled={saving} className="btn-primary flex-1">{saving?t('common.loading'):t('common.save')}</button>
                  <button type="button" onClick={()=>setShowForm(false)} className="btn-secondary flex-1">{t('common.cancel')}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-cafe-400">{t('common.loading')}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map(item => (
            <div key={item._id} className={`card transition-all hover:shadow-md hover:border-cafe-200 ${!item.available?'opacity-60':''}`}>
              {item.image && <img src={item.image} alt={item.name} className="w-full h-32 object-cover rounded-lg mb-3" onError={e=>e.target.style.display='none'} />}
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-cafe-900 truncate">{item.name}</h3>
                  <span className="text-xs bg-cafe-100 text-cafe-500 px-2 py-0.5 rounded-full">{item.category}</span>
                </div>
                <p className="font-bold text-forest-500 ml-2">₹{item.price}</p>
              </div>
              {item.description && <p className="text-xs text-cafe-400 mt-1 line-clamp-2">{item.description}</p>}
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${item.available?'bg-green-400':'bg-red-400'}`} />
                  <span className="text-xs text-cafe-500">{item.available?t('menu.available'):t('menu.unavailable')}</span>
                  {item.averageRating>0 && <span className="text-xs text-amber-400 ml-2">⭐{item.averageRating}</span>}
                </div>
                <div className="flex gap-1">
                  <button onClick={()=>openEdit(item)} className="btn-secondary btn-sm text-xs">{t('common.edit')}</button>
                  <button onClick={()=>handleDelete(item._id)} className="btn-danger btn-sm text-xs">{t('common.delete')}</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}