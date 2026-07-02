import { useNavigate } from "react-router-dom";
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "../context/CartContext";

const CartSildeBar = () => {
  const {
    items,
    cartCount,
    cartTotal,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const navigate = useNavigate();

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate("/checkout");
  };

  const freeShippingThreshold = 500;
  const neededForFreeShipping = freeShippingThreshold - cartTotal;

  return (
    <div className={`cart-sidebar-container ${isCartOpen ? "open" : ""}`}>
      {/* Backdrop overlay */}
      <div className="cart-sidebar-overlay" onClick={() => setIsCartOpen(false)} />

      {/* Sidebar Panel */}
      <div className="cart-sidebar-panel">
        {/* Header */}
        <div className="cart-sidebar-header">
          <div className="cart-header-title">
            <ShoppingBag className="cart-header-icon" size={20} />
            <h2>My Cart</h2>
            <span className="cart-header-count">({cartCount} {cartCount === 1 ? 'item' : 'items'})</span>
          </div>
          <button className="cart-close-btn" onClick={() => setIsCartOpen(false)} aria-label="Close Cart">
            <X size={20} />
          </button>
        </div>

        {/* Free Shipping Alert/Progress */}
        {cartCount > 0 && (
          <div className="shipping-progress-container">
            {neededForFreeShipping > 0 ? (
              <p className="shipping-progress-text">
                Add <strong>₹{neededForFreeShipping}</strong> more for <strong>FREE shipping</strong>!
              </p>
            ) : (
              <p className="shipping-progress-text success">
                🎉 You qualify for <strong>FREE shipping</strong>!
              </p>
            )}
            <div className="shipping-progress-bar">
              <div
                className="shipping-progress-fill"
                style={{ width: `${Math.min((cartTotal / freeShippingThreshold) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="cart-sidebar-content">
          {items.length === 0 ? (
            <div className="cart-empty-state">
              <div className="empty-cart-icon-wrapper">
                <ShoppingBag size={48} className="empty-cart-icon" />
              </div>
              <h3>Your cart is empty</h3>
              <p>Looks like you haven't added anything to your cart yet.</p>
              <button
                className="shop-now-btn"
                onClick={() => {
                  setIsCartOpen(false);
                  navigate("/products");
                }}
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="cart-items-list">
              {items.map((item) => (
                <div key={item.product.id} className="cart-item-card">
                  <div className="cart-item-image-wrapper">
                    <img src={item.product.image} alt={item.product.name} />
                  </div>
                  <div className="cart-item-info">
                    <span className="cart-item-category">{item.product.categoryLabel}</span>
                    <h4 className="cart-item-name">{item.product.name}</h4>
                    <span className="cart-item-price-unit">
                      ₹{item.product.price} / {item.product.unit}
                    </span>
                    <div className="cart-item-actions">
                      <div className="cart-item-qty-selector">
                        <button
                          className="cart-qty-btn"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        >
                          <Minus size={12} />
                        </button>
                        <span className="cart-qty-value">{item.quantity}</span>
                        <button
                          className="cart-qty-btn"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <button
                        className="cart-item-remove-btn"
                        onClick={() => removeFromCart(item.product.id)}
                        title="Remove item"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="cart-item-total-price">
                    ₹{item.product.price * item.quantity}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="cart-sidebar-footer">
            <div className="cart-summary-row">
              <span>Subtotal</span>
              <span className="cart-summary-total">₹{cartTotal}</span>
            </div>
            <p className="cart-tax-note">Taxes and shipping calculated at checkout.</p>
            <div className="cart-footer-buttons">
              <button className="cart-checkout-btn" onClick={handleCheckout}>
                Proceed to Checkout
              </button>
              <button className="cart-clear-btn" onClick={clearCart}>
                Clear Cart
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartSildeBar;