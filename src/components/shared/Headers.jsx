import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';

const Header = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/auth');
    };

    const getNavLinks = () => {
        switch (user?.role) {
            case 'admin':
                return (
                    <>
                        <Link to="/admin" className="text-gray-700 hover:text-blue-600">Dashboard</Link>
                        <Link to="/admin/orders" className="text-gray-700 hover:text-blue-600">Orders</Link>
                        <Link to="/admin/menu" className="text-gray-700 hover:text-blue-600">Menu</Link>
                        <Link to="/admin/tables" className="text-gray-700 hover:text-blue-600">Tables</Link>
                    </>
                );
            case 'kitchen':
                return (
                    <Link to="/kitchen" className="text-gray-700 hover:text-blue-600">Kitchen Orders</Link>
                );
            default:
                return (
                    <>
                        <Link to="/user" className="text-gray-700 hover:text-blue-600">Menu</Link>
                        <Link to="/orders" className="text-gray-700 hover:text-blue-600">My Orders</Link>
                    </>
                );
        }
    };

    return (
        <nav className="bg-white shadow-md">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <Link to="/" className="text-xl font-bold text-blue-600">
                        Smart Café
                    </Link>
                    
                    <div className="flex space-x-4">
                        {user && getNavLinks()}
                    </div>
                    
                    {user && (
                        <div className="flex items-center space-x-4">
                            <span className="text-gray-600">Welcome, {user.name}</span>
                            <button
                                onClick={handleLogout}
                                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Header;