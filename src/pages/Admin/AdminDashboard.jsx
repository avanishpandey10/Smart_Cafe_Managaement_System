import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getPendingOrders, approveOrder } from '../../redux/slices/orderSlice';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
    const dispatch = useDispatch();
    const { pendingOrders, isLoading } = useSelector((state) => state.orders);

    useEffect(() => {
        dispatch(getPendingOrders());
    }, [dispatch]);

    const handleApprove = async (orderId) => {
        const result = await dispatch(approveOrder(orderId));
        if (result.payload) {
            toast.success('Order approved and sent to kitchen');
        }
    };

    if (isLoading) {
        return <div className="text-center py-8">Loading pending orders...</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
            
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold mb-4">Pending Orders</h2>
                
                {pendingOrders.length === 0 ? (
                    <p className="text-gray-500">No pending orders</p>
                ) : (
                    <div className="space-y-4">
                        {pendingOrders.map(order => (
                            <div key={order._id} className="border rounded-lg p-4">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="font-semibold">Order #{order._id.slice(-6)}</p>
                                        <p className="text-gray-600">Table: {order.tableNumber}</p>
                                        <p className="text-gray-600">Customer: {order.user?.name || 'Guest'}</p>
                                        <p className="text-gray-600">Time: {new Date(order.createdAt).toLocaleString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-bold text-blue-600">₹{order.totalAmount}</p>
                                        <button
                                            onClick={() => handleApprove(order._id)}
                                            className="mt-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                                        >
                                            Approve Order
                                        </button>
                                    </div>
                                </div>
                                
                                <div>
                                    <p className="font-semibold mb-2">Items:</p>
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between text-gray-700">
                                            <span>{item.quantity}x {item.name}</span>
                                            <span>₹{item.price * item.quantity}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;