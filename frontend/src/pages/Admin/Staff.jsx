import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import api from '../../api'

const EMPTY = { name:'', email:'', role:'waiter', phone:'', salary:'' }

export default function Staff() {
  const { t } = useTranslation()
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [shiftsModal, setShiftsModal] = useState(null)

  const load = () => {
    setLoading(true)
    api.get('/staff').then(r=>setStaff(r.data)).catch(()=>{}).finally(()=>setLoading(false))
  }

  useEffect(()=>{ load() }, [])

  const openCreate = () => { setEditing(null); setForm(EMPTY); setShowForm(true) }
  const openEdit = (s) => { setEditing(s._id); setForm({name:s.name,email:s.email,role:s.role,phone:s.phone||'',salary:s.salary}); setShowForm(true) }

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true)
    try{
      const payload = {...form, salary: Number(form.salary)}
      if(editing){ await api.put(`/staff/${editing}`, payload); toast.success('Updated') }
      else{ await api.post('/staff', payload); toast.success('Staff added') }
      setShowForm(false); load()
    } catch(err){ toast.error(err.response?.data?.message||'Error') }
    finally{ setSaving(false) }
  }

  const handleDelete = async (id) => {
    if(!window.confirm('Deactivate staff?')) return
    try{ await api.delete(`/staff/${id}`); toast.success('Deactivated'); load() }
    catch(err){ toast.error('Error') }
  }

  const handleClockIn = async (id) => {
    try{ await api.post(`/staff/${id}/clock-in`); toast.success('Clocked in'); load() }
    catch(err){ toast.error(err.response?.data?.message||'Error') }
  }

  const handleClockOut = async (id) => {
    try{ await api.post(`/staff/${id}/clock-out`); toast.success('Clocked out'); load() }
    catch(err){ toast.error(err.response?.data?.message||'Error') }
  }

  const openShifts = async (member) => {
    try{
      const r = await api.get(`/staff/${member._id}/shifts`)
      setShiftsModal({ member, shifts: r.data })
    } catch(err){ toast.error('Error loading shifts') }
  }

  const ROLES = ['waiter','chef','cashier','manager','cleaner','barista']

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold text-cafe-900">{t('nav.staff')}</h2>
        <button onClick={openCreate} className="btn-primary">{t('staff.addStaff')}</button>
      </div>

      {/* Shifts Modal */}
      {shiftsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-300 rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[80vh] overflow-y-auto border border-cafe-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-xl font-bold text-cafe-900">{shiftsModal.member.name} — Shifts</h3>
              <button onClick={()=>setShiftsModal(null)} className="btn-secondary btn-sm">✕</button>
            </div>
            {shiftsModal.shifts.length===0 ? (
              <p className="text-cafe-400 text-center py-6">No shifts recorded</p>
            ) : (
              <table className="w-full table-auto">
                <thead className="bg-dark-400"><tr><th>Date</th><th>Clock In</th><th>Clock Out</th><th>Hours</th></tr></thead>
                <tbody>
                  {shiftsModal.shifts.map((s,i)=>(
                    <tr key={i}>
                      <td className="text-cafe-600">{s.date}</td>
                      <td className="text-cafe-600">{new Date(s.clockIn).toLocaleTimeString()}</td>
                      <td>{s.clockOut ? <span className="text-cafe-600">{new Date(s.clockOut).toLocaleTimeString()}</span> : <span className="text-green-400 text-xs font-medium">In progress</span>}</td>
                      <td className="font-mono text-cafe-600">{s.hoursWorked?.toFixed(2)||'—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <p className="text-sm text-cafe-600 mt-4 font-medium">
              Total hours: {shiftsModal.shifts.reduce((s,sh)=>s+(sh.hoursWorked||0),0).toFixed(2)}
            </p>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-300 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-cafe-100">
            <h3 className="font-display text-xl font-bold text-cafe-900 mb-4">{editing?'Edit':t('staff.addStaff')}</h3>
            <form onSubmit={handleSave} className="space-y-3">
              <div><label className="label">{t('common.name')}</label>
                <input className="input" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required /></div>
              <div><label className="label">{t('common.email')}</label>
                <input type="email" className="input" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">{t('common.role')}</label>
                  <select className="input" value={form.role} onChange={e=>setForm({...form,role:e.target.value})}>
                    {ROLES.map(r=><option key={r} value={r}>{r}</option>)}
                  </select></div>
                <div><label className="label">{t('common.phone')}</label>
                  <input className="input" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} /></div>
              </div>
              <div><label className="label">{t('staff.salary')} (₹/month)</label>
                <input type="number" className="input" value={form.salary} onChange={e=>setForm({...form,salary:e.target.value})} min="0" /></div>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {staff.map(member=>(
            <div key={member._id} className="card hover:shadow-md hover:border-cafe-200 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-warmOrange-50 rounded-full flex items-center justify-center font-semibold text-warmOrange-600">
                    {member.name[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-cafe-900">{member.name}</p>
                    <p className="text-xs text-cafe-400">{member.email}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="badge bg-purple-900/40 text-purple-400 capitalize">{member.role}</span>
                  {member.isClockedIn && <span className="badge bg-green-900/40 text-green-400">● Active</span>}
                </div>
              </div>
              <div className="text-xs text-cafe-500 space-y-0.5 mb-3">
                {member.phone && <p>📞 {member.phone}</p>}
                {member.salary>0 && <p>💰 ₹{member.salary.toLocaleString()}/mo</p>}
                <p>Shifts: {member.shifts?.length||0}</p>
                <p>Total hrs: {(member.shifts||[]).reduce((s,sh)=>s+(sh.hoursWorked||0),0).toFixed(1)}</p>
              </div>
              <div className="flex gap-1 flex-wrap">
                {!member.isClockedIn
                  ? <button onClick={()=>handleClockIn(member._id)} className="btn-primary btn-sm text-xs">{t('staff.clockIn')}</button>
                  : <button onClick={()=>handleClockOut(member._id)} className="btn-secondary btn-sm text-xs">{t('staff.clockOut')}</button>
                }
                <button onClick={()=>openShifts(member)} className="btn-secondary btn-sm text-xs">{t('staff.shifts')}</button>
                <button onClick={()=>openEdit(member)} className="btn-secondary btn-sm text-xs">{t('common.edit')}</button>
                <button onClick={()=>handleDelete(member._id)} className="btn-danger btn-sm text-xs">{t('common.delete')}</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}