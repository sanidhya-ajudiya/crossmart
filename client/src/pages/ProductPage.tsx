import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Star, ShoppingCart, Heart, Plus, Minus, ChevronRight,
  Truck, ShieldCheck, RotateCcw, Leaf, ChevronLeft,
  Share2, Award, Zap, Package,
} from "lucide-react";
import { toast } from "react-hot-toast";
import type { Product } from "../types";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

import { useEffect } from "react";
import { apiFetch } from "../utils/api";
import Loading from "../components/Loading";

/* ─── Extra per-product detail data ──────────────────────────── */
const PRODUCT_DETAILS: Record<string, { description: string; highlights: string[]; nutrition: { label: string; value: string }[] }> = {
  "prod-1": {
    description: "Hand-picked from certified organic farms, our bananas ripen naturally to perfection. Rich in potassium and natural sugars, they make a wholesome snack or smoothie base for the whole family.",
    highlights: ["100% Certified Organic", "No pesticides or chemicals", "Ethically sourced from local farms", "Naturally ripened — no artificial agents"],
    nutrition: [{ label: "Calories", value: "89 kcal" }, { label: "Carbs", value: "23g" }, { label: "Potassium", value: "358mg" }, { label: "Fibre", value: "2.6g" }, { label: "Sugar", value: "12g" }, { label: "Protein", value: "1.1g" }],
  },
  "prod-2": {
    description: "Sun-kissed strawberries bursting with flavour, hand-harvested at peak ripeness. Each box is sorted for freshness so every bite delivers a juicy, naturally sweet experience.",
    highlights: ["Freshly harvested daily", "Rich in Vitamin C & antioxidants", "No added preservatives", "Perfect for desserts, jams & smoothies"],
    nutrition: [{ label: "Calories", value: "32 kcal" }, { label: "Carbs", value: "7.7g" }, { label: "Vitamin C", value: "58.8mg" }, { label: "Fibre", value: "2g" }, { label: "Sugar", value: "4.9g" }, { label: "Protein", value: "0.7g" }],
  },
  "prod-3": {
    description: "Raw, unfiltered honey collected directly from wildflower meadows. Bursting with natural enzymes, antioxidants and a complex floral aroma that sets it apart from processed alternatives.",
    highlights: ["Raw & unfiltered", "Single-origin wildflower source", "No added sugar or additives", "Naturally antibacterial"],
    nutrition: [{ label: "Calories", value: "304 kcal" }, { label: "Carbs", value: "82g" }, { label: "Sugar", value: "82g" }, { label: "Protein", value: "0.3g" }, { label: "Iron", value: "0.42mg" }, { label: "Calcium", value: "6mg" }],
  },
};

const DEFAULT_DETAIL = {
  description: "A premium quality product sourced directly from certified organic farms. Each item is carefully selected to meet the highest standards of freshness, taste, and nutritional value.",
  highlights: ["100% Certified Organic", "Farm-fresh quality", "No artificial preservatives", "Sustainably sourced"],
  nutrition: [{ label: "Calories", value: "—" }, { label: "Carbs", value: "—" }, { label: "Protein", value: "—" }, { label: "Fibre", value: "—" }, { label: "Sugar", value: "—" }, { label: "Fat", value: "—" }],
};

/* ─── Mock reviews ────────────────────────────────────────────── */
const MOCK_REVIEWS = [
  { id: 1, name: "Priya S.", rating: 5, date: "2 days ago",  comment: "Absolutely fresh and delicious! Came well packaged. Will definitely order again.", avatar: "PS" },
  { id: 2, name: "Rahul M.", rating: 5, date: "1 week ago",  comment: "Top quality as always. Delivery was quick and the product looked exactly like the photo.", avatar: "RM" },
  { id: 3, name: "Anita K.", rating: 4, date: "2 weeks ago", comment: "Great quality but one piece was slightly bruised. Otherwise very happy with the purchase.", avatar: "AK" },
  { id: 4, name: "Dev P.",   rating: 5, date: "3 weeks ago", comment: "Best organic produce I've had. Love how the app makes it easy to find good food.", avatar: "DP" },
];

type Tab = "description" | "nutrition" | "reviews";

