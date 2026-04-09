# Smart Café Management System

A full-stack café management application with 15 advanced features.

## Tech Stack
- **Frontend**: React (Vite), Redux Toolkit, React Router v6, Tailwind CSS, Chart.js, Socket.io-client, i18next, jsPDF
- **Backend**: Node.js, Express, MongoDB (Mongoose), Socket.io, JWT, Razorpay, Nodemailer, QRCode, json2csv

## 15 Features
1. ✅ Real-time WebSocket notifications (Socket.io)
2. ✅ Advanced analytics dashboard (Chart.js — sales, revenue, popular items)
3. ✅ Payment integration (Razorpay test mode + simulation)
4. ✅ Inventory management with low-stock alerts
5. ✅ Customer feedback & star ratings
6. ✅ QR code table ordering
7. ✅ Email notifications (Nodemailer)
8. ✅ Multi-language support (English + Hindi via i18next)
9. ✅ PDF invoice generation (jsPDF)
10. ✅ Staff management with clock-in/out
11. ✅ Advanced table reservations with time slots
12. ✅ Discount/coupon system (% and fixed)
13. ✅ Order cancellation
14. ✅ Kitchen display with elapsed timer
15. ✅ CSV data export (orders, menu, inventory, staff)

---

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone & Setup

```bash
# Backend
cd backend
cp .env.example .env
# Edit .env with your credentials
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment (backend/.env)

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/smartcafe
JWT_SECRET=your_super_secret_jwt_key_change_this
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
FRONTEND_URL=http://localhost:5173
```

### 3. Seed Demo Data (optional)

```bash
cd backend
node seed.js
```

### 4. Run Development

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

Open http://localhost:5173

### Demo Credentials
| Role    | Email              | Password   |
|---------|--------------------|------------|
| Admin   | admin@cafe.com     | admin123   |
| Kitchen | kitchen@cafe.com   | kitchen123 |
| User    | user@cafe.com      | user123    |

---

## Project Structure

```
cafe-system/
├── backend/
│   ├── controllers/       # Business logic
│   ├── middleware/        # Auth middleware
│   ├── models/            # Mongoose schemas
│   ├── routes/            # Express routers
│   ├── services/          # Email & Razorpay
│   └── server.js          # Entry point + Socket.io
└── frontend/
    └── src/
        ├── components/    # Shared & kitchen components
        ├── pages/
        │   ├── Admin/     # All admin pages
        │   ├── Kitchen/   # Kitchen display
        │   └── User/      # Customer pages
        ├── redux/slices/  # State management
        ├── App.jsx        # Routes + socket listeners
        ├── i18n.js        # English & Hindi translations
        └── socket.js      # Socket.io singleton
```

## API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | /api/auth/register | — | Register user |
| POST | /api/auth/login | — | Login |
| GET | /api/orders | User+ | Get orders |
| POST | /api/orders | User | Place order |
| PUT | /api/orders/:id/status | Kitchen/Admin | Update status |
| PUT | /api/orders/:id/cancel | User | Cancel order |
| GET | /api/menu | — | Get menu |
| GET/POST/PUT/DELETE | /api/menu/:id | Admin | CRUD menu |
| GET/POST | /api/tables | Admin | Manage tables |
| GET | /api/analytics/stats | Admin | Dashboard stats |
| GET | /api/analytics/sales | Admin | Sales by period |
| GET/POST/PUT/DELETE | /api/inventory | Admin | Inventory CRUD |
| POST | /api/inventory/:id/restock | Admin | Restock item |
| GET/POST | /api/feedback | Admin/User | Feedback |
| GET/POST | /api/reservations | User+ | Reservations |
| GET/POST/PUT/DELETE | /api/coupons | Admin | Coupon CRUD |
| POST | /api/coupons/validate | User | Validate coupon |
| GET/POST | /api/staff | Admin | Staff CRUD |
| POST | /api/staff/:id/clock-in | Admin | Clock in |
| POST | /api/staff/:id/clock-out | Admin | Clock out |
| POST | /api/payment/initiate/:orderId | User | Start payment |
| POST | /api/payment/verify | User | Verify payment |
| POST | /api/payment/simulate/:orderId | User | Simulate payment |
| GET | /api/export/orders | Admin | Export CSV |
| GET | /api/export/menu | Admin | Export CSV |
| GET | /api/export/inventory | Admin | Export CSV |
| GET | /api/export/staff | Admin | Export CSV |

## Socket Events

| Event | Direction | Payload |
|-------|-----------|---------|
| new_order | Server→Client | Order object |
| order_updated | Server→Client | Updated order |
| order_status_changed | Server→User | {orderId, status} |
| payment_completed | Server→Client | {orderId} |
| low_stock_alert | Server→Admin | {item, stock, minimum} |
