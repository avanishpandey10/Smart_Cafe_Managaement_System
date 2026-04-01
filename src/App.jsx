import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { useSelector } from 'react-redux'
import { useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { Home, Auth, Orders } from "./pages"
import Header from './components/shared/Headers'
import UserDashboard from './pages/User/UserDashboard'
import AdminDashboard from './pages/Admin/AdminDashboard'
import KitchenDashboard from './pages/Kitchen/KitchenDashboard'
import CustomCursor from './components/shared/CustomCursor'
import SplashScreen from './components/shared/SplashScreen'

function App() {
  const { user } = useSelector((state) => state.auth)
  const [showSplash, setShowSplash] = useState(true)
  return (
    <div>
      <CustomCursor />
      {showSplash && (
                <SplashScreen onComplete={() => setShowSplash(false)} />
            )}
      <Router>
        <Toaster position="top-right" />
        {user && <Header />}
        <Routes>
          <Route path="/" element={user ? (
            user.role === 'admin' ? <Navigate to="/admin" /> :
              user.role === 'kitchen' ? <Navigate to="/kitchen" /> :
                <Navigate to="/user" />
          ) : <Navigate to="/auth" />} />

          <Route path="/auth" element={!user ? <Auth /> : <Navigate to="/" />} />
          <Route path="/user" element={user?.role === 'user' ? <UserDashboard /> : <Navigate to="/" />} />
          <Route path="/admin" element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />} />
          <Route path="/kitchen" element={user?.role === 'kitchen' ? <KitchenDashboard /> : <Navigate to="/" />} />
          <Route path="/orders" element={<Orders />} />
        </Routes>
      </Router>
    </div>
  )
}

export default App