/* ─── Component ───────────────────────────────────────────────── */
const ProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { items, addToCart: globalAddToCart, updateQuantity: globalUpdateQuantity } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  const detail  = (id && PRODUCT_DETAILS[id]) || DEFAULT_DETAIL;

  const [activeTab,    setActiveTab]    = useState<Tab>("description");
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [qty,          setQty]          = useState(1);

  const cartItem  = items.find((i) => i.product.id === id);
  const inCartQty = cartItem?.quantity ?? 0;

  // Fetch product detail
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const data = await apiFetch(`/products/${id}`);
        setProduct({
          ...data,
          id: data._id || data.id
        });
      } catch (err: any) {
        toast.error("Product not found.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  // Fetch related products
  useEffect(() => {
    if (product) {
      const loadRelated = async () => {
        try {
          const data = await apiFetch(`/products?category=${product.category}`);
          const transformed = data
            .map((p: any) => ({ ...p, id: p._id || p.id }))
            .filter((p: any) => p.id !== product.id)
            .slice(0, 4);
          setRelatedProducts(transformed);
        } catch (err) {
          console.error("Failed to load related products", err);
        }
      };
      loadRelated();
    }
  }, [product]);

  if (loading) return <Loading />;

  if (!product) {
    return (
      <div className="pp-not-found">
        <div className="pp-not-found-inner">
          <div className="pp-not-found-icon">🥕</div>
          <h2 className="pp-not-found-title">Product not found</h2>
          <p className="pp-not-found-sub">This item may have been removed or doesn't exist.</p>
          <Link to="/products" className="pp-back-btn">
            <ChevronLeft size={16} /> Browse Products
          </Link>
        </div>
      </div>
    );
  }

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  /* ── Cart actions ── */
  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error("Please login to add items to your cart.");
      navigate("/login");
      return;
    }
    globalAddToCart(product, qty);
    toast.success(`Added ${product.name} ×${qty} to cart!`, {
      icon: "🛒",
      style: { borderRadius: "10px", background: "var(--card-bg)", color: "var(--text-primary)" },
    });
  };

  const handleUpdateCart = (delta: number) => {
    if (!isAuthenticated) {
      toast.error("Please login to manage your cart.");
      navigate("/login");
      return;
    }
    const newQty = inCartQty + delta;
    globalUpdateQuantity(product.id, newQty);
    if (newQty <= 0) toast.success(`Removed ${product.name} from cart.`, {
      style: { borderRadius: "10px", background: "var(--card-bg)", color: "var(--text-primary)" },
    });
  };

  const handleWishlist = () => {
    setIsWishlisted((prev) => {
      toast.success(!prev ? `Added ${product.name} to wishlist!` : `Removed from wishlist.`, {
        icon: !prev ? "❤️" : undefined,
        style: { borderRadius: "10px", background: "var(--card-bg)", color: "var(--text-primary)" },
      });
      return !prev;
    });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      toast.success("Link copied to clipboard!", {
        style: { borderRadius: "10px", background: "var(--card-bg)", color: "var(--text-primary)" },
      });
    });
  };

  /* ── Rating breakdown (mock) ── */
  const ratingBreakdown = [
    { stars: 5, pct: 72 }, { stars: 4, pct: 18 },
    { stars: 3, pct: 6  }, { stars: 2, pct: 2  }, { stars: 1, pct: 2 },
  ];

  return (
    <div className="pp-page">

      {/* ── Breadcrumb ── */}
      <nav className="pp-breadcrumb" aria-label="Breadcrumb">
        <Link to="/" className="pp-crumb">Home</Link>
        <ChevronRight size={13} className="pp-crumb-sep" />
        <Link to="/products" className="pp-crumb">Products</Link>
        <ChevronRight size={13} className="pp-crumb-sep" />
        <Link to={`/products?category=${product.category}`} className="pp-crumb">{product.categoryLabel}</Link>
        <ChevronRight size={13} className="pp-crumb-sep" />
        <span className="pp-crumb pp-crumb-current">{product.name}</span>
      </nav>

      {/* ── Main Detail Section ── */}
      <div className="pp-main">

        {/* Image Panel */}
        <div className="pp-image-panel">
          <div className="pp-image-wrapper">
            {product.badge && (
              <span className={`product-badge ${product.badge.toLowerCase().includes("off") || product.badge === "Sale" ? "badge-sale" : "badge-popular"}`}>
                {product.badge}
              </span>
            )}
            {discount && (
              <span className="pp-discount-pill">{discount}% OFF</span>
            )}
            <img src={product.image} alt={product.name} className="pp-main-img" />

            {/* Action floaters */}
            <button className={`pp-float-btn pp-wishlist-float ${isWishlisted ? "wishlisted" : ""}`} onClick={handleWishlist} aria-label="Toggle wishlist" id="pp-wishlist-btn">
              <Heart size={18} fill={isWishlisted ? "var(--danger)" : "none"} />
            </button>
            <button className="pp-float-btn pp-share-float" onClick={handleShare} aria-label="Share product" id="pp-share-btn">
              <Share2 size={17} />
            </button>
          </div>

          {/* Trust Badges */}
          <div className="pp-trust-row">
            <div className="pp-trust-badge">
              <Leaf size={15} className="pp-trust-icon" />
              <span>100% Organic</span>
            </div>
            <div className="pp-trust-badge">
              <Award size={15} className="pp-trust-icon" />
              <span>Certified Fresh</span>
            </div>
            <div className="pp-trust-badge">
              <Zap size={15} className="pp-trust-icon" />
              <span>Same-day Delivery</span>
            </div>
          </div>
        </div>

        {/* Info Panel */}
        <div className="pp-info-panel">
          <span className="pp-category-tag">{product.categoryLabel}</span>
          <h1 className="pp-product-name">{product.name}</h1>

          {/* Rating Row */}
          <div className="pp-rating-row">
            <div className="pp-stars">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={16} fill={i < Math.floor(product.rating) ? "var(--accent-500)" : "none"} stroke="var(--accent-500)" className="pp-star" />
              ))}
            </div>
            <span className="pp-rating-val">{product.rating}</span>
            <span className="pp-reviews-link" onClick={() => setActiveTab("reviews")}>
              ({product.reviewsCount} reviews)
            </span>
            <span className="pp-sold-badge">
              <Package size={13} /> 200+ sold this week
            </span>
          </div>

          {/* Price Block */}
          <div className="pp-price-block">
            <span className="pp-price">₹{product.price}</span>
            <span className="pp-price-unit">/{product.unit}</span>
            {product.originalPrice && (
              <>
                <span className="pp-original-price">₹{product.originalPrice}</span>
                <span className="pp-save-tag">Save ₹{product.originalPrice - product.price}</span>
              </>
            )}
          </div>

          {/* Highlights */}
          <ul className="pp-highlights">
            {detail.highlights.map((h, i) => (
              <li key={i} className="pp-highlight-item">
                <span className="pp-highlight-dot" />
                {h}
              </li>
            ))}
          </ul>

          {/* Quantity + Cart */}
          <div className="pp-cart-section">
            {inCartQty > 0 ? (
              <div className="pp-cart-controls">
                <div className="pp-qty-row">
                  <span className="pp-qty-label">In cart:</span>
                  <div className="quantity-selector pp-qty-selector">
                    <button className="qty-btn" onClick={() => handleUpdateCart(-1)} aria-label="Decrease quantity">
                      <Minus size={14} />
                    </button>
                    <span className="qty-value">{inCartQty}</span>
                    <button className="qty-btn" onClick={() => handleUpdateCart(1)} aria-label="Increase quantity">
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
                <button className="pp-view-cart-btn" onClick={() => navigate("/checkout")} id="pp-view-cart-btn">
                  <ShoppingCart size={16} />
                  View Cart & Checkout
                </button>
              </div>
            ) : (
              <div className="pp-add-section">
                <div className="pp-qty-picker">
                  <button className="pp-qty-dec" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease">
                    <Minus size={14} />
                  </button>
                  <span className="pp-qty-num">{qty}</span>
                  <button className="pp-qty-inc" onClick={() => setQty((q) => q + 1)} aria-label="Increase">
                    <Plus size={14} />
                  </button>
                </div>
                <button className="pp-add-btn" onClick={handleAddToCart} id="pp-add-to-cart-btn">
                  <ShoppingCart size={17} />
                  Add to Cart
                </button>
              </div>
            )}
          </div>

          {/* Delivery Info */}
          <div className="pp-delivery-info">
            <div className="pp-delivery-item">
              <Truck size={16} className="pp-delivery-icon" />
              <div>
                <span className="pp-delivery-title">Free delivery</span>
                <span className="pp-delivery-sub">on orders above ₹299</span>
              </div>
            </div>
            <div className="pp-delivery-item">
              <ShieldCheck size={16} className="pp-delivery-icon" />
              <div>
                <span className="pp-delivery-title">100% Secure</span>
                <span className="pp-delivery-sub">Encrypted checkout</span>
              </div>
            </div>
            <div className="pp-delivery-item">
              <RotateCcw size={16} className="pp-delivery-icon" />
              <div>
                <span className="pp-delivery-title">Easy returns</span>
                <span className="pp-delivery-sub">Fresh guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs Section ── */}
      <section className="pp-tabs-section">
        <div className="pp-tabs-header">
          {(["description", "nutrition", "reviews"] as Tab[]).map((tab) => (
            <button key={tab} id={`pp-tab-${tab}`} className={`pp-tab-btn ${activeTab === tab ? "active" : ""}`} onClick={() => setActiveTab(tab)}>
              {tab === "description" ? "Description" : tab === "nutrition" ? "Nutrition" : `Reviews (${MOCK_REVIEWS.length})`}
            </button>
          ))}
        </div>

        <div className="pp-tab-content">
          {/* Description Tab */}
          {activeTab === "description" && (
            <div className="pp-tab-desc">
              <p className="pp-desc-text">{detail.description}</p>
              <div className="pp-highlights-grid">
                {detail.highlights.map((h, i) => (
                  <div key={i} className="pp-highlight-card">
                    <span className="pp-hc-icon">✅</span>
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Nutrition Tab */}
          {activeTab === "nutrition" && (
            <div className="pp-tab-nutrition">
              <p className="pp-nutrition-note">Per 100g serving (approximate values)</p>
              <div className="pp-nutrition-grid">
                {detail.nutrition.map((n, i) => (
                  <div key={i} className="pp-nutrition-card">
                    <span className="pp-nutrition-val">{n.value}</span>
                    <span className="pp-nutrition-label">{n.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === "reviews" && (
            <div className="pp-tab-reviews">
              {/* Summary */}
              <div className="pp-reviews-summary">
                <div className="pp-reviews-score">
                  <span className="pp-score-num">{product.rating}</span>
                  <div className="pp-score-stars">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={20} fill={i < Math.floor(product.rating) ? "var(--accent-500)" : "none"} stroke="var(--accent-500)" />
                    ))}
                  </div>
                  <span className="pp-score-sub">{product.reviewsCount} reviews</span>
                </div>
                <div className="pp-rating-bars">
                  {ratingBreakdown.map((r) => (
                    <div key={r.stars} className="pp-rating-bar-row">
                      <span className="pp-bar-label">{r.stars} ★</span>
                      <div className="pp-bar-track">
                        <div className="pp-bar-fill" style={{ width: `${r.pct}%` }} />
                      </div>
                      <span className="pp-bar-pct">{r.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Review cards */}
              <div className="pp-review-list">
                {MOCK_REVIEWS.map((rev) => (
                  <div key={rev.id} className="pp-review-card">
                    <div className="pp-review-header">
                      <div className="pp-reviewer-avatar">{rev.avatar}</div>
                      <div className="pp-reviewer-meta">
                        <span className="pp-reviewer-name">{rev.name}</span>
                        <span className="pp-review-date">{rev.date}</span>
                      </div>
                      <div className="pp-review-stars">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={13} fill={i < rev.rating ? "var(--accent-500)" : "none"} stroke="var(--accent-500)" />
                        ))}
                      </div>
                    </div>
                    <p className="pp-review-comment">{rev.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Related Products ── */}
      {relatedProducts.length > 0 && (
        <section className="pp-related-section">
          <div className="pp-related-header">
            <h2 className="pp-related-title">You may also like</h2>
            <Link to={`/products?category=${product.category}`} className="pp-related-more">
              View all <ChevronRight size={15} />
            </Link>
          </div>
          <div className="pp-related-grid">
            {relatedProducts.map((p) => {
              const rCartQty = items.find((i) => i.product.id === p.id)?.quantity ?? 0;
              return (
                <div key={p.id} className="product-card">
                  <div className="product-image-container">
                    {p.badge && (
                      <span className={`product-badge ${p.badge.toLowerCase().includes("off") || p.badge === "Sale" ? "badge-sale" : "badge-popular"}`}>
                        {p.badge}
                      </span>
                    )}
                    <Link to={`/products/${p.id}`} className="image-link">
                      <img src={p.image} alt={p.name} className="product-card-img" />
                    </Link>
                  </div>
                  <div className="product-details">
                    <span className="product-category">{p.categoryLabel}</span>
                    <Link to={`/products/${p.id}`} className="product-title-link">
                      <h3 className="product-title">{p.name}</h3>
                    </Link>
                    <div className="product-rating">
                      <Star size={14} fill="var(--accent-500)" className="star-icon" />
                      <span className="rating-value">{p.rating}</span>
                      <span className="reviews-count">({p.reviewsCount})</span>
                    </div>
                    <div className="product-footer">
                      <div className="product-price-wrapper">
                        <span className="product-price">₹{p.price}</span>
                        <span className="price-unit">/{p.unit}</span>
                        {p.originalPrice && <span className="product-old-price">₹{p.originalPrice}</span>}
                      </div>
                      <div className="add-to-cart-wrapper">
                        {rCartQty > 0 ? (
                          <div className="quantity-selector">
                            <button className="qty-btn" onClick={() => globalUpdateQuantity(p.id, rCartQty - 1)} aria-label="Decrease">
                              <Minus size={14} />
                            </button>
                            <span className="qty-value">{rCartQty}</span>
                            <button className="qty-btn" onClick={() => globalAddToCart(p, 1)} aria-label="Increase">
                              <Plus size={14} />
                            </button>
                          </div>
                        ) : (
                          <button className="add-to-cart-btn" onClick={() => { globalAddToCart(p, 1); toast.success(`Added ${p.name} to cart!`, { icon: "🛒", style: { borderRadius: "10px", background: "var(--card-bg)", color: "var(--text-primary)" } }); }} aria-label="Add to Cart">
                            <ShoppingCart size={16} />
                            <span>Add</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductPage;