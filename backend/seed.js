require('dotenv').config()
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const QRCode = require('qrcode')

const User = require('./models/User')
const Menu = require('./models/Menu')
const Table = require('./models/Table')
const Inventory = require('./models/Inventory')
const Coupon = require('./models/Coupon')

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/smartcafe'
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

async function seed() {
  await mongoose.connect(MONGO_URI)
  console.log('Connected to MongoDB')

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Menu.deleteMany({}),
    Table.deleteMany({}),
    Inventory.deleteMany({}),
    Coupon.deleteMany({}),
  ])
  console.log('Cleared existing data')

  // Create users
  const users = await User.create([
    { name: 'Admin User', email: 'admin@cafe.com', password: 'admin123', role: 'admin' },
    { name: 'Kitchen Staff', email: 'kitchen@cafe.com', password: 'kitchen123', role: 'kitchen' },
    { name: 'John Customer', email: 'user@cafe.com', password: 'user123', role: 'user' },
    { name: 'Priya Sharma', email: 'priya@cafe.com', password: 'user123', role: 'user' },
  ])
  console.log(`Created ${users.length} users`)

  // Create inventory items
  const inventoryItems = await Inventory.create([
    { name: 'Coffee Beans', unit: 'kg', currentStock: 25, minimumStock: 5, costPerUnit: 800, supplier: 'Bean Masters' },
    { name: 'Milk', unit: 'liters', currentStock: 8, minimumStock: 10, costPerUnit: 60, supplier: 'Dairy Fresh' },
    { name: 'Sugar', unit: 'kg', currentStock: 15, minimumStock: 3, costPerUnit: 45, supplier: 'Sweet Supply' },
    { name: 'Bread', unit: 'loaves', currentStock: 3, minimumStock: 5, costPerUnit: 40, supplier: 'City Bakery' },
    { name: 'Eggs', unit: 'dozen', currentStock: 10, minimumStock: 4, costPerUnit: 80, supplier: 'Farm Fresh' },
    { name: 'Butter', unit: 'kg', currentStock: 4, minimumStock: 2, costPerUnit: 500, supplier: 'Dairy Fresh' },
    { name: 'Tea Leaves', unit: 'kg', currentStock: 6, minimumStock: 2, costPerUnit: 300, supplier: 'Tea World' },
    { name: 'Chocolate Syrup', unit: 'liters', currentStock: 2, minimumStock: 1, costPerUnit: 350, supplier: 'Sweet Supply' },
  ])
  console.log(`Created ${inventoryItems.length} inventory items`)

  // Create menu items
  const menuItems = await Menu.create([
    { name: 'Espresso', description: 'Rich, bold shot of premium espresso', price: 80, category: 'Beverages', available: true, inventoryItem: inventoryItems[0]._id },
    { name: 'Cappuccino', description: 'Espresso with steamed milk foam', price: 120, category: 'Beverages', available: true, inventoryItem: inventoryItems[0]._id },
    { name: 'Masala Chai', description: 'Indian spiced tea with ginger and cardamom', price: 60, category: 'Beverages', available: true, inventoryItem: inventoryItems[6]._id },
    { name: 'Cold Brew', description: 'Slow-steeped cold coffee, served over ice', price: 150, category: 'Beverages', available: true },
    { name: 'Butter Toast', description: 'Crispy golden toast with fresh butter', price: 50, category: 'Snacks', available: true, inventoryItem: inventoryItems[3]._id },
    { name: 'Egg Sandwich', description: 'Fluffy scrambled eggs on toasted bread', price: 90, category: 'Snacks', available: true, inventoryItem: inventoryItems[4]._id },
    { name: 'Veg Panini', description: 'Grilled panini with fresh vegetables and cheese', price: 130, category: 'Snacks', available: true },
    { name: 'Pancakes', description: 'Fluffy stack of pancakes with maple syrup', price: 160, category: 'Meals', available: true },
    { name: 'Oats Bowl', description: 'Warm oats with seasonal fruits and honey', price: 110, category: 'Meals', available: true },
    { name: 'Club Sandwich', description: 'Triple-decker sandwich with veggies and cheese', price: 180, category: 'Meals', available: true },
    { name: 'Chocolate Cake', description: 'Rich moist chocolate cake slice', price: 120, category: 'Desserts', available: true, inventoryItem: inventoryItems[7]._id },
    { name: 'Brownie', description: 'Warm gooey chocolate brownie', price: 90, category: 'Desserts', available: true },
    { name: 'Chef\'s Special Pasta', description: 'Creamy pasta with seasonal vegetables', price: 220, category: 'Specials', available: true },
    { name: 'Morning Combo', description: 'Cappuccino + Butter Toast + Egg', price: 200, category: 'Specials', available: true },
  ])
  console.log(`Created ${menuItems.length} menu items`)

  // Create tables with QR codes
  const tablesData = []
  for (let i = 1; i <= 8; i++) {
    const qrUrl = `${FRONTEND_URL}/order-table?table=${i}`
    const qrCode = await QRCode.toDataURL(qrUrl)
    tablesData.push({ tableNumber: i, capacity: i <= 4 ? 2 : i <= 6 ? 4 : 6, qrCode })
  }
  const tables = await Table.insertMany(tablesData)
  console.log(`Created ${tables.length} tables`)

  // Create coupons
  const now = new Date()
  const nextMonth = new Date(now)
  nextMonth.setMonth(nextMonth.getMonth() + 1)

  await Coupon.create([
    {
      code: 'WELCOME20',
      discountType: 'percentage',
      discountValue: 20,
      minOrderAmount: 100,
      maxDiscount: 100,
      usageLimit: 100,
      validFrom: now,
      validUntil: nextMonth,
      active: true,
    },
    {
      code: 'FLAT50',
      discountType: 'fixed',
      discountValue: 50,
      minOrderAmount: 200,
      usageLimit: 50,
      validFrom: now,
      validUntil: nextMonth,
      active: true,
    },
    {
      code: 'SAVE10',
      discountType: 'percentage',
      discountValue: 10,
      minOrderAmount: 0,
      validFrom: now,
      validUntil: nextMonth,
      active: true,
    },
  ])
  console.log('Created 3 coupons')

  console.log('\n✅ Seed complete!')
  console.log('\nDemo accounts:')
  console.log('  Admin:   admin@cafe.com / admin123')
  console.log('  Kitchen: kitchen@cafe.com / kitchen123')
  console.log('  User:    user@cafe.com / user123')
  console.log('\nDemo coupons:')
  console.log('  WELCOME20 — 20% off (max ₹100), min ₹100')
  console.log('  FLAT50    — ₹50 off, min ₹200')
  console.log('  SAVE10    — 10% off, no minimum')

  await mongoose.disconnect()
  process.exit(0)
}

seed().catch(err => {
  console.error('Seed error:', err)
  process.exit(1)
})
