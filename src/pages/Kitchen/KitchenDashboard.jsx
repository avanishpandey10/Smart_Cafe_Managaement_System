import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getKitchenOrders, updateOrderStatus } from '../../redux/slices/orderSlice';
import toast from 'react-hot-toast';

const KitchenDashboard = () => {
    const dispatch = useDispatch();
    const { kitchenOrders, isLoading } = useSelector((state) => state.orders);

    useEffect(() => {
        dispatch(getKitchenOrders());
    }, [dispatch]);

    const handleStatusUpdate = async (orderId, status) => {
        const result = await dispatch(updateOrderStatus({ id: orderId, status }));
        if (result.payload) {
            toast.success(`Order status updated to ${status}`);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'bg-yellow-100 text-yellow-800';
            case 'preparing': return 'bg-blue-100 text-blue-800';
            case 'ready': return 'bg-green-100 text-green-800';
            case 'served': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (isLoading) {
        return <div className="text-center py-8">Loading active orders...</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Kitchen Dashboard</h1>
            
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold mb-4">Active Orders</h2>
                
                {kitchenOrders.length === 0 ? (
                    <p className="text-gray-500">No active orders</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {kitchenOrders.map(order => (
                            <div key={order._id} className="border rounded-lg p-4">
                                <div className="mb-4">
                                    <p className="font-semibold">Order #{order._id.slice(-6)}</p>
                                    <p className="text-gray-600">Table: {order.tableNumber}</p>
                                    <p className="text-gray-600">Time: {new Date(order.createdAt).toLocaleTimeString()}</p>
                                </div>
                                
                                <div className="mb-4">
                                    <p className="font-semibold mb-2">Items:</p>
                                    {order.items.map((item, idx) => (
                                        <p key={idx} className="text-gray-700">
                                            {item.quantity}x {item.name}
                                        </p>
                                    ))}
                                </div>
                                
                                <div className="mb-4">
                                    <span className={`px-2 py-1 rounded text-sm ${getStatusColor(order.status)}`}>
                                        Status: {order.status}
                                    </span>
                                </div>
                                
                                <div className="flex space-x-2">
                                    {order.status === 'approved' && (
                                        <button
                                            onClick={() => handleStatusUpdate(order._id, 'preparing')}
                                            className="flex-1 bg-blue-500 text-white py-1 rounded hover:bg-blue-600"
                                        >
                                            Start Preparing
                                        </button>
                                    )}
                                    {order.status === 'preparing' && (
                                        <button
                                            onClick={() => handleStatusUpdate(order._id, 'ready')}
                                            className="flex-1 bg-green-500 text-white py-1 rounded hover:bg-green-600"
                                        >
                                            Mark Ready
                                        </button>
                                    )}
                                    {order.status === 'ready' && (
                                        <button
                                            onClick={() => handleStatusUpdate(order._id, 'served')}
                                            className="flex-1 bg-purple-500 text-white py-1 rounded hover:bg-purple-600"
                                        >
                                            Mark Served
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default KitchenDashboard;