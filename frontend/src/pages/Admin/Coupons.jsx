import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import api from '../../api'

const today = new Date().toISOString().split('T')[0]
const EMPTY = { code:'', discountType:'percentage', discountValue:'', minOrderAmount:0, maxDiscount:'', usageLimit:'', validFrom:today, validUntil:'', active:true }

export default function Coupons() {
  const { t } = useTranslation()
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    api.get('/coupons').then(r=>setCoupons(r.data)).catch(()=>{}).finally(()=>setLoading(false))
  }

  useEffect(()=>{ load() }, [])

  const openCreate = () => { setEditing(null); setForm(EMPTY); setShowForm(true) }
  const openEdit = (c) => { setEditing(c._id); setForm({...c, maxDiscount:c.maxDiscount||'', usageLimit:c.usageLimit||''}); setShowForm(true) }

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true)
    const payload = {
      ...form,
      discountValue: Number(form.discountValue),
      minOrderAmount: Number(form.minOrderAmount),
      maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
      usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
    }
    try{
      if(editing){ await api.put(`/coupons/${editing}`, payload); toast.success('Updated') }
      else{ await api.post('/coupons', payload); toast.success('Created') }
      setShowForm(false); load()
    } catch(err){ toast.error(err.response?.data?.message||'Error') }
    finally{ setSaving(false) }
  }

  const handleDelete = async (id) => {
    if(!window.confirm('Delete coupon?')) return
    try{ await api.delete(`/coupons/${id}`); toast.success('Deleted'); load() }
    catch(err){ toast.error('Error') }
  }

  const toggleActive = async (c) => {
    try{ await api.put(`/coupons/${c._id}`, { active: !c.active }); load() }
    catch(err){ toast.error('Error') }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold text-cafe-900">{t('nav.coupons')}</h2>
        <button onClick={openCreate} className="btn-primary">+ Add Coupon</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-300 rounded-2xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto border border-cafe-100">
            <h3 className="font-display text-xl font-bold text-cafe-900 mb-4">{editing?'Edit':'Add'} Coupon</h3>
            <form onSubmit={handleSave} className="space-y-3">
              <div><label className="label">{t('coupon.code')}</label>
                <input className="input uppercase" value={form.code} onChange={e=>setForm({...form,code:e.target.value.toUpperCase()})} required placeholder="e.g. SAVE20" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">{t('coupon.discountType')}</label>
                  <select className="input" value={form.discountType} onChange={e=>setForm({...form,discountType:e.target.value})}>
                    <option value="percentage">{t('coupon.percentage')}</option>
                    <option value="fixed">{t('coupon.fixed')}</option>
                  </select></div>
                <div><label className="label">{t('coupon.discountValue')}</label>
                  <input type="number" className="input" value={form.discountValue} onChange={e=>setForm({...form,discountValue:e.target.value})} required min="0" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">{t('coupon.minOrder')} (₹)</label>
                  <input type="number" className="input" value={form.minOrderAmount} onChange={e=>setForm({...form,minOrderAmount:e.target.value})} min="0" /></div>
                <div><label className="label">{t('coupon.maxDiscount')} (₹)</label>
                  <input type="number" className="input" value={form.maxDiscount} onChange={e=>setForm({...form,maxDiscount:e.target.value})} placeholder="Optional" min="0" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">{t('coupon.validFrom')}</label>
                  <input type="date" className="input" value={form.validFrom} onChange={e=>setForm({...form,validFrom:e.target.value})} required /></div>
                <div><label className="label">{t('coupon.validUntil')}</label>
                  <input type="date" className="input" value={form.validUntil} onChange={e=>setForm({...form,validUntil:e.target.value})} required /></div>
              </div>
              <div><label className="label">{t('coupon.usageLimit')}</label>
                <input type="number" className="input" value={form.usageLimit} onChange={e=>setForm({...form,usageLimit:e.target.value})} placeholder="Optional (leave blank for unlimited)" min="1" /></div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="active" checked={form.active} onChange={e=>setForm({...form,active:e.target.checked})} className="w-4 h-4 accent-forest-500" />
                <label htmlFor="active" className="text-sm text-cafe-600">Active</label>
              </div>
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
      ) : coupons.length===0 ? (
        <div className="card text-center py-12 text-cafe-400">{t('common.noData')}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {coupons.map(c=>(
            <div key={c._id} className={`card hover:shadow-md transition-all border-2 ${c.active?'border-cafe-100':'border-dashed border-cafe-200 opacity-60'}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-mono font-bold text-xl text-warmOrange-600">{c.code}</p>
                  <p className="text-sm text-forest-500 font-semibold mt-0.5">
                    {c.discountType==='percentage' ? `${c.discountValue}% off` : `₹${c.discountValue} off`}
                  </p>
                </div>
                <button onClick={()=>toggleActive(c)}
                  className={`text-xs px-2 py-1 rounded-full transition-all ${c.active?'bg-green-900/40 text-green-400':'bg-neutral-800 text-neutral-500'}`}>
                  {c.active?'Active':'Inactive'}
                </button>
              </div>
              <div className="text-xs text-cafe-500 space-y-0.5">
                {c.minOrderAmount>0 && <p>Min order: ₹{c.minOrderAmount}</p>}
                {c.maxDiscount && <p>Max discount: ₹{c.maxDiscount}</p>}
                <p>Valid: {new Date(c.validFrom).toLocaleDateString()} – {new Date(c.validUntil).toLocaleDateString()}</p>
                <p>Used: {c.usedCount}{c.usageLimit ? `/${c.usageLimit}` : ' (unlimited)'}</p>
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={()=>openEdit(c)} className="btn-secondary btn-sm text-xs flex-1">{t('common.edit')}</button>
                <button onClick={()=>handleDelete(c._id)} className="btn-danger btn-sm text-xs flex-1">{t('common.delete')}</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}