import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div style={{ minHeight: 'calc(100vh - 64px)', background: 'var(--bg-base)', overflow: 'hidden', position: 'relative' }}>
            {/* Decorative background circles */}
            <div style={{ position: 'absolute', top: '5%', right: '8%', width: 500, height: 500, background: 'radial-gradient(circle, #C8A96E18, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '10%', left: '5%', width: 350, height: 350, background: 'radial-gradient(circle, #C8A96E12, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

            {/* Hero */}
            <div style={{ maxWidth: 900, margin: '0 auto', padding: '6rem 2rem 4rem', textAlign: 'center', position: 'relative' }}>
                <div style={{ display: 'inline-block', background: '#C8A96E22', border: '1px solid #C8A96E55', color: '#8A6830', fontSize: '0.8rem', fontWeight: 600, padding: '4px 14px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem' }}>
                    Smart Café Management
                </div>
                <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', lineHeight: 1.15, marginBottom: '1.25rem', letterSpacing: '-0.02em' }}>
                    A smarter way to run<br />
                    <span style={{ color: 'var(--accent)' }}>your café</span>
                </h1>
                <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: 560, margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
                    Seamless ordering, real-time kitchen coordination, and effortless admin control — all in one place.
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link to="/user" style={{
                        background: 'var(--accent)', color: 'var(--text-light)',
                        padding: '13px 28px', borderRadius: 12, textDecoration: 'none',
                        fontWeight: 600, fontSize: '0.95rem', boxShadow: '0 4px 16px #C8A96E44',
                    }}>
                        Browse Menu
                    </Link>
                    <Link to="/auth" style={{
                        background: 'var(--bg-card)', color: 'var(--text-primary)',
                        padding: '13px 28px', borderRadius: 12, textDecoration: 'none',
                        fontWeight: 600, fontSize: '0.95rem', border: '1px solid var(--border)',
                    }}>
                        Sign In →
                    </Link>
                </div>
            </div>

            {/* Feature cards */}
            <div style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                {[
                    { icon: '🧾', title: 'Easy Ordering', desc: 'Customers browse the menu and place orders directly from their table.' },
                    { icon: '🍳', title: 'Live Kitchen View', desc: 'Kitchen staff see orders in real time and update status as they cook.' },
                    { icon: '⚙️', title: 'Admin Control', desc: 'Approve orders, manage the menu, and oversee every table from one dashboard.' },
                ].map(f => (
                    <div key={f.title} style={{
                        background: 'var(--bg-card)', border: '1px solid var(--border)',
                        borderRadius: 16, padding: '1.75rem', boxShadow: 'var(--shadow-sm)',
                    }}>
                        <div style={{ fontSize: '1.8rem', marginBottom: '0.75rem' }}>{f.icon}</div>
                        <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>{f.title}</h3>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Home;