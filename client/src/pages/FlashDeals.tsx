import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Heart, ShoppingCart, Star, ChevronRight, Zap } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import { toast } from "react-hot-toast"
import type { Product } from "../types.ts"
import { useCart } from "../context/CartContext"

import prod1 from "../assets/products/products- 01.png"
import prod2 from "../assets/products/products- 02.png"
import prod3 from "../assets/products/products- 03.png"
import prod4 from "../assets/products/products-04.png"
import prod5 from "../assets/products/products-05.png"
import prod6 from "../assets/products/products-06.png"
import prod7 from "../assets/products/products-07.png"
import prod8 from "../assets/products/products-08.png"

/* ─── Flash Deal product type extends Product with deal info ── */
interface FlashProduct extends Product {
  dealPrice: number
  stock: number
  sold: number
}

/* ─── Flash deals data ───────────────────────────────────────── */
const FLASH_PRODUCTS: FlashProduct[] = [
  { id: "f-1",  name: "Organic Fresh Bananas",   category: "fruits-vegetables", categoryLabel: "Fruits & Veg",   price: 45,  dealPrice: 45,  originalPrice: 70,  unit: "doz",  rating: 4.8, reviewsCount: 96,  image: prod1, badge: "35% OFF", stock: 50,  sold: 38 },
  { id: "f-2",  name: "Sweet Red Strawberries",  category: "fruits-vegetables", categoryLabel: "Fruits & Veg",   price: 89,  dealPrice: 89,  originalPrice: 150, unit: "box",  rating: 4.9, reviewsCount: 148, image: prod2, badge: "40% OFF", stock: 30,  sold: 24 },
  { id: "f-3",  name: "Pure Wildflower Honey",   category: "pantry",            categoryLabel: "Organic Pantry", price: 199, dealPrice: 199, originalPrice: 320, unit: "jar",  rating: 4.9, reviewsCount: 215, image: prod3, badge: "38% OFF", stock: 20,  sold: 17 },
  { id: "f-4",  name: "Artisan Sourdough Bread", category: "bakery",            categoryLabel: "Bakery",          price: 65,  dealPrice: 65,  originalPrice: 100, unit: "loaf", rating: 4.7, reviewsCount: 84,  image: prod4, badge: "Sale",    stock: 40,  sold: 29 },
  { id: "f-5",  name: "Fresh Farm Whole Milk",   category: "dairy-eggs",        categoryLabel: "Dairy & Eggs",   price: 52,  dealPrice: 52,  originalPrice: 75,  unit: "L",    rating: 4.8, reviewsCount: 310, image: prod5, badge: "30% OFF", stock: 60,  sold: 51 },
  { id: "f-6",  name: "Organic Free-Range Eggs", category: "dairy-eggs",        categoryLabel: "Dairy & Eggs",   price: 79,  dealPrice: 79,  originalPrice: 130, unit: "pack", rating: 4.9, reviewsCount: 175, image: prod6, badge: "Hot",     stock: 35,  sold: 31 },
  { id: "f-7",  name: "Fresh Hass Avocados",     category: "fruits-vegetables", categoryLabel: "Fruits & Veg",   price: 110, dealPrice: 110, originalPrice: 160, unit: "kg",   rating: 4.6, reviewsCount: 52,  image: prod7, badge: "Sale",    stock: 25,  sold: 18 },
  { id: "f-8",  name: "Organic Rolled Oats",     category: "pantry",            categoryLabel: "Organic Pantry", price: 99,  dealPrice: 99,  originalPrice: 160, unit: "pack", rating: 4.7, reviewsCount: 93,  image: prod8, badge: "38% OFF", stock: 45,  sold: 37 },
]

/* ─── Countdown end: 3 hours from page load ─────────────────── */
const DEAL_END = Date.now() + 3 * 60 * 60 * 1000

const pad = (n: number) => String(n).padStart(2, "0")

