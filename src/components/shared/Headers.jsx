import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';

const Header = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/auth');
    };

    const getNavLinks = () => {
        switch (user?.role) {
            case 'admin':
                return (
                    <>
                        <Link to="/admin" style={navLink}>Dashboard</Link>
                        <Link to="/admin/orders" style={navLink}>Orders</Link>
                        <Link to="/admin/menu" style={navLink}>Menu</Link>
                        <Link to="/admin/tables" style={navLink}>Tables</Link>
                    </>
                );
            case 'kitchen':
                return <Link to="/kitchen" style={navLink}>Kitchen Orders</Link>;
            default:
                return (
                    <>
                        <Link to="/user" style={navLink}>Menu</Link>
                        <Link to="/orders" style={navLink}>My Orders</Link>
                    </>
                );
        }
    };

    const roleBadgeColor = {
        admin: { background: '#C8A96E22', color: '#8A6830', border: '1px solid #C8A96E55' },
        kitchen: { background: '#5A8A6A22', color: '#3A6A4A', border: '1px solid #5A8A6A55' },
        user: { background: '#5A7A8A22', color: '#3A5A6A', border: '1px solid #5A7A8A55' },
    };

    return (
        <nav style={{
            background: 'var(--bg-card)',
            borderBottom: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)',
            position: 'sticky',
            top: 0,
            zIndex: 100,
        }}>
            <div style={{
                maxWidth: 1200,
                margin: '0 auto',
                padding: '0 1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                height: 64,
            }}>
                {/* Logo */}
                <Link to="/" style={{
                    fontFamily: "'DM Serif Display', Georgia, serif",
                    fontSize: '1.4rem',
                    color: 'var(--text-primary)',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    letterSpacing: '-0.02em',
                }}>
                    <span style={{
                        width: 30, height: 30,
                        background: 'var(--accent)',
                        borderRadius: '50%',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.9rem',
                    }}>☕</span>
                    Smart Café
                </Link>

                {/* Nav Links */}
                {user && (
                    <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                        {getNavLinks()}
                    </div>
                )}

                {/* Right Side */}
                {user ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                                Welcome back,
                            </p>
                            <p style={{ fontSize: '0.9rem', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
                                {user.name}
                            </p>
                        </div>
                        {user.role && (
                            <span style={{
                                fontSize: '0.7rem',
                                fontWeight: 500,
                                padding: '2px 8px',
                                borderRadius: 20,
                                textTransform: 'capitalize',
                                ...roleBadgeColor[user.role],
                            }}>
                                {user.role}
                            </span>
                        )}
                        <button onClick={handleLogout} style={{
                            background: 'transparent',
                            border: '1px solid var(--border)',
                            color: 'var(--text-secondary)',
                            padding: '6px 14px',
                            borderRadius: 8,
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => {
                            e.target.style.borderColor = 'var(--danger)';
                            e.target.style.color = 'var(--danger)';
                        }}
                        onMouseLeave={e => {
                            e.target.style.borderColor = 'var(--border)';
                            e.target.style.color = 'var(--text-secondary)';
                        }}>
                            Logout
                        </button>
                    </div>
                ) : (
                    <Link to="/auth" style={{
                        background: 'var(--accent)',
                        color: 'var(--text-light)',
                        padding: '8px 18px',
                        borderRadius: 8,
                        textDecoration: 'none',
                        fontSize: '0.85rem',
                        fontWeight: 500,
                    }}>
                        Sign In
                    </Link>
                )}
            </div>
        </nav>
    );
};

const navLink = {
    padding: '6px 14px',
    borderRadius: 8,
    color: 'var(--text-secondary)',
    textDecoration: 'none',
    fontSize: '0.875rem',
    fontWeight: 500,
    transition: 'all 0.15s',
};

export default Header;