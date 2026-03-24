import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getOrders } from '../redux/slices/orderSlice';

const statusConfig = {
    pending:   { label: 'Pending',   bg: '#88888822', text: '#555',    border: '#88888844' },
    approved:  { label: 'Approved',  bg: '#C8A96E22', text: '#8A6830', border: '#C8A96E55' },
    preparing: { label: 'Preparing', bg: '#5A7A8A22', text: '#2A5A6A', border: '#5A7A8A55' },
    ready:     { label: 'Ready',     bg: '#5A8A6A22', text: '#2A6A4A', border: '#5A8A6A55' },
    served:    { label: 'Served',    bg: '#C8A96E11', text: '#8A6830', border: '#C8A96E33' },
};

const Orders = () => {
    const dispatch = useDispatch();
    const { orders, isLoading } = useSelector((state) => state.orders); // ✅ matches slice

    useEffect(() => { dispatch(getOrders()); }, [dispatch]); // ✅ matches thunk

    if (isLoading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ width: 36, height: 36, border: '3px solid var(--accent-muted)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Loading your orders…</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    return (
        <div style={{ maxWidth: 750, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
            <div style={{ marginBottom: '2rem' }}>
                <p style={{ color: 'var(--accent)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 0.25rem' }}>History</p>
                <h1 style={{ fontSize: '2.2rem', margin: 0 }}>My Orders</h1>
            </div>

            {(!orders || orders.length === 0) ? (
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '4rem', textAlign: 'center' }}>
                    <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📋</p>
                    <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No orders yet</p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Head to the menu and place your first order!</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {orders.map(order => {
                        const cfg = statusConfig[order.status] || statusConfig.pending;
                        return (
                            <div key={order._id} style={{
                                background: 'var(--bg-card)', border: '1px solid var(--border)',
                                borderRadius: 14, padding: '1.25rem', boxShadow: 'var(--shadow-sm)',
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                    <div>
                                        <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.1rem', margin: '0 0 0.2rem' }}>
                                            Order #{order._id.slice(-6).toUpperCase()}
                                        </p>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                                            Table {order.tableNumber} · {new Date(order.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
                                        <span style={{
                                            fontSize: '0.7rem', fontWeight: 600, padding: '3px 10px',
                                            borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.05em',
                                            background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}`,
                                        }}>{cfg.label}</span>
                                        <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.3rem', color: 'var(--accent)' }}>
                                            ₹{order.totalAmount}
                                        </span>
                                    </div>
                                </div>
                                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    {order.items.map((item, idx) => (
                                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                            <span style={{ color: 'var(--text-secondary)' }}>{item.quantity}× {item.name}</span>
                                            <span style={{ fontWeight: 500 }}>₹{item.price * item.quantity}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Orders;