/* ─── Component ──────────────────────────────────────────────── */
const FlashDeals = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { items, addToCart: globalAddToCart, updateQuantity: globalUpdateQuantity } = useCart()

  const [wishlist, setWishlist]   = useState<Record<string, boolean>>({})
  const [timeLeft, setTimeLeft]   = useState({ h: "02", m: "59", s: "59" })
  const [expired, setExpired]     = useState(false)

  /* Live countdown */
  useEffect(() => {
    const tick = () => {
      const diff = DEAL_END - Date.now()
      if (diff <= 0) { setExpired(true); return }
      const h = Math.floor(diff / 3_600_000)
      const m = Math.floor((diff % 3_600_000) / 60_000)
      const s = Math.floor((diff % 60_000) / 1_000)
      setTimeLeft({ h: pad(h), m: pad(m), s: pad(s) })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  /* Cart helpers */
  const addToCart = (id: string, name: string) => {
    if (!isAuthenticated) {
      toast.error("Please login to add items to your cart.");
      navigate("/login");
      return;
    }
    const product = FLASH_PRODUCTS.find(p => p.id === id)
    if (!product) return
    globalAddToCart(product, 1)
    const qty = (items.find(i => i.product.id === id)?.quantity || 0) + 1
    toast.success(`Added ${name} to cart (×${qty})!`, {
      icon: "🛒",
      style: { borderRadius: "10px", background: "var(--card-bg)", color: "var(--text-primary)" }
    })
  }

  const updateQuantity = (id: string, name: string, delta: number) => {
    if (!isAuthenticated) {
      toast.error("Please login to manage your cart.");
      navigate("/login");
      return;
    }
    const item = items.find(i => i.product.id === id)
    if (!item) return
    const newQty = item.quantity + delta
    globalUpdateQuantity(id, newQty)
    if (newQty <= 0)
      toast.success(`Removed ${name} from cart.`, {
        style: { borderRadius: "10px", background: "var(--card-bg)", color: "var(--text-primary)" }
      })
  }

  const toggleWishlist = (id: string, name: string) => {
    setWishlist(prev => {
      const next = { ...prev, [id]: !prev[id] }
      toast.success(next[id] ? `Added ${name} to wishlist!` : `Removed ${name} from wishlist.`, {
        icon: next[id] ? "❤️" : undefined,
        style: { borderRadius: "10px", background: "var(--card-bg)", color: "var(--text-primary)" }
      })
      return next
    })
  }

  return (
    <div className="flash-page">

      {/* ── Hero Banner ── */}
      <div className="flash-hero">
        <div className="flash-hero-inner">
          <div className="flash-hero-badge">
            <Zap size={14} />
            Limited Time
          </div>
          <h1 className="flash-hero-title">⚡ Flash Deals</h1>
          <p className="flash-hero-sub">Massive discounts on fresh organic favorites — today only.</p>

          {/* Countdown Timer */}
          <div className="flash-countdown">
            {expired ? (
              <span className="flash-expired">Deals have ended. Check back tomorrow!</span>
            ) : (
              <>
                <div className="countdown-item">
                  <span className="countdown-number">{timeLeft.h}</span>
                  <span className="countdown-label">hours</span>
                </div>
                <span className="countdown-separator">:</span>
                <div className="countdown-item">
                  <span className="countdown-number">{timeLeft.m}</span>
                  <span className="countdown-label">mins</span>
                </div>
                <span className="countdown-separator">:</span>
                <div className="countdown-item">
                  <span className="countdown-number">{timeLeft.s}</span>
                  <span className="countdown-label">secs</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Products ── */}
      <section className="flash-section">
        <div className="flash-section-inner">

          <div className="flash-grid">
            {FLASH_PRODUCTS.map(product => {
              const inCartQty    = items.find(i => i.product.id === product.id)?.quantity || 0
              const isWishlisted = wishlist[product.id] || false
              const pct          = Math.round((product.sold / product.stock) * 100)
              const remaining    = product.stock - product.sold

              return (
                <div key={product.id} className="flash-card">

                  {/* Image area */}
                  <div className="product-image-container">
                    {product.badge && (
                      <span className={`product-badge ${product.badge.toLowerCase().includes("off") || product.badge === "Sale" ? "badge-sale" : "badge-popular"}`}>{product.badge}</span>
                    )}
                    <button className={`wishlist-btn ${isWishlisted ? "wishlisted" : ""}`} onClick={() => toggleWishlist(product.id, product.name)} aria-label="Toggle Wishlist">
                      <Heart className="heart-icon" size={18} fill={isWishlisted ? "var(--danger)" : "none"} />
                    </button>
                    <Link to={`/products/${product.id}`} className="image-link">
                      <img src={product.image} alt={product.name} className="product-card-img" />
                    </Link>
                  </div>

                  {/* Details */}
                  <div className="product-details">
                    <span className="product-category">{product.categoryLabel}</span>
                    <Link to={`/products/${product.id}`} className="product-title-link">
                      <h3 className="product-title">{product.name}</h3>
                    </Link>

                    {/* Rating */}
                    <div className="product-rating">
                      <Star size={13} fill="var(--accent-500)" className="star-icon" />
                      <span className="rating-value">{product.rating}</span>
                      <span className="reviews-count">({product.reviewsCount})</span>
                    </div>

                    {/* Stock progress bar */}
                    <div className="flash-stock">
                      <div className="flash-stock-bar">
                        <div className="flash-stock-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="flash-stock-label">
                        {remaining <= 5
                          ? <strong style={{ color: "var(--danger)" }}>Only {remaining} left!</strong>
                          : `${remaining} remaining`}
                      </span>
                    </div>

                    {/* Price + Cart */}
                    <div className="product-footer">
                      <div className="product-price-wrapper">
                        <span className="product-price">₹{product.dealPrice}</span>
                        <span className="price-unit">/{product.unit}</span>
                        {product.originalPrice && (
                          <span className="product-old-price">₹{product.originalPrice}</span>
                        )}
                      </div>

                      <div className="add-to-cart-wrapper">
                        {inCartQty > 0 ? (
                          <div className="quantity-selector">
                            <button className="qty-btn" onClick={() => updateQuantity(product.id, product.name, -1)} aria-label="Decrease">−</button>
                            <span className="qty-value">{inCartQty}</span>
                            <button className="qty-btn" onClick={() => updateQuantity(product.id, product.name, 1)} aria-label="Increase">+</button>
                          </div>
                        ) : (
                          <button className="add-to-cart-btn" onClick={() => addToCart(product.id, product.name)} aria-label="Add to Cart">
                            <ShoppingCart size={15} />
                            <span>Add</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* ── CTA Banner ── */}
          <div className="flash-cta-banner">
            <div className="flash-cta-glow" />
            <div className="flash-cta-content">
              <Zap size={32} className="flash-cta-icon" />
              <div>
                <h3 className="flash-cta-title">Don't Miss Out!</h3>
                <p className="flash-cta-sub">These deals expire when the timer hits zero. Grab yours now.</p>
              </div>
              <Link to="/products" className="flash-cta-btn">
                Shop All Products
                <ChevronRight size={16} />
              </Link>
            </div>
          </div>

        </div>
      </section>
    </div>
  )
}

export default FlashDeals