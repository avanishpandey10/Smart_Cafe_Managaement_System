import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMenuItems } from '../../redux/slices/menuSlice';
import { createOrder } from '../../redux/slices/orderSlice';
import toast from 'react-hot-toast';

const UserDashboard = () => {
    const [cart, setCart] = useState([]);
    const [tableNumber, setTableNumber] = useState('');
    const dispatch = useDispatch();
    const { items, isLoading } = useSelector((state) => state.menu);

    useEffect(() => { dispatch(getMenuItems()); }, [dispatch]);

    const addToCart = (item) => {
        const existing = cart.find(c => c.menuItem === item._id);
        setCart(existing
            ? cart.map(c => c.menuItem === item._id ? { ...c, quantity: c.quantity + 1 } : c)
            : [...cart, { menuItem: item._id, name: item.name, quantity: 1, price: item.price }]
        );
        toast.success(`${item.name} added`);
    };

    const updateQuantity = (itemId, qty) => {
        if (qty <= 0) setCart(cart.filter(i => i.menuItem !== itemId));
        else setCart(cart.map(i => i.menuItem === itemId ? { ...i, quantity: qty } : i));
    };

    const cartTotal = cart.reduce((t, i) => t + i.price * i.quantity, 0);

    const handlePlaceOrder = async () => {
        if (!tableNumber) { toast.error('Please enter table number'); return; }
        if (cart.length === 0) { toast.error('Cart is empty'); return; }
        const result = await dispatch(createOrder({
            items: cart.map(({ menuItem, quantity }) => ({ menuItem, quantity })),
            tableNumber: parseInt(tableNumber),
        }));
        if (result.payload) {
            toast.success('Order placed! Awaiting admin approval.');
            setCart([]); setTableNumber('');
        }
    };

    if (isLoading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ width: 36, height: 36, border: '3px solid var(--accent-muted)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Loading menu…</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    return (
        <div style={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
            {/* Menu Grid */}
            <div style={{ flex: 1, padding: '2.5rem 1.5rem', paddingRight: '2rem', maxWidth: 'calc(100% - 360px)' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <p style={{ color: 'var(--accent)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 0.25rem' }}>Today's Selection</p>
                    <h1 style={{ fontSize: '2.2rem', margin: 0 }}>Our Menu</h1>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
                    {items.map(item => {
                        const inCart = cart.find(c => c.menuItem === item._id);
                        return (
                            <div key={item._id} style={{
                                background: 'var(--bg-card)', border: '1px solid var(--border)',
                                borderRadius: 14, overflow: 'hidden', boxShadow: 'var(--shadow-sm)',
                                transition: 'box-shadow 0.2s, transform 0.2s',
                                display: 'flex', flexDirection: 'column',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = 'none'; }}>
                                {/* Placeholder image area */}
                                <div style={{
                                    height: 100, background: 'var(--bg-base)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '2.5rem', borderBottom: '1px solid var(--border)',
                                }}>
                                    🍽️
                                </div>
                                <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <h3 style={{ fontSize: '1rem', margin: '0 0 0.4rem' }}>{item.name}</h3>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 0.75rem', flex: 1, lineHeight: 1.5 }}>
                                        {item.description}
                                    </p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.2rem', color: 'var(--accent)' }}>
                                            ₹{item.price}
                                        </span>
                                        {inCart ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <button onClick={() => updateQuantity(item._id, inCart.quantity - 1)} style={qtyBtn}>−</button>
                                                <span style={{ fontWeight: 600, fontSize: '0.9rem', minWidth: 20, textAlign: 'center' }}>{inCart.quantity}</span>
                                                <button onClick={() => updateQuantity(item._id, inCart.quantity + 1)} style={{ ...qtyBtn, background: 'var(--accent)', color: '#fff' }}>+</button>
                                            </div>
                                        ) : (
                                            <button onClick={() => addToCart(item)} style={{
                                                background: 'var(--accent)', color: '#fff',
                                                border: 'none', borderRadius: 8,
                                                padding: '6px 14px', fontSize: '0.8rem',
                                                fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
                                            }}>
                                                Add +
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Cart Sidebar */}
            <div style={{
                width: 340, flexShrink: 0,
                background: 'var(--bg-card)', borderLeft: '1px solid var(--border)',
                padding: '2rem 1.5rem', position: 'sticky', top: 64,
                height: 'calc(100vh - 64px)', overflowY: 'auto',
                display: 'flex', flexDirection: 'column',
            }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Your Cart</h2>

                {/* Table Number */}
                <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>
                        Table Number
                    </label>
                    <input type="number" value={tableNumber} onChange={e => setTableNumber(e.target.value)}
                        placeholder="Enter your table number"
                        style={{
                            width: '100%', padding: '10px 12px',
                            border: '1px solid var(--border)', borderRadius: 10,
                            background: 'var(--bg-base)', fontFamily: 'inherit',
                            fontSize: '0.9rem', color: 'var(--text-primary)', outline: 'none',
                        }}
                    />
                </div>

                <div style={{ flex: 1 }}>
                    {cart.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
                            <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🛒</p>
                            <p style={{ fontFamily: "'DM Serif Display', serif", color: 'var(--text-primary)' }}>Empty cart</p>
                            <p style={{ fontSize: '0.85rem' }}>Add items from the menu.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {cart.map(item => (
                                <div key={item.menuItem} style={{
                                    display: 'flex', justifyContent: 'space-between',
                                    alignItems: 'center', padding: '0.875rem',
                                    background: 'var(--bg-base)', borderRadius: 10,
                                    border: '1px solid var(--border)',
                                }}>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontWeight: 500, fontSize: '0.875rem', margin: '0 0 2px' }}>{item.name}</p>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>₹{item.price} each</p>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <button onClick={() => updateQuantity(item.menuItem, item.quantity - 1)} style={qtyBtn}>−</button>
                                        <span style={{ fontWeight: 600, fontSize: '0.9rem', minWidth: 20, textAlign: 'center' }}>{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.menuItem, item.quantity + 1)} style={{ ...qtyBtn, background: 'var(--accent)', color: '#fff' }}>+</button>
                                    </div>
                                    <span style={{ fontWeight: 600, fontSize: '0.9rem', marginLeft: '0.75rem', minWidth: 50, textAlign: 'right' }}>
                                        ₹{item.price * item.quantity}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {cart.length > 0 && (
                    <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Total</span>
                            <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.5rem', color: 'var(--accent)' }}>₹{cartTotal}</span>
                        </div>
                        <button onClick={handlePlaceOrder} style={{
                            width: '100%', padding: '13px',
                            background: 'var(--accent)', color: '#fff',
                            border: 'none', borderRadius: 10,
                            fontSize: '0.95rem', fontWeight: 600, fontFamily: 'inherit',
                            cursor: 'pointer', boxShadow: '0 4px 12px #C8A96E44',
                        }}>
                            Place Order
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const qtyBtn = {
    width: 28, height: 28, border: '1px solid var(--border)',
    borderRadius: 7, background: 'var(--bg-card)', fontFamily: 'inherit',
    fontSize: '1rem', cursor: 'pointer', display: 'flex',
    alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)',
};

export default UserDashboard;