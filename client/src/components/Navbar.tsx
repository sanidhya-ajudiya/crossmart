import { ArrowUpRightIcon, ChevronDownIcon, LogOutIcon, MapPinIcon, MenuIcon, PackageIcon, SearchIcon, ShieldIcon, ShoppingCartIcon, UserIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import crossmartIcon from "../assets/crossmart-icon.svg";

import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const {cartCount, setIsCartOpen} = useCart();
  
  const [searchQuery, setSearchQuery] = useState("")
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>)=>{
    e.preventDefault()
    if(searchQuery.trim()){
        navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
        setSearchQuery("")
    }
  }

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate("/");
  }


  return (
    <nav className="navbar-container">
     <div className="navbar-flex">
       {/* Logo */}
       <Link to="/" className="navbar-logo">
         <img src={crossmartIcon} alt="CrossMart icon" className="navbar-logo-icon" />
         <span className="logo-accent">cross</span>mart
       </Link>

       <div className="nav-links">
        <div className="nav-desktop">
          <Link to="/">Home</Link>
          <Link to="/products">Products</Link>
          <Link to="/deals">Deals</Link>
        </div>

        {/* search bar */}
         <form onSubmit={handleSearch} className="nav-search">
            <SearchIcon />
            <input type="text" placeholder="Search products..." value={searchQuery} onChange={(e)=>setSearchQuery(e.target.value)} className="nav-products" />  
         </form>

       {/* Right Actions */}
       <div className="navbar-right">
        {/* Cart */}
        <button className="cart-btn" onClick={()=>setIsCartOpen(true)}>
           <ShoppingCartIcon className="cart-icon" /> 
           {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
        </button>
        {/* User */}
        <div className="user-menu">
          {user ? (
            <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="user-btn">
              <div className="user-avtar">
                {user.name.charAt(0).toUpperCase()} 
              </div>
             <ChevronDownIcon className="chevron-icon"  /> 
            </button>
          ) : (
            <div className="login-btn">
              <Link to='/login' className="login-link"><UserIcon size={16} />Sign in</Link>
              {userMenuOpen ? <XIcon className="close-btn" onClick={()=> setUserMenuOpen(!userMenuOpen)}/> : <MenuIcon className="menu-icon" onClick={()=> setUserMenuOpen(!userMenuOpen)}/>}
            </div>
          )}
          {userMenuOpen && (
            <>
             <div className="user-dropdown">
                <div className="user-dropdown-header">
                  {user && (
                    <div className="user-info">
                      <p>{user?.name}</p>  
                      <p>{user?.email}</p>  
                    </div>
                  )} 
                  <div onClick={() => setUserMenuOpen(false)}>
                    {!user && <Link to='/login'><UserIcon size={16} /> Sign In </Link>} 
                    {user && <Link to='/orders'><PackageIcon size={16} /> My Orders </Link>} 
                    {user && <Link to='/address'><MapPinIcon size={16} /> Address </Link>} 
                    <Link to="/products" className="dropdown-link"><ArrowUpRightIcon size={16}/>Products</Link>
                    <Link to="/deals" className="dropdown-link"><ArrowUpRightIcon size={16}/>Deals</Link>
                    {user?.role === 'admin' && (<Link to="/admin" className="dropdown-link"><ShieldIcon size={16}/><span>Admin Panel</span></Link>)}
                    {user && (
                      <div className="dropdown-button">
                        <button onClick={handleLogout}>
                          <LogOutIcon size={16} /> Logout  
                        </button>
                      </div>  
                    )}
                  </div>
                </div> 
             </div>
            </>
          )}  
        </div>
        </div>  
       </div>
     </div>
    </nav>
  )
}

export default Navbar