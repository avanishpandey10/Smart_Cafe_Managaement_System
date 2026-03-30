import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login, register, reset } from '../redux/slices/authSlice';
import toast from 'react-hot-toast';

const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid var(--border)',
    borderRadius: 10,
    fontSize: '0.9rem',
    fontFamily: 'inherit',
    background: 'var(--bg-base)',
    color: 'var(--text-primary)',
    outline: 'none',
    transition: 'border-color 0.2s',
};

const labelStyle = {
    display: 'block',
    fontSize: '0.8rem',
    fontWeight: 500,
    color: 'var(--text-secondary)',
    marginBottom: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
};

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', confirmPassword: '', role: 'user'
    });
    const { name, email, password, confirmPassword, role } = formData;
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user, isLoading, isError, message } = useSelector((state) => state.auth);

    useEffect(() => {
        if (user) navigate('/');
        if (isError) { toast.error(message); dispatch(reset()); }
    }, [user, isError, message, dispatch, navigate]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!isLogin) {
            if (password !== confirmPassword) { toast.error('Passwords do not match'); return; }
            dispatch(register({ name, email, password, role }));
        } else {
            dispatch(login({ email, password }));
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg-base)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
        }}>
            {/* Decorative blobs */}
            <div style={{
                position: 'fixed', top: '-10%', right: '-5%',
                width: 400, height: 400,
                background: 'radial-gradient(circle, #C8A96E22, transparent 70%)',
                borderRadius: '50%', pointerEvents: 'none',
            }} />
            <div style={{
                position: 'fixed', bottom: '-10%', left: '-5%',
                width: 350, height: 350,
                background: 'radial-gradient(circle, #C8A96E18, transparent 70%)',
                borderRadius: '50%', pointerEvents: 'none',
            }} />

            <div style={{
                background: 'var(--bg-card)',
                borderRadius: 20,
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-lg)',
                padding: '2.5rem',
                width: '100%',
                maxWidth: 420,
                position: 'relative',
            }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: 52, height: 52,
                        background: 'var(--accent)',
                        borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.4rem', margin: '0 auto 1rem',
                        boxShadow: '0 4px 12px #C8A96E44',
                    }}>🍵</div>
                    <h1 style={{ fontSize: '1.8rem', marginBottom: '0.25rem' }}>
                        {isLogin ? 'Welcome back' : 'Join Smart Café'}
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                        {isLogin ? 'Sign in to your account' : 'Create your account today'}
                    </p>
                </div>

                {/* Toggle tabs */}
                <div style={{
                    display: 'flex', background: 'var(--bg-base)',
                    borderRadius: 10, padding: 4, marginBottom: '1.75rem',
                }}>
                    {['Login', 'Register'].map((tab) => (
                        <button key={tab} onClick={() => setIsLogin(tab === 'Login')} style={{
                            flex: 1, padding: '8px', border: 'none', borderRadius: 8,
                            fontFamily: 'inherit', fontSize: '0.875rem', fontWeight: 500,
                            cursor: 'pointer', transition: 'all 0.2s',
                            background: (isLogin && tab === 'Login') || (!isLogin && tab === 'Register')
                                ? 'var(--bg-card)' : 'transparent',
                            color: (isLogin && tab === 'Login') || (!isLogin && tab === 'Register')
                                ? 'var(--text-primary)' : 'var(--text-secondary)',
                            boxShadow: (isLogin && tab === 'Login') || (!isLogin && tab === 'Register')
                                ? 'var(--shadow-sm)' : 'none',
                        }}>
                            {tab}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSubmit}>
                    {!isLogin && (
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={labelStyle}>Full Name</label>
                            <input type="text" name="name" value={name} onChange={handleChange}
                                style={inputStyle} placeholder="Your name" required />
                        </div>
                    )}
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={labelStyle}>Email</label>
                        <input type="email" name="email" value={email} onChange={handleChange}
                            style={inputStyle} placeholder="you@email.com" required />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={labelStyle}>Password</label>
                        <input type="password" name="password" value={password} onChange={handleChange}
                            style={inputStyle} placeholder="••••••••" required />
                    </div>
                    {!isLogin && (
                        <>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={labelStyle}>Confirm Password</label>
                                <input type="password" name="confirmPassword" value={confirmPassword}
                                    onChange={handleChange} style={inputStyle} placeholder="••••••••" required />
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={labelStyle}>Role</label>
                                <select name="role" value={role} onChange={handleChange} style={{
                                    ...inputStyle, cursor: 'pointer',
                                }}>
                                    <option value="user">Customer</option>
                                    <option value="admin">Admin</option>
                                    <option value="kitchen">Kitchen Staff</option>
                                </select>
                            </div>
                        </>
                    )}
                    <button type="submit" disabled={isLoading} style={{
                        width: '100%', padding: '12px',
                        background: isLoading ? 'var(--accent-muted)' : 'var(--accent)',
                        color: 'var(--text-light)', border: 'none', borderRadius: 10,
                        fontSize: '0.95rem', fontWeight: 600, fontFamily: 'inherit',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        marginTop: isLogin ? '0.5rem' : 0,
                        boxShadow: isLoading ? 'none' : '0 4px 12px #C8A96E44',
                        transition: 'all 0.2s',
                    }}>
                        {isLoading ? 'Processing…' : (isLogin ? 'Sign In' : 'Create Account')}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Auth;