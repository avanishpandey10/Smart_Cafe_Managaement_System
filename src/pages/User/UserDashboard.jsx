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

    useEffect(() => {
        dispatch(getMenuItems());
    }, [dispatch]);

    const addToCart = (item) => {
        const existingItem = cart.find(cartItem => cartItem.menuItem === item._id);
        
        if (existingItem) {
            setCart(cart.map(cartItem =>
                cartItem.menuItem === item._id
                    ? { ...cartItem, quantity: cartItem.quantity + 1 }
                    : cartItem
            ));
        } else {
            setCart([...cart, {
                menuItem: item._id,
                name: item.name,
                quantity: 1,
                price: item.price
            }]);
        }
        toast.success(`Added ${item.name} to cart`);
    };

    const updateQuantity = (itemId, newQuantity) => {
        if (newQuantity <= 0) {
            setCart(cart.filter(item => item.menuItem !== itemId));
        } else {
            setCart(cart.map(item =>
                item.menuItem === itemId
                    ? { ...item, quantity: newQuantity }
                    : item
            ));
        }
    };

    const getCartTotal = () => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const handlePlaceOrder = async () => {
        if (!tableNumber) {
            toast.error('Please enter table number');
            return;
        }
        
        if (cart.length === 0) {
            toast.error('Cart is empty');
            return;
        }
        
        const orderData = {
            items: cart.map(({ menuItem, quantity }) => ({ menuItem, quantity })),
            tableNumber: parseInt(tableNumber)
        };
        
        const result = await dispatch(createOrder(orderData));
        if (result.payload) {
            toast.success('Order placed successfully! Waiting for admin approval.');
            setCart([]);
            setTableNumber('');
        }
    };

    if (isLoading) {
        return <div className="text-center py-8">Loading menu...</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Menu</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map(item => (
                    <div key={item._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="p-4">
                            <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
                            <p className="text-gray-600 mb-2">{item.description}</p>
                            <p className="text-lg font-bold text-blue-600 mb-4">₹{item.price}</p>
                            <button
                                onClick={() => addToCart(item)}
                                className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                            >
                                Add to Cart
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Cart Sidebar */}
            <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-lg p-6 mt-16 overflow-y-auto">
                <h2 className="text-2xl font-bold mb-4">Your Cart</h2>
                
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Table Number</label>
                    <input
                        type="number"
                        value={tableNumber}
                        onChange={(e) => setTableNumber(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                        placeholder="Enter table number"
                    />
                </div>
                
                {cart.length === 0 ? (
                    <p className="text-gray-500">Cart is empty</p>
                ) : (
                    <>
                        {cart.map(item => (
                            <div key={item.menuItem} className="flex justify-between items-center mb-4">
                                <div>
                                    <p className="font-semibold">{item.name}</p>
                                    <p className="text-sm text-gray-600">₹{item.price} each</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => updateQuantity(item.menuItem, item.quantity - 1)}
                                        className="bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
                                    >
                                        -
                                    </button>
                                    <span>{item.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(item.menuItem, item.quantity + 1)}
                                        className="bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
                                    >
                                        +
                                    </button>
                                </div>
                                <p className="font-semibold">₹{item.price * item.quantity}</p>
                            </div>
                        ))}
                        
                        <div className="border-t pt-4 mt-4">
                            <div className="flex justify-between text-xl font-bold">
                                <span>Total:</span>
                                <span>₹{getCartTotal()}</span>
                            </div>
                            <button
                                onClick={handlePlaceOrder}
                                className="w-full bg-green-500 text-white py-2 rounded-lg mt-4 hover:bg-green-600"
                            >
                                Place Order
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default UserDashboard;