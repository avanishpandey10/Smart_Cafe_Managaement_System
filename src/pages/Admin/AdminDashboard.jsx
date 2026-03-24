import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getPendingOrders, approveOrder } from '../../redux/slices/orderSlice';
import { getMenuItems, createMenuItem} from '../../redux/slices/menuSlice';
import axios from 'axios';
import toast from 'react-hot-toast';

// ── tiny shared helpers ──────────────────────────────────────────────
const labelStyle = {
    display: 'block', fontSize: '0.75rem', fontWeight: 600,
    color: 'var(--text-secondary)', textTransform: 'uppercase',
    letterSpacing: '0.07em', marginBottom: 6,
};
const inputStyle = {
    width: '100%', padding: '9px 12px',
    border: '1px solid var(--border)', borderRadius: 9,
    fontSize: '0.875rem', fontFamily: 'inherit',
    background: 'var(--bg-base)', color: 'var(--text-primary)', outline: 'none',
};
const btnPrimary = {
    background: 'var(--accent)', color: '#fff', border: 'none',
    borderRadius: 9, padding: '9px 20px', fontFamily: 'inherit',
    fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
};
const btnDanger = {
    background: 'transparent', color: 'var(--danger)',
    border: '1px solid var(--danger)', borderRadius: 8,
    padding: '5px 12px', fontFamily: 'inherit',
    fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
};
const card = {
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 14, padding: '1.5rem', boxShadow: 'var(--shadow-sm)',
};

const TABS = ['Orders', 'Menu', 'Tables'];

const categoryColors = {
    starter:  { bg: '#5A7A8A22', text: '#2A5A6A', border: '#5A7A8A55' },
    main:     { bg: '#C8A96E22', text: '#8A6830', border: '#C8A96E55' },
    dessert:  { bg: '#C06444AA', text: '#7A3020', border: '#C0644455' },
    beverage: { bg: '#5A8A6A22', text: '#2A6A4A', border: '#5A8A6A55' },
};
const tableStatusColors = {
    available: { bg: '#5A8A6A22', text: '#2A6A4A', border: '#5A8A6A55' },
    occupied:  { bg: '#C8A96E22', text: '#8A6830', border: '#C8A96E55' },
    reserved:  { bg: '#5A7A8A22', text: '#2A5A6A', border: '#5A7A8A55' },
};

// ── Spinner ──────────────────────────────────────────────────────────
const Spinner = ({ label }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '40vh', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ width: 34, height: 34, border: '3px solid var(--accent-muted)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{label}</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
);

