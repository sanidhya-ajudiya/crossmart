import { Outlet } from "react-router-dom"
import Banner from "../components/Banner"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import CartSildeBar from "../components/CartSildeBar"

const AppLayout = () => {
  return (
    <>
     <Banner />
     <Navbar />
     <main className="main">
       <Outlet />
      </main>
      <Footer />
      <CartSildeBar />
    </>
  )
}

export default AppLayout