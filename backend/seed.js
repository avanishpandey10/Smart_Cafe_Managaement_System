const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const Menu = require('./models/Menu');
const Table = require('./models/Table');
const Order = require('./models/Order');
const User = require('./models/User');

const menuItems = [
    // Starters
    { name: 'Veg Spring Rolls', description: 'Crispy rolls stuffed with seasoned vegetables', price: 120, category: 'starter', available: true },
    { name: 'Paneer Tikka', description: 'Grilled cottage cheese with spiced marinade', price: 180, category: 'starter', available: true },
    { name: 'Soup of the Day', description: 'Chef\'s special fresh soup served hot', price: 90, category: 'starter', available: true },
    { name: 'Garlic Bread', description: 'Toasted bread with garlic butter and herbs', price: 80, category: 'starter', available: true },

    // Mains
    { name: 'Dal Makhani', description: 'Slow-cooked black lentils in a rich tomato-cream sauce', price: 220, category: 'main', available: true },
    { name: 'Butter Chicken', description: 'Tender chicken in a mild, creamy tomato gravy', price: 280, category: 'main', available: true },
    { name: 'Veg Biryani', description: 'Fragrant basmati rice cooked with seasonal vegetables', price: 200, category: 'main', available: true },
    { name: 'Paneer Butter Masala', description: 'Cottage cheese cubes in a rich onion-tomato gravy', price: 240, category: 'main', available: true },
    { name: 'Grilled Sandwich', description: 'Toasted sandwich with cheese, veggies and chutney', price: 130, category: 'main', available: true },
    { name: 'Pasta Arrabbiata', description: 'Penne in spicy tomato sauce with fresh basil', price: 190, category: 'main', available: true },

    // Desserts
    { name: 'Gulab Jamun', description: 'Soft milk dumplings soaked in rose sugar syrup', price: 80, category: 'dessert', available: true },
    { name: 'Chocolate Brownie', description: 'Warm brownie served with a scoop of vanilla ice cream', price: 140, category: 'dessert', available: true },
    { name: 'Kulfi', description: 'Traditional Indian ice cream in pistachio and mango', price: 100, category: 'dessert', available: true },

    // Beverages
    { name: 'Masala Chai', description: 'Spiced Indian tea brewed with ginger and cardamom', price: 40, category: 'beverage', available: true },
    { name: 'Cold Coffee', description: 'Blended iced coffee with milk and sugar', price: 90, category: 'beverage', available: true },
    { name: 'Fresh Lime Soda', description: 'Chilled lime juice with soda, sweet or salted', price: 60, category: 'beverage', available: true },
    { name: 'Mango Lassi', description: 'Creamy yoghurt drink blended with Alphonso mango', price: 80, category: 'beverage', available: true },
    { name: 'Mineral Water', description: 'Chilled packaged drinking water 1L', price: 30, category: 'beverage', available: true },
];

const tables = [
    { tableNumber: 1, capacity: 2, status: 'available' },
    { tableNumber: 2, capacity: 2, status: 'available' },
    { tableNumber: 3, capacity: 4, status: 'available' },
    { tableNumber: 4, capacity: 4, status: 'available' },
    { tableNumber: 5, capacity: 4, status: 'available' },
    { tableNumber: 6, capacity: 6, status: 'available' },
    { tableNumber: 7, capacity: 6, status: 'available' },
    { tableNumber: 8, capacity: 8, status: 'available' },
];

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected for seeding...');

        // Clear existing data
        await Menu.deleteMany({});
        await Table.deleteMany({});
        await Order.deleteMany({});
        console.log('Cleared existing menu, table, and order data.');

        // Seed menu
        const createdMenuItems = await Menu.insertMany(menuItems);
        console.log(`✓ Inserted ${createdMenuItems.length} menu items`);

        // Seed tables
        const createdTables = await Table.insertMany(tables);
        console.log(`✓ Inserted ${createdTables.length} tables`);

        // Find an existing user to attach sample orders to
        const user = await User.findOne({ role: 'user' });
        const admin = await User.findOne({ role: 'admin' });

        if (user && admin) {
            const sampleOrders = [
                {
                    user: user._id,
                    tableNumber: 3,
                    items: [
                        { menuItem: createdMenuItems[0]._id, name: createdMenuItems[0].name, quantity: 2, price: createdMenuItems[0].price },
                        { menuItem: createdMenuItems[14]._id, name: createdMenuItems[14].name, quantity: 2, price: createdMenuItems[14].price },
                    ],
                    totalAmount: (createdMenuItems[0].price * 2) + (createdMenuItems[14].price * 2),
                    status: 'served',
                    paymentStatus: 'paid',
                    approvedBy: admin._id,
                    approvedAt: new Date(Date.now() - 3600000),
                },
                {
                    user: user._id,
                    tableNumber: 5,
                    items: [
                        { menuItem: createdMenuItems[5]._id, name: createdMenuItems[5].name, quantity: 1, price: createdMenuItems[5].price },
                        { menuItem: createdMenuItems[6]._id, name: createdMenuItems[6].name, quantity: 1, price: createdMenuItems[6].price },
                        { menuItem: createdMenuItems[16]._id, name: createdMenuItems[16].name, quantity: 2, price: createdMenuItems[16].price },
                    ],
                    totalAmount: createdMenuItems[5].price + createdMenuItems[6].price + (createdMenuItems[16].price * 2),
                    status: 'preparing',
                    paymentStatus: 'pending',
                    approvedBy: admin._id,
                    approvedAt: new Date(Date.now() - 900000),
                },
                {
                    user: user._id,
                    tableNumber: 2,
                    items: [
                        { menuItem: createdMenuItems[3]._id, name: createdMenuItems[3].name, quantity: 1, price: createdMenuItems[3].price },
                        { menuItem: createdMenuItems[13]._id, name: createdMenuItems[13].name, quantity: 2, price: createdMenuItems[13].price },
                    ],
                    totalAmount: createdMenuItems[3].price + (createdMenuItems[13].price * 2),
                    status: 'pending',
                    paymentStatus: 'pending',
                },
            ];

            const createdOrders = await Order.insertMany(sampleOrders);
            console.log(`✓ Inserted ${createdOrders.length} sample orders`);

            // Mark tables as occupied where orders are active
            await Table.findOneAndUpdate({ tableNumber: 5 }, { status: 'occupied', currentOrder: createdOrders[1]._id });
            await Table.findOneAndUpdate({ tableNumber: 2 }, { status: 'occupied', currentOrder: createdOrders[2]._id });
            console.log('✓ Updated table statuses for active orders');
        } else {
            console.log('⚠ No user/admin found — sample orders skipped. Register users first, then re-run seed.');
        }

        console.log('\n✅ Seeding complete! Your Smart Café DB is ready.');
        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error.message);
        process.exit(1);
    }
};

seed();