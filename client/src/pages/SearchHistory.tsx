import { useState, useEffect, useMemo } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import {
  Search, ShoppingCart, Star, Heart, Plus, Minus,
  Clock, X, ArrowRight, PackageSearch,
} from "lucide-react";
import { toast } from "react-hot-toast";
import type { Product } from "../types";
import { useCart } from "../context/CartContext";

import prod1 from "../assets/products/products- 01.png";
import prod2 from "../assets/products/products- 02.png";
import prod3 from "../assets/products/products- 03.png";
import prod4 from "../assets/products/products-04.png";
import prod5 from "../assets/products/products-05.png";
import prod6 from "../assets/products/products-06.png";
import prod7 from "../assets/products/products-07.png";
import prod8 from "../assets/products/products-08.png";

/* ─── Product data (same as Products page) ──────────────────────── */
const ALL_PRODUCTS: Product[] = [
  { id: "prod-1",  name: "Organic Fresh Bananas",   category: "fruits-vegetables", categoryLabel: "Fruits & Veg",   price: 60,  originalPrice: 70,  unit: "doz",   rating: 4.8, reviewsCount: 96,  image: prod1, badge: "Sale"    },
  { id: "prod-2",  name: "Sweet Red Strawberries",  category: "fruits-vegetables", categoryLabel: "Fruits & Veg",   price: 120, originalPrice: 150, unit: "box",   rating: 4.9, reviewsCount: 148, image: prod2, badge: "Hot"     },
  { id: "prod-3",  name: "Pure Wildflower Honey",   category: "pantry",            categoryLabel: "Organic Pantry", price: 280, originalPrice: 320, unit: "jar",   rating: 4.9, reviewsCount: 215, image: prod3, badge: "Popular" },
  { id: "prod-4",  name: "Artisan Sourdough Bread", category: "bakery",            categoryLabel: "Bakery",         price: 90,  originalPrice: 100, unit: "loaf",  rating: 4.7, reviewsCount: 84,  image: prod4             },
  { id: "prod-5",  name: "Fresh Farm Whole Milk",   category: "dairy-eggs",        categoryLabel: "Dairy & Eggs",   price: 75,                       unit: "L",     rating: 4.8, reviewsCount: 310, image: prod5             },
  { id: "prod-6",  name: "Organic Free-Range Eggs", category: "dairy-eggs",        categoryLabel: "Dairy & Eggs",   price: 110, originalPrice: 130, unit: "pack",  rating: 4.9, reviewsCount: 175, image: prod6, badge: "15% OFF" },
  { id: "prod-7",  name: "Fresh Hass Avocados",     category: "fruits-vegetables", categoryLabel: "Fruits & Veg",   price: 160,                      unit: "kg",    rating: 4.6, reviewsCount: 52,  image: prod7             },
  { id: "prod-8",  name: "Organic Rolled Oats",     category: "pantry",            categoryLabel: "Organic Pantry", price: 140, originalPrice: 160, unit: "pack",  rating: 4.7, reviewsCount: 93,  image: prod8             },
  { id: "prod-9",  name: "Cherry Tomatoes",         category: "fruits-vegetables", categoryLabel: "Fruits & Veg",   price: 85,                       unit: "kg",    rating: 4.5, reviewsCount: 67,  image: prod1             },
  { id: "prod-10", name: "Greek Yogurt",            category: "dairy-eggs",        categoryLabel: "Dairy & Eggs",   price: 95,  originalPrice: 110, unit: "tub",   rating: 4.8, reviewsCount: 120, image: prod5, badge: "New"    },
  { id: "prod-11", name: "Multigrain Crackers",     category: "bakery",            categoryLabel: "Bakery",         price: 65,                       unit: "pack",  rating: 4.4, reviewsCount: 39,  image: prod4             },
  { id: "prod-12", name: "Cold-Pressed Olive Oil",  category: "pantry",            categoryLabel: "Organic Pantry", price: 350, originalPrice: 400, unit: "500ml", rating: 4.9, reviewsCount: 188, image: prod3, badge: "Popular" },
  { id: "prod-13", name: "Organic Spinach",         category: "fruits-vegetables", categoryLabel: "Fruits & Veg",   price: 45,                       unit: "bunch", rating: 4.6, reviewsCount: 55,  image: prod2             },
  { id: "prod-14", name: "Cheddar Cheese Block",    category: "dairy-eggs",        categoryLabel: "Dairy & Eggs",   price: 180, originalPrice: 210, unit: "200g",  rating: 4.7, reviewsCount: 74,  image: prod6, badge: "Sale"   },
  { id: "prod-15", name: "Whole Wheat Pasta",       category: "pantry",            categoryLabel: "Organic Pantry", price: 75,                       unit: "500g",  rating: 4.5, reviewsCount: 62,  image: prod8             },
  { id: "prod-16", name: "Croissants (4-pack)",     category: "bakery",            categoryLabel: "Bakery",         price: 120, originalPrice: 140, unit: "pack",  rating: 4.8, reviewsCount: 101, image: prod4, badge: "Hot"    },
];

