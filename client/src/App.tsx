import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Login from './pages/Login'
import AppLayout from './pages/AppLayout'
import Home from './pages/Home'
import Products from './pages/Products'
import ProductPage from './pages/ProductPage'
import SearchHistory from './pages/SearchHistory'
import FlashDeals from './pages/FlashDeals'
import Checkout from './pages/Checkout'
import MyOrders from './pages/MyOrders'
import OrderTracking from './pages/OrderTracking'
import Address from './pages/Address'
import ProtectedRoute from './components/ProtectedRoute'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProducts from './pages/admin/AdminProducts'
import AdminProductForm from './pages/admin/AdminProductForm'
import AdminOrders from './pages/admin/AdminOrders'
import AdminDeliveryPartners from './pages/admin/AdminDeliveryPartners'
import DeliveryLogin from './pages/delivery/DeliveryLogin'
import DeliveryLayout from './pages/delivery/DeliveryLayout'
import DeliveryDashboard from './pages/delivery/DeliveryDashboard'

function App() {
  return (
    <>
      <Toaster position="top-right" containerClassName="custom-toast-container" toastOptions={{className: 'custom-toast',}} />
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/' element={<AppLayout />}>
          <Route index element={<Home />} />
          <Route path='products' element={<Products />} />
          <Route path='products/:id' element={<ProductPage />} />
          <Route path='search' element={<SearchHistory />} />
          <Route path='deals' element={<FlashDeals />} />
          <Route element={<ProtectedRoute />}>
            <Route path='checkout' element={<Checkout />} />
            <Route path='orders' element={<MyOrders />} />
            <Route path='orders/:id' element={<OrderTracking />} />
            <Route path='address' element={<Address />} />
          </Route>
        </Route>
        
        {/* Admin pages */}
        <Route path='/admin' element={<AdminLayout />}>
         <Route index element={<AdminDashboard />} />
         <Route path='products' element={<AdminProducts />} />
         <Route path='products/new' element={<AdminProductForm />} />
         <Route path='products/:id/edit' element={<AdminProductForm />} />
         <Route path='orders' element={<AdminOrders />} />
         <Route path='delivery-partners' element={<AdminDeliveryPartners />} />
        </Route>

        {/* Delivery Partner pages */}
        <Route path='/delivery/login' element={<DeliveryLogin />}/>
        <Route path='/delivery' element={<DeliveryLayout />}>
          <Route index element={<DeliveryDashboard />} />
        </Route>     
      </Routes>
    </>
  )
}

export default App
