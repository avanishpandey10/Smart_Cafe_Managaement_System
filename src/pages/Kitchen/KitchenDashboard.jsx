import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getKitchenOrders, updateOrderStatus } from '../../redux/slices/orderSlice';
import toast from 'react-hot-toast';

const statusConfig = {
    approved:  { label: 'Approved',  bg: '#C8A96E22', text: '#8A6830', border: '#C8A96E55', next: 'preparing', action: 'Start Preparing', btnBg: 'var(--info)' },
    preparing: { label: 'Preparing', bg: '#5A7A8A22', text: '#2A5A6A', border: '#5A7A8A55', next: 'ready',     action: 'Mark Ready',      btnBg: 'var(--accent)' },
    ready:     { label: 'Ready',     bg: '#5A8A6A22', text: '#2A6A4A', border: '#5A8A6A55', next: 'served',    action: 'Mark Served',     btnBg: 'var(--success)' },
    served:    { label: 'Served',    bg: '#88888822', text: '#555',    border: '#88888844', next: null,         action: null,              btnBg: null },
};

const KitchenDashboard = () => {
    const dispatch = useDispatch();
    const { kitchenOrders, isLoading } = useSelector((state) => state.orders);

    useEffect(() => { dispatch(getKitchenOrders()); }, [dispatch]);

    const handleStatusUpdate = async (orderId, status) => {
        const result = await dispatch(updateOrderStatus({ id: orderId, status }));
        if (result.payload) toast.success(`Order marked as ${status}`);
    };

    if (isLoading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ width: 36, height: 36, border: '3px solid var(--accent-muted)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Loading active orders…</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    return (
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
            <div style={{ marginBottom: '2rem' }}>
                <p style={{ color: 'var(--accent)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 0.25rem' }}>Live View</p>
                <h1 style={{ fontSize: '2.2rem', margin: '0 0 0.5rem' }}>Kitchen Dashboard</h1>
                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Manage active orders and update their preparation status</p>
            </div>

            <div style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 16, padding: '1.75rem', boxShadow: 'var(--shadow-sm)',
            }}>
                <h2 style={{ fontSize: '1.4rem', marginBottom: '1.5rem' }}>Active Orders</h2>

                {kitchenOrders.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                        <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🍳</p>
                        <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.2rem', color: 'var(--text-primary)' }}>Kitchen's quiet</p>
                        <p style={{ fontSize: '0.875rem' }}>No active orders right now.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                        {kitchenOrders.map(order => {
                            const cfg = statusConfig[order.status] || statusConfig.approved;
                            return (
                                <div key={order._id} style={{
                                    background: 'var(--bg-base)', border: '1px solid var(--border)',
                                    borderRadius: 12, padding: '1.25rem',
                                    display: 'flex', flexDirection: 'column', gap: '0.75rem',
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.1rem', margin: '0 0 0.2rem' }}>
                                                #{order._id.slice(-6).toUpperCase()}
                                            </p>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                                                Table {order.tableNumber} · {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                        <span style={{
                                            fontSize: '0.7rem', fontWeight: 600,
                                            padding: '3px 10px', borderRadius: 20,
                                            background: cfg.bg, color: cfg.text,
                                            border: `1px solid ${cfg.border}`,
                                            textTransform: 'uppercase', letterSpacing: '0.05em',
                                        }}>
                                            {cfg.label}
                                        </span>
                                    </div>

                                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
                                        {order.items.map((item, idx) => (
                                            <p key={idx} style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '3px 0' }}>
                                                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.quantity}×</span> {item.name}
                                            </p>
                                        ))}
                                    </div>

                                    {cfg.next && (
                                        <button onClick={() => handleStatusUpdate(order._id, cfg.next)} style={{
                                            background: cfg.btnBg, color: '#fff',
                                            border: 'none', borderRadius: 8,
                                            padding: '9px', fontSize: '0.85rem',
                                            fontWeight: 600, fontFamily: 'inherit',
                                            cursor: 'pointer', width: '100%',
                                            marginTop: 'auto',
                                        }}>
                                            {cfg.action}
                                        </button>
                                    )}
                                    {!cfg.next && (
                                        <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)', padding: '6px', borderRadius: 8, background: '#88888811' }}>
                                            Completed ✓
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default KitchenDashboard;