import { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import {
  Heart, ShoppingCart, Star, Plus, Minus,
  SlidersHorizontal, X, ChevronDown, Search,
  LayoutGrid, List, ChevronLeft, ChevronRight
} from "lucide-react";
import { toast } from "react-hot-toast";
import type { Product } from "../types.ts";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";


import { apiFetch } from "../utils/api";
import Loading from "../components/Loading";

const CATEGORIES = [
  { id: "all",               label: "All Categories" },
  { id: "fruits-vegetables", label: "Fruits & Veggies" },
  { id: "dairy-eggs",        label: "Dairy & Eggs" },
  { id: "bakery",            label: "Bakery" },
  { id: "pantry",            label: "Pantry" },
];

const SORT_OPTIONS = [
  { value: "popular",    label: "Most Popular" },
  { value: "price-asc",  label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating",     label: "Top Rated" },
  { value: "newest",     label: "Newest First" },
];

const PAGE_SIZE = 8;

/* ─── Component ─────────────────────────────────────────────────── */
const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { items, addToCart: globalAddToCart, updateQuantity: globalUpdateQuantity } = useCart();

  /* URL-driven state */
  const category  = searchParams.get("category")  || "all";
  const sort      = searchParams.get("sort")       || "popular";
  const minPrice  = Number(searchParams.get("minPrice")) || 0;
  const maxPrice  = Number(searchParams.get("maxPrice")) || 500;
  const page      = Number(searchParams.get("page"))     || 1;
  const search    = searchParams.get("q")          || "";

  /* Local UI state */
  const [mobileFiltersOpen, setMobileFiltersOpen]   = useState(false);
  const [wishlist, setWishlist]                     = useState<Record<string, boolean>>({});
  const [viewMode, setViewMode]                     = useState<"grid" | "list">("grid");
  const [localMin, setLocalMin]                     = useState(minPrice);
  const [localMax, setLocalMax]                     = useState(maxPrice);
  const [searchInput, setSearchInput]               = useState(search);
  const [sortOpen, setSortOpen]                     = useState(false);

  /* Live products from backend */
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  /* Sync local price sliders when URL changes externally */
  useEffect(() => { setLocalMin(minPrice); }, [minPrice]);
  useEffect(() => { setLocalMax(maxPrice); }, [maxPrice]);

  /* Fetch filtered & sorted products from API */
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (category && category !== "all") queryParams.append("category", category);
        if (search) queryParams.append("q", search);
        if (minPrice) queryParams.append("minPrice", String(minPrice));
        if (maxPrice && maxPrice !== 500) queryParams.append("maxPrice", String(maxPrice));
        if (sort) queryParams.append("sort", sort);

        const data = await apiFetch(`/products?${queryParams.toString()}`);
        const transformed = data.map((p: any) => ({
          ...p,
          id: p._id || p.id
        }));
        setProducts(transformed);
      } catch (err: any) {
        toast.error("Failed to load products.");
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [category, search, minPrice, maxPrice, sort]);

  const filtered = products;



  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  /* ── URL helpers ── */
  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value === "" || value === "all" || value === "0") next.delete(key);
    else next.set(key, value);
    next.set("page", "1");
    setSearchParams(next);
  };

  const goToPage = (p: number) => {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(p));
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const applyPriceFilter = () => {
    const next = new URLSearchParams(searchParams);
    next.set("minPrice", String(localMin));
    next.set("maxPrice", String(localMax));
    next.set("page", "1");
    setSearchParams(next);
  };

  const applySearch = () => setParam("q", searchInput.trim());

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
    setLocalMin(0); setLocalMax(500); setSearchInput("");
  };

  /* ── Cart helpers ── */
  const addToCart = (id: string, name: string) => {
    if (!isAuthenticated) {
      toast.error("Please login to add items to your cart.");
      navigate("/login");
      return;
    }
    const product = products.find(p => p.id === id);
    if (!product) return;
    globalAddToCart(product, 1);
    const qty = (items.find(i => i.product.id === id)?.quantity || 0) + 1;
    toast.success(`Added ${name} to cart (×${qty})!`, {
      icon: "🛒",
      style: { borderRadius: "10px", background: "var(--card-bg)", color: "var(--text-primary)" }
    });
  };

  const updateQuantity = (id: string, name: string, delta: number) => {
    if (!isAuthenticated) {
      toast.error("Please login to manage your cart.");
      navigate("/login");
      return;
    }
    const item = items.find(i => i.product.id === id);
    if (!item) return;
    const newQty = item.quantity + delta;
    globalUpdateQuantity(id, newQty);
    if (newQty <= 0) toast.success(`Removed ${name} from cart.`, {
      style: { borderRadius: "10px", background: "var(--card-bg)", color: "var(--text-primary)" }
    });
  };

  const toggleWishlist = (id: string, name: string) => {
    setWishlist(prev => {
      const next = { ...prev, [id]: !prev[id] };
      toast.success(next[id] ? `Added ${name} to wishlist!` : `Removed ${name} from wishlist.`, {
        icon: next[id] ? "❤️" : undefined,
        style: { borderRadius: "10px", background: "var(--card-bg)", color: "var(--text-primary)" }
      });
      return next;
    });
  };

  const activeSort = SORT_OPTIONS.find(o => o.value === sort)?.label ?? "Most Popular";

  /* ─── Sidebar Filter Panel ─── */
  const SidebarFilters = () => (
    <aside className="products-sidebar">
      <div className="sidebar-header">
        <h3 className="sidebar-title">Filters</h3>
        <button className="sidebar-clear-btn" onClick={clearFilters}>Clear all</button>
      </div>

      {/* Category */}
      <div className="filter-group">
        <p className="filter-label">Category</p>
        <ul className="filter-list">
          {CATEGORIES.map(cat => (
            <li key={cat.id}>
              <button className={`filter-item-btn ${category === cat.id ? "active" : ""}`} onClick={() => setParam("category", cat.id)}>
                <span className="filter-dot" />
                {cat.label}
                <span className="filter-count">{cat.id === "all" ? products.length : products.filter(p => p.category === cat.id).length}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Price Range */}
      <div className="filter-group">
        <p className="filter-label">Price Range</p>
        <div className="price-range-inputs">
          <div className="price-input-group">
            <span className="price-currency">₹</span>
            <input type="number" min={0} max={localMax} value={localMin} onChange={e => setLocalMin(Number(e.target.value))} className="price-input" placeholder="Min" />
          </div>
          <span className="price-separator">–</span>
          <div className="price-input-group">
            <span className="price-currency">₹</span>
            <input type="number" min={localMin} max={1000} value={localMax} onChange={e => setLocalMax(Number(e.target.value))} className="price-input" placeholder="Max" />
          </div>
        </div>
        <button className="apply-price-btn" onClick={applyPriceFilter}>Apply</button>
      </div>

      {/* Rating */}
      <div className="filter-group">
        <p className="filter-label">Min Rating</p>
        <div className="rating-filter-list">
          {[4.5, 4.0, 3.5].map(r => (
            <button key={r} className="rating-filter-btn">
              <Star size={13} fill="var(--accent-500)" className="star-icon" />
              <span>{r}+</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );

  /* ─── Product Card ─── */
  const ProductCard = ({ product }: { product: Product }) => {
    const inCartQty   = items.find(i => i.product.id === product.id)?.quantity || 0;
    const isWishlisted = wishlist[product.id] || false;

    return (
      <div className={`product-card ${viewMode === "list" ? "product-card-list" : ""}`}>
        <div className="product-image-container">
          {product.badge && (
            <span className={`product-badge ${product.badge.toLowerCase().includes("off") || product.badge === "Sale" ? "badge-sale" : "badge-popular"}`}>
              {product.badge}
            </span>
          )}
          <button className={`wishlist-btn ${isWishlisted ? "wishlisted" : ""}`} onClick={() => toggleWishlist(product.id, product.name)} aria-label="Toggle Wishlist">
            <Heart className="heart-icon" size={18} fill={isWishlisted ? "var(--danger)" : "none"} />
          </button>
          <Link to={`/products/${product.id}`} className="image-link">
            <img src={product.image} alt={product.name} className="product-card-img" />
          </Link>
        </div>

        <div className="product-details">
          <span className="product-category">{product.categoryLabel}</span>
          <Link to={`/products/${product.id}`} className="product-title-link">
            <h3 className="product-title">{product.name}</h3>
          </Link>
          <div className="product-rating">
            <div className="stars-wrapper">
              <Star className="star-icon" size={14} fill="var(--accent-500)" />
            </div>
            <span className="rating-value">{product.rating}</span>
            <span className="reviews-count">({product.reviewsCount} reviews)</span>
          </div>
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
                  <button className="qty-btn" onClick={() => updateQuantity(product.id, product.name, -1)} aria-label="Decrease">
                    <Minus size={14} />
                  </button>
                  <span className="qty-value">{inCartQty}</span>
                  <button className="qty-btn" onClick={() => updateQuantity(product.id, product.name, 1)} aria-label="Increase">
                    <Plus size={14} />
                  </button>
                </div>
              ) : (
                <button className="add-to-cart-btn" onClick={() => addToCart(product.id, product.name)} aria-label="Add to Cart">
                  <ShoppingCart size={16} />
                  <span>Add</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* ─── JSX ─── */
  return (
    <div className="products-page">

      {/* Page Header */}
      <div className="products-page-header">
        <div className="products-page-header-inner">
          <div>
            <h1 className="products-page-title">All Products</h1>
            <p className="products-page-sub">
              {filtered.length} fresh organic products available
            </p>
          </div>

          {/* Search Bar */}
          <form className="products-search-bar" onSubmit={e => { e.preventDefault(); applySearch(); }}>
            <Search size={17} className="products-search-icon" />
            <input type="text" className="products-search-input" placeholder="Search products…" value={searchInput} onChange={e => setSearchInput(e.target.value)} />
            {searchInput && (
              <button type="button" className="products-search-clear" onClick={() => { setSearchInput(""); setParam("q", ""); }}>
                <X size={14} />
              </button>
            )}
          </form>
        </div>
      </div>

      <div className="products-layout">

        {/* ── Sidebar (desktop) ── */}
        <SidebarFilters />

        {/* ── Main Content ── */}
        <main className="products-main">

          {/* Sort / View toolbar */}
          <div className="products-toolbar">
            {/* Mobile filter toggle */}
            <button className="mobile-filter-btn" onClick={() => setMobileFiltersOpen(true)}>
              <SlidersHorizontal size={16} />
              Filters
            </button>

            {/* Active filter chips */}
            <div className="active-chips">
              {category !== "all" && (
                <span className="active-chip">
                  {CATEGORIES.find(c => c.id === category)?.label}
                  <button onClick={() => setParam("category", "all")}><X size={11} /></button>
                </span>
              )}
              {search && (
                <span className="active-chip">
                  "{search}"
                  <button onClick={() => { setSearchInput(""); setParam("q", ""); }}><X size={11} /></button>
                </span>
              )}
              {(minPrice > 0 || maxPrice < 500) && (
                <span className="active-chip">
                  ₹{minPrice}–₹{maxPrice}
                  <button onClick={() => { setLocalMin(0); setLocalMax(500); const n = new URLSearchParams(searchParams); n.delete("minPrice"); n.delete("maxPrice"); setSearchParams(n); }}><X size={11} /></button>
                </span>
              )}
            </div>

            <div className="toolbar-right">
              {/* Sort dropdown */}
              <div className="sort-dropdown">
                <button className="sort-trigger" onClick={() => setSortOpen(o => !o)}>
                  <span>{activeSort}</span>
                  <ChevronDown size={15} className={`sort-chevron ${sortOpen ? "open" : ""}`} />
                </button>
                {sortOpen && (
                  <ul className="sort-menu">
                    {SORT_OPTIONS.map(o => (
                      <li key={o.value}>
                        <button className={`sort-option ${sort === o.value ? "active" : ""}`} onClick={() => { setParam("sort", o.value); setSortOpen(false); }}>{o.label}</button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* View mode toggle */}
              <div className="view-toggle">
                <button className={`view-btn ${viewMode === "grid" ? "active" : ""}`} onClick={() => setViewMode("grid")} aria-label="Grid view">
                  <LayoutGrid size={16} />
                </button>
                <button className={`view-btn ${viewMode === "list" ? "active" : ""}`} onClick={() => setViewMode("list")} aria-label="List view">
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <Loading />
          ) : paginated.length === 0 ? (
            <div className="products-empty">
              <div className="empty-icon">🥦</div>
              <h3>No products found</h3>
              <p>Try adjusting your filters or search term.</p>
              <button className="submit-btn" style={{ maxWidth: 200 }} onClick={clearFilters}>Clear Filters</button>
            </div>
          ) : (
            <div className={`products-grid ${viewMode === "list" ? "products-grid-list" : ""}`}>
              {paginated.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button className="page-btn page-nav" disabled={page <= 1} onClick={() => goToPage(page - 1)} aria-label="Previous page"> <ChevronLeft size={16} /></button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} className={`page-btn ${p === page ? "active" : ""}`} onClick={() => goToPage(p)}>{p}</button>
              ))}

              <button className="page-btn page-nav" disabled={page >= totalPages} onClick={() => goToPage(page + 1)} aria-label="Next page">
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filters Drawer */}
      {mobileFiltersOpen && (
        <div className="mobile-filter-overlay" onClick={() => setMobileFiltersOpen(false)}>
          <div className="mobile-filter-drawer" onClick={e => e.stopPropagation()}>
            <div className="drawer-header">
              <h3>Filters</h3>
              <button className="drawer-close-btn" onClick={() => setMobileFiltersOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <SidebarFilters />
            <button className="submit-btn" onClick={() => setMobileFiltersOpen(false)}>
              Show {filtered.length} results
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;