// ════════════════════════════════════════════════════════════════════
// ORDERS TAB
// ════════════════════════════════════════════════════════════════════
const OrdersTab = () => {
    const dispatch = useDispatch();
    const { pendingOrders, isLoading } = useSelector((state) => state.orders);

    useEffect(() => { dispatch(getPendingOrders()); }, [dispatch]);

    const handleApprove = async (orderId) => {
        const result = await dispatch(approveOrder(orderId));
        if (result.payload) toast.success('Order approved — sent to kitchen!');
    };

    if (isLoading) return <Spinner label="Loading pending orders…" />;

    return (
        <>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '1.75rem' }}>
                {[
                    { label: 'Pending Orders', value: pendingOrders.length, color: 'var(--accent)' },
                    { label: 'Total Items',    value: pendingOrders.reduce((a, o) => a + o.items.length, 0), color: 'var(--info)' },
                    { label: 'Total Value',    value: `₹${pendingOrders.reduce((a, o) => a + o.totalAmount, 0)}`, color: 'var(--success)' },
                ].map(s => (
                    <div key={s.label} style={card}>
                        <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 0.35rem' }}>{s.label}</p>
                        <p style={{ fontFamily: "'DM Serif Display',serif", fontSize: '1.7rem', color: s.color, margin: 0, lineHeight: 1 }}>{s.value}</p>
                    </div>
                ))}
            </div>

            <div style={card}>
                <h2 style={{ fontSize: '1.3rem', marginBottom: '1.25rem' }}>Pending Orders</h2>
                {pendingOrders.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                        <p style={{ fontSize: '1.8rem', margin: '0 0 0.5rem' }}>✓</p>
                        <p style={{ fontFamily: "'DM Serif Display',serif", color: 'var(--text-primary)' }}>All caught up!</p>
                        <p style={{ fontSize: '0.875rem' }}>No pending orders right now.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                        {pendingOrders.map(order => (
                            <div key={order._id} style={{ border: '1px solid var(--border)', borderRadius: 12, padding: '1.1rem', background: 'var(--bg-base)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                                    <div>
                                        <p style={{ fontFamily: "'DM Serif Display',serif", fontSize: '1.05rem', margin: '0 0 0.3rem' }}>
                                            Order #{order._id.slice(-6).toUpperCase()}
                                        </p>
                                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: '2px 0' }}>
                                            Table {order.tableNumber} · {order.user?.name || 'Guest'}
                                        </p>
                                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', margin: '2px 0' }}>
                                            {new Date(order.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ fontFamily: "'DM Serif Display',serif", fontSize: '1.5rem', color: 'var(--accent)', margin: '0 0 0.4rem' }}>₹{order.totalAmount}</p>
                                        <button onClick={() => handleApprove(order._id)} style={{ ...btnPrimary, boxShadow: '0 2px 8px #C8A96E33' }}>
                                            Approve →
                                        </button>
                                    </div>
                                </div>
                                <div style={{ marginTop: '0.9rem', paddingTop: '0.9rem', borderTop: '1px solid var(--border)' }}>
                                    {order.items.map((item, idx) => (
                                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)', padding: '2px 0' }}>
                                            <span>{item.quantity}× {item.name}</span>
                                            <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>₹{item.price * item.quantity}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};

// ════════════════════════════════════════════════════════════════════
// MENU TAB
// ════════════════════════════════════════════════════════════════════
const emptyMenuForm = { name: '', description: '', price: '', category: 'starter' };

const MenuTab = () => {
    const dispatch = useDispatch();
    const { items, isLoading } = useSelector((state) => state.menu);
    const { user } = useSelector((state) => state.auth);
    const [form, setForm] = useState(emptyMenuForm);
    const [submitting, setSubmitting] = useState(false);
    const [filterCat, setFilterCat] = useState('all');

    useEffect(() => { dispatch(getMenuItems()); }, [dispatch]);

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!form.name || !form.price) { toast.error('Name and price are required'); return; }
        setSubmitting(true);
        const result = await dispatch(createMenuItem({ ...form, price: Number(form.price) }));
        setSubmitting(false);
        if (result.payload?._id) { toast.success('Menu item added!'); setForm(emptyMenuForm); }
        else toast.error('Failed to add item');
    };

    const handleDelete = async (id) => {
        const result = await dispatch(deleteMenuItem(id));
        if (result.payload?.message === 'Menu item removed') toast.success('Item removed');
        else toast.error('Could not remove item');
    };

    const categories = ['all', 'starter', 'main', 'dessert', 'beverage'];
    const filtered = filterCat === 'all' ? items : items.filter(i => i.category === filterCat);

    if (isLoading) return <Spinner label="Loading menu…" />;

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'start' }}>
            {/* Left — list */}
            <div>
                {/* Category filter */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                    {categories.map(cat => (
                        <button key={cat} onClick={() => setFilterCat(cat)} style={{
                            padding: '5px 14px', borderRadius: 20, border: '1px solid var(--border)',
                            fontFamily: 'inherit', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer',
                            textTransform: 'capitalize',
                            background: filterCat === cat ? 'var(--accent)' : 'var(--bg-card)',
                            color: filterCat === cat ? '#fff' : 'var(--text-secondary)',
                        }}>{cat}</button>
                    ))}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {filtered.length === 0 && (
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', padding: '2rem', textAlign: 'center' }}>No items in this category.</p>
                    )}
                    {filtered.map(item => {
                        const cc = categoryColors[item.category] || categoryColors.starter;
                        return (
                            <div key={item._id} style={{ ...card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.2rem' }}>
                                        <p style={{ fontWeight: 600, fontSize: '0.95rem', margin: 0 }}>{item.name}</p>
                                        <span style={{ fontSize: '0.68rem', fontWeight: 600, padding: '2px 8px', borderRadius: 20, textTransform: 'capitalize', background: cc.bg, color: cc.text, border: `1px solid ${cc.border}` }}>
                                            {item.category}
                                        </span>
                                    </div>
                                    {item.description && (
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>{item.description}</p>
                                    )}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
                                    <span style={{ fontFamily: "'DM Serif Display',serif", fontSize: '1.2rem', color: 'var(--accent)' }}>₹{item.price}</span>
                                    <button onClick={() => handleDelete(item._id)} style={btnDanger}>Remove</button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Right — add form */}
            <div style={{ ...card, position: 'sticky', top: 80 }}>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem' }}>Add New Item</h3>
                <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                    <div>
                        <label style={labelStyle}>Item Name *</label>
                        <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Masala Dosa" style={inputStyle} required />
                    </div>
                    <div>
                        <label style={labelStyle}>Description</label>
                        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Short description…" rows={2}
                            style={{ ...inputStyle, resize: 'vertical' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <div>
                            <label style={labelStyle}>Price (₹) *</label>
                            <input name="price" type="number" min="1" value={form.price} onChange={handleChange} placeholder="0" style={inputStyle} required />
                        </div>
                        <div>
                            <label style={labelStyle}>Category *</label>
                            <select name="category" value={form.category} onChange={handleChange} style={{ ...inputStyle, cursor: 'pointer' }}>
                                <option value="starter">Starter</option>
                                <option value="main">Main</option>
                                <option value="dessert">Dessert</option>
                                <option value="beverage">Beverage</option>
                            </select>
                        </div>
                    </div>
                    <button type="submit" disabled={submitting} style={{ ...btnPrimary, marginTop: '0.25rem', boxShadow: '0 3px 10px #C8A96E33', opacity: submitting ? 0.7 : 1 }}>
                        {submitting ? 'Adding…' : '+ Add to Menu'}
                    </button>
                </form>
            </div>
        </div>
    );
};

// ════════════════════════════════════════════════════════════════════
// TABLES TAB
// ════════════════════════════════════════════════════════════════════
const TablesTab = () => {
    const { user } = useSelector((state) => state.auth);
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [bulkCount, setBulkCount] = useState('');
    const [bulkCapacity, setBulkCapacity] = useState('4');
    const [creating, setCreating] = useState(false);

    const authHeaders = () => ({
        headers: { Authorization: `Bearer ${user?.token}` }
    });

    const fetchTables = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get('/api/tables', authHeaders());
            setTables(data);
        } catch { toast.error('Could not load tables'); }
        setLoading(false);
    };

    useEffect(() => { fetchTables(); }, []);

    const handleCreateBulk = async (e) => {
        e.preventDefault();
        const n = parseInt(bulkCount);
        if (!n || n < 1 || n > 20) { toast.error('Enter a number between 1 and 20'); return; }

        // figure out next table number
        const maxExisting = tables.length > 0 ? Math.max(...tables.map(t => t.tableNumber)) : 0;
        const newTables = Array.from({ length: n }, (_, i) => ({
            tableNumber: maxExisting + i + 1,
            capacity: parseInt(bulkCapacity),
            status: 'available',
        }));
        setCreating(true);
        try {
            await axios.post('/api/tables', { tables: newTables }, authHeaders());
            toast.success(`${n} table${n > 1 ? 's' : ''} created!`);
            setBulkCount('');
            fetchTables();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create tables');
        }
        setCreating(false);
    };

    const handleStatusChange = async (tableId, newStatus) => {
        try {
            await axios.put(`/api/tables/${tableId}`, { status: newStatus }, authHeaders());
            setTables(prev => prev.map(t => t._id === tableId ? { ...t, status: newStatus } : t));
            toast.success('Table status updated');
        } catch { toast.error('Could not update status'); }
    };

    const summary = {
        available: tables.filter(t => t.status === 'available').length,
        occupied:  tables.filter(t => t.status === 'occupied').length,
        reserved:  tables.filter(t => t.status === 'reserved').length,
    };

    if (loading) return <Spinner label="Loading tables…" />;

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem', alignItems: 'start' }}>
            {/* Left — grid */}
            <div>
                {/* Summary */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.9rem', marginBottom: '1.5rem' }}>
                    {Object.entries(summary).map(([status, count]) => {
                        const sc = tableStatusColors[status];
                        return (
                            <div key={status} style={{ ...card, padding: '1rem 1.25rem' }}>
                                <p style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-secondary)', margin: '0 0 0.3rem' }}>{status}</p>
                                <p style={{ fontFamily: "'DM Serif Display',serif", fontSize: '1.6rem', color: sc.text, margin: 0 }}>{count}</p>
                            </div>
                        );
                    })}
                </div>

                {tables.length === 0 ? (
                    <div style={{ ...card, textAlign: 'center', padding: '3.5rem' }}>
                        <p style={{ fontSize: '1.8rem', margin: '0 0 0.5rem' }}>🪑</p>
                        <p style={{ fontFamily: "'DM Serif Display',serif", color: 'var(--text-primary)', marginBottom: '0.4rem' }}>No tables yet</p>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Use the form to create tables.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: '0.9rem' }}>
                        {tables.map(table => {
                            const sc = tableStatusColors[table.status] || tableStatusColors.available;
                            return (
                                <div key={table._id} style={{ ...card, textAlign: 'center', padding: '1.25rem 1rem' }}>
                                    <p style={{ fontFamily: "'DM Serif Display',serif", fontSize: '1.6rem', margin: '0 0 0.2rem', color: 'var(--text-primary)' }}>
                                        {table.tableNumber}
                                    </p>
                                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0 0 0.75rem' }}>
                                        Capacity: {table.capacity}
                                    </p>
                                    <span style={{
                                        display: 'inline-block', fontSize: '0.68rem', fontWeight: 600,
                                        padding: '3px 10px', borderRadius: 20, textTransform: 'capitalize',
                                        background: sc.bg, color: sc.text, border: `1px solid ${sc.border}`,
                                        marginBottom: '0.75rem',
                                    }}>{table.status}</span>
                                    <select value={table.status} onChange={e => handleStatusChange(table._id, e.target.value)}
                                        style={{ ...inputStyle, fontSize: '0.78rem', padding: '5px 8px', cursor: 'pointer', textAlign: 'center' }}>
                                        <option value="available">Available</option>
                                        <option value="occupied">Occupied</option>
                                        <option value="reserved">Reserved</option>
                                    </select>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Right — create form */}
            <div style={{ ...card, position: 'sticky', top: 80 }}>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem' }}>Add Tables</h3>
                <form onSubmit={handleCreateBulk} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                    <div>
                        <label style={labelStyle}>How many tables?</label>
                        <input type="number" min="1" max="20" value={bulkCount}
                            onChange={e => setBulkCount(e.target.value)}
                            placeholder="e.g. 4" style={inputStyle} required />
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                            They'll be numbered from {tables.length > 0 ? Math.max(...tables.map(t => t.tableNumber)) + 1 : 1} onwards.
                        </p>
                    </div>
                    <div>
                        <label style={labelStyle}>Seating Capacity</label>
                        <select value={bulkCapacity} onChange={e => setBulkCapacity(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                            {[2, 4, 6, 8].map(n => <option key={n} value={n}>{n} seats</option>)}
                        </select>
                    </div>
                    <button type="submit" disabled={creating} style={{ ...btnPrimary, boxShadow: '0 3px 10px #C8A96E33', opacity: creating ? 0.7 : 1 }}>
                        {creating ? 'Creating…' : '+ Create Tables'}
                    </button>
                </form>

                <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                        Table statuses update automatically when orders are placed and served. You can also override any table's status manually using the dropdowns.
                    </p>
                </div>
            </div>
        </div>
    );
};

// ════════════════════════════════════════════════════════════════════
// MAIN DASHBOARD
// ════════════════════════════════════════════════════════════════════
const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('Orders');

    return (
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
            {/* Page header */}
            <div style={{ marginBottom: '2rem' }}>
                <p style={{ color: 'var(--accent)', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 0.2rem' }}>Management</p>
                <h1 style={{ fontSize: '2.1rem', margin: 0 }}>Admin Dashboard</h1>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.35rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 5, marginBottom: '1.75rem', width: 'fit-content' }}>
                {TABS.map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} style={{
                        padding: '8px 22px', border: 'none', borderRadius: 9,
                        fontFamily: 'inherit', fontSize: '0.875rem', fontWeight: 600,
                        cursor: 'pointer', transition: 'all 0.18s',
                        background: activeTab === tab ? 'var(--accent)' : 'transparent',
                        color: activeTab === tab ? '#fff' : 'var(--text-secondary)',
                        boxShadow: activeTab === tab ? '0 2px 8px #C8A96E33' : 'none',
                    }}>{tab}</button>
                ))}
            </div>

            {/* Tab content */}
            {activeTab === 'Orders' && <OrdersTab />}
            {activeTab === 'Menu'   && <MenuTab />}
            {activeTab === 'Tables' && <TablesTab />}
        </div>
    );
};

export default AdminDashboard;