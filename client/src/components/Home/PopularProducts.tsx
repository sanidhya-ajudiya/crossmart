import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Heart, ShoppingCart, Star, Plus, Minus } from "lucide-react"
import { toast } from "react-hot-toast"
import { apiFetch } from "../../utils/api"
import { useAuth } from "../../context/AuthContext"


import type { Product } from "../../types.ts"
import { useCart } from "../../context/CartContext"




const CATEGORIES = [
  { id: "all", label: "All Products" },
  { id: "fruits-vegetables", label: "Fruits & Veggies" },
  { id: "dairy-eggs", label: "Dairy & Eggs" },
  { id: "bakery", label: "Bakery" },
  { id: "pantry", label: "Pantry" }
]

const PopularProducts = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [activeCategory, setActiveCategory] = useState("all")
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({})
  const { items, addToCart: globalAddToCart, updateQuantity: globalUpdateQuantity } = useCart()
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await apiFetch("/products")
        const transformed = data.map((p: any) => ({
          ...p,
          id: p._id || p.id
        }))
        setProducts(transformed)
      } catch (err) {
        console.error("Failed to load popular products:", err)
      }
    }
    loadProducts()
  }, [])

  const filteredProducts = activeCategory === "all"
    ? products
    : products.filter(p => p.category === activeCategory)

  const toggleWishlist = (id: string, name: string) => {
    setWishlist(prev => {
      const updated = { ...prev, [id]: !prev[id] }
      if (updated[id]) {
        toast.success(`Added ${name} to wishlist!`, {
          icon: '❤️',
          style: {
            borderRadius: '10px',
            background: 'var(--card-bg)',
            color: 'var(--text-primary)',
          }
        })
      } else {
        toast.success(`Removed ${name} from wishlist.`, {
          style: {
            borderRadius: '10px',
            background: 'var(--card-bg)',
            color: 'var(--text-primary)',
          }
        })
      }
      return updated
    })
  }

  const addToCart = (id: string, name: string) => {
    if (!isAuthenticated) {
      toast.error("Please login to add items to your cart.");
      navigate("/login");
      return;
    }
    const product = products.find(p => p.id === id)
    if (!product) return

    globalAddToCart(product, 1)
    const existingItem = items.find(item => item.product.id === id)
    const qty = (existingItem?.quantity || 0) + 1

    toast.success(`Added ${name} to cart (x${qty})!`, {
      icon: '🛒',
      style: {
        borderRadius: '10px',
        background: 'var(--card-bg)',
        color: 'var(--text-primary)',
      }
    })
  }

  const updateQuantity = (id: string, name: string, delta: number) => {
    if (!isAuthenticated) {
      toast.error("Please login to manage your cart.");
      navigate("/login");
      return;
    }
    const existingItem = items.find(item => item.product.id === id)
    if (!existingItem) return

    const newQty = existingItem.quantity + delta
    globalUpdateQuantity(id, newQty)

    if (newQty <= 0) {
      toast.success(`Removed ${name} from cart.`, {
        style: {
          borderRadius: '10px',
          background: 'var(--card-bg)',
          color: 'var(--text-primary)',
        }
      })
    }
  }

  return (
    <section className="popular-products-section">
      <div className="section-header">
        <div className="header-text-wrapper">
          <h2 className="section-title">Popular Products</h2>
          <p className="section-desc">Handpicked organic favorites loved by our community.</p>
        </div>

        {/* Categories Tabs Filter */}
        <div className="popular-tabs">
          {CATEGORIES.map(cat => (
            <button key={cat.id} className={`tab-btn ${activeCategory === cat.id ? "active" : ""}`} onClick={() => setActiveCategory(cat.id)}> {cat.label}</button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="products-grid">
        {filteredProducts.map(product => {
          const inCartQty = items.find(item => item.product.id === product.id)?.quantity || 0
          const isWishlisted = wishlist[product.id] || false

          return (
            <div key={product.id} className="product-card">
              {/* Image & Badges Container */}
              <div className="product-image-container">
                {product.badge && (
                  <span className={`product-badge ${product.badge.toLowerCase().includes('off') || product.badge.toLowerCase() === 'sale' ? 'badge-sale' : 'badge-popular'}`}>
                    {product.badge}
                  </span>
                )}
                <button className={`wishlist-btn ${isWishlisted ? "wishlisted" : ""}`} onClick={() => toggleWishlist(product.id, product.name)} aria-label="Toggle Wishlist"> <Heart className="heart-icon" size={18} fill={isWishlisted ? "var(--danger)" : "none"} /></button>
                <Link to={`/products/${product.id}`} className="image-link"><img src={product.image} alt={product.name} className="product-card-img" /></Link>
              </div>

              {/* Product Info */}
              <div className="product-details">
                <span className="product-category">{product.categoryLabel}</span>
                <Link to={`/products/${product.id}`} className="product-title-link">
                  <h3 className="product-title">{product.name}</h3>
                </Link>

                {/* Rating */}
                <div className="product-rating">
                  <div className="stars-wrapper">
                    <Star className="star-icon" size={14} fill="var(--accent-500)" />
                  </div>
                  <span className="rating-value">{product.rating}</span>
                  <span className="reviews-count">({product.reviewsCount} reviews)</span>
                </div>

                {/* Price and Add to Cart action */}
                <div className="product-footer">
                  <div className="product-price-wrapper">
                    <span className="product-price">₹{product.price}</span>
                    <span className="price-unit">/{product.unit}</span>
                    {product.originalPrice && (
                      <span className="product-old-price">₹{product.originalPrice}</span>
                    )}
                  </div>

                  <div className="add-to-cart-wrapper">
                    {inCartQty > 0 ? (
                      <div className="quantity-selector">
                        <button className="qty-btn" onClick={() => updateQuantity(product.id, product.name, -1)} aria-label="Decrease Quantity"> <Minus size={14} /></button>
                        <span className="qty-value">{inCartQty}</span>
                        <button className="qty-btn" onClick={() => updateQuantity(product.id, product.name, 1)} aria-label="Increase Quantity"> <Plus size={14} /> </button>
                      </div>
                    ) : (
                      <button className="add-to-cart-btn" onClick={() => addToCart(product.id, product.name)} aria-label="Add to Cart"> <ShoppingCart size={16} /> <span>Add</span> </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default PopularProducts