/* ─── History helpers ────────────────────────────────────────────── */
const HISTORY_KEY = "search_history";

interface HistoryEntry { id: string; query: string; timestamp: number; resultsCount: number; }

function loadHistory(): HistoryEntry[] {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); }
  catch { return []; }
}

function pushToHistory(query: string, resultsCount: number) {
  const existing = loadHistory().filter(e => e.query.toLowerCase() !== query.toLowerCase());
  const next: HistoryEntry[] = [
    { id: `h-${Date.now()}`, query, timestamp: Date.now(), resultsCount },
    ...existing,
  ].slice(0, 20); // keep at most 20
  localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
}

function timeAgo(ms: number): string {
  const diff = Date.now() - ms;
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

/* ─── Component ─────────────────────────────────────────────────── */
const SearchHistory = () => {
  const [searchParams] = useSearchParams();
  const navigate        = useNavigate();
  const query           = searchParams.get("q") || "";

  const { items, addToCart: globalAdd, updateQuantity: globalUpdate } = useCart();

  const [wishlist, setWishlist]     = useState<Record<string, boolean>>({});
  const [history, setHistory]       = useState<HistoryEntry[]>([]);
  const [localInput, setLocalInput] = useState(query);

  /* Sync local input when URL changes */
  useEffect(() => { setLocalInput(query); }, [query]);

  /* Filter products by query */
  const results: Product[] = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return ALL_PRODUCTS.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.categoryLabel.toLowerCase().includes(q)
    );
  }, [query]);

  /* Save search to history when query + results are known */
  useEffect(() => {
    if (query.trim()) {
      pushToHistory(query, results.length);
      setHistory(loadHistory());
    } else {
      setHistory(loadHistory());
    }
  }, [query, results.length]);

  /* ── Cart helpers ── */
  const addToCart = (product: Product) => {
    globalAdd(product, 1);
    const qty = (items.find(i => i.product.id === product.id)?.quantity || 0) + 1;
    toast.success(`Added ${product.name} to cart (×${qty})!`, {
      icon: "🛒",
      style: { borderRadius: "10px", background: "var(--card-bg)", color: "var(--text-primary)" },
    });
  };

  const updateQty = (id: string, name: string, delta: number) => {
    const item = items.find(i => i.product.id === id);
    if (!item) return;
    const newQty = item.quantity + delta;
    globalUpdate(id, newQty);
    if (newQty <= 0) toast.success(`Removed ${name} from cart.`, {
      style: { borderRadius: "10px", background: "var(--card-bg)", color: "var(--text-primary)" },
    });
  };

  const toggleWish = (id: string, name: string) => {
    setWishlist(prev => {
      const next = { ...prev, [id]: !prev[id] };
      toast.success(next[id] ? `Added ${name} to wishlist!` : `Removed ${name} from wishlist.`, {
        icon: next[id] ? "❤️" : undefined,
        style: { borderRadius: "10px", background: "var(--card-bg)", color: "var(--text-primary)" },
      });
      return next;
    });
  };

  const deleteHistoryEntry = (id: string) => {
    const next = loadHistory().filter(e => e.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
    setHistory(next);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localInput.trim()) navigate(`/search?q=${encodeURIComponent(localInput.trim())}`);
  };

  /* ── Product Card ── */
  const ProductCard = ({ product }: { product: Product }) => {
    const inCart     = items.find(i => i.product.id === product.id)?.quantity || 0;
    const isWished   = wishlist[product.id] || false;
    const discount   = product.originalPrice
      ? Math.round((1 - product.price / product.originalPrice) * 100)
      : null;

    return (
      <div className="sr-card">
        <div className="sr-card-img-wrap">
          {product.badge && (
            <span className={`product-badge ${product.badge === "Sale" || product.badge?.includes("OFF") ? "badge-sale" : "badge-popular"}`}>
              {product.badge}
            </span>
          )}
          <button
            className={`wishlist-btn ${isWished ? "wishlisted" : ""}`}
            onClick={() => toggleWish(product.id, product.name)}
            aria-label="Toggle wishlist"
          >
            <Heart size={17} fill={isWished ? "var(--danger)" : "none"} />
          </button>
          <Link to={`/products/${product.id}`} className="image-link">
            <img src={product.image} alt={product.name} className="sr-card-img" />
          </Link>
        </div>

        <div className="sr-card-body">
          <span className="product-category">{product.categoryLabel}</span>
          <Link to={`/products/${product.id}`} className="product-title-link">
            <h3 className="sr-card-name">{product.name}</h3>
          </Link>
          <div className="product-rating">
            <Star size={13} fill="var(--accent-500)" className="star-icon" />
            <span className="rating-value">{product.rating}</span>
            <span className="reviews-count">({product.reviewsCount})</span>
          </div>

          <div className="sr-card-footer">
            <div className="product-price-wrapper">
              <span className="product-price">₹{product.price}</span>
              <span className="price-unit">/{product.unit}</span>
              {product.originalPrice && (
                <span className="product-old-price">₹{product.originalPrice}</span>
              )}
              {discount && <span className="sr-discount">{discount}% off</span>}
            </div>

            {inCart > 0 ? (
              <div className="quantity-selector">
                <button className="qty-btn" onClick={() => updateQty(product.id, product.name, -1)} aria-label="Decrease">
                  <Minus size={14} />
                </button>
                <span className="qty-value">{inCart}</span>
                <button className="qty-btn" onClick={() => updateQty(product.id, product.name, 1)} aria-label="Increase">
                  <Plus size={14} />
                </button>
              </div>
            ) : (
              <button className="add-to-cart-btn" onClick={() => addToCart(product)} aria-label="Add to cart">
                <ShoppingCart size={15} />
                <span>Add</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  /* ─── Render ─── */
  return (
    <div className="sr-page">

      {/* ── Search bar (re-search) ── */}
      <div className="sr-topbar">
        <form className="sr-searchbar" onSubmit={handleSearchSubmit}>
          <Search size={17} className="sr-searchbar-icon" />
          <input
            id="sr-search-input"
            type="text"
            className="sr-searchbar-input"
            placeholder="Search products…"
            value={localInput}
            onChange={e => setLocalInput(e.target.value)}
          />
          {localInput && (
            <button
              type="button"
              className="sr-searchbar-clear"
              onClick={() => { setLocalInput(""); navigate("/search"); }}
              aria-label="Clear"
            >
              <X size={14} />
            </button>
          )}
          <button type="submit" className="sr-searchbar-btn">Search</button>
        </form>
      </div>

      <div className="sr-layout">

        {/* ── Results area ── */}
        <main className="sr-main">
          {query ? (
            <>
              <div className="sr-results-header">
                <h1 className="sr-results-title">
                  {results.length > 0
                    ? <><span className="sr-count">{results.length}</span> results for "<span className="sr-query">{query}</span>"</>
                    : <>No results for "<span className="sr-query">{query}</span>"</>
                  }
                </h1>
              </div>

              {results.length > 0 ? (
                <div className="sr-grid">
                  {results.map(p => <ProductCard key={p.id} product={p} />)}
                </div>
              ) : (
                <div className="sr-empty">
                  <PackageSearch size={56} strokeWidth={1.2} className="sr-empty-icon" />
                  <h3>We couldn't find "{query}"</h3>
                  <p>Try different keywords, or browse all products.</p>
                  <div className="sr-empty-actions">
                    <button className="submit-btn" style={{ maxWidth: 200 }} onClick={() => navigate("/products")}>
                      Browse All Products
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* No query yet */
            <div className="sr-empty">
              <Search size={56} strokeWidth={1.2} className="sr-empty-icon" />
              <h3>What are you looking for?</h3>
              <p>Type something in the search bar above to find fresh products.</p>
            </div>
          )}
        </main>

        {/* ── Recent Searches sidebar ── */}
        {history.length > 0 && (
          <aside className="sr-sidebar">
            <div className="sr-sidebar-header">
              <Clock size={15} />
              <span>Recent Searches</span>
            </div>
            <ul className="sr-history-list">
              {history.slice(0, 8).map(entry => (
                <li key={entry.id} className="sr-history-item">
                  <button
                    className="sr-history-query"
                    onClick={() => navigate(`/search?q=${encodeURIComponent(entry.query)}`)}
                  >
                    <Search size={13} className="sr-history-qicon" />
                    <span>{entry.query}</span>
                  </button>
                  <div className="sr-history-meta">
                    <span className="sr-history-time">{timeAgo(entry.timestamp)}</span>
                    {entry.resultsCount > 0 && (
                      <span className="sr-history-count">{entry.resultsCount}</span>
                    )}
                  </div>
                  <div className="sr-history-actions">
                    <button
                      className="sr-history-run"
                      onClick={() => navigate(`/search?q=${encodeURIComponent(entry.query)}`)}
                      title="Search again"
                    >
                      <ArrowRight size={13} />
                    </button>
                    <button
                      className="sr-history-del"
                      onClick={() => deleteHistoryEntry(entry.id)}
                      title="Remove"
                    >
                      <X size={13} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </aside>
        )}
      </div>
    </div>
  );
};

export default SearchHistory;
