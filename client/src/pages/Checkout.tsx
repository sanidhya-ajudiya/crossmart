import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import {
  ShoppingBag, MapPin, CreditCard, ChevronRight,
  CheckCircle, Truck, Tag, ArrowLeft, Wallet,
  Smartphone, Building2, Package,
} from "lucide-react"
import { useCart } from "../context/CartContext"
import type { Address } from "../types"
import { apiFetch } from "../utils/api"
import { toast } from "react-hot-toast"

/* ─── types ──────────────────────────────────────────────────── */
type PaymentMethod = "card" | "upi" | "netbanking" | "cod"
type Step = "address" | "payment" | "review"

/* ─── payment methods ─────────────────────────────────────────── */
const PAYMENT_METHODS: { id: PaymentMethod; label: string; sub: string; Icon: React.ElementType }[] = [
  { id: "card",       label: "Credit / Debit Card",  sub: "Visa, Mastercard, RuPay",    Icon: CreditCard  },
  { id: "upi",        label: "UPI",                  sub: "GPay, PhonePe, Paytm",       Icon: Smartphone  },
  { id: "netbanking", label: "Net Banking",           sub: "All major banks supported",  Icon: Building2   },
  { id: "cod",        label: "Cash on Delivery",      sub: "Pay when you receive",       Icon: Wallet      },
]

/* ─── step indicator ─────────────────────────────────────────── */
const STEPS: { key: Step; label: string }[] = [
  { key: "address", label: "Address"  },
  { key: "payment", label: "Payment"  },
  { key: "review",  label: "Review"   },
]

/* ═══════════════════════════════════════════════════════════════
   CHECKOUT
   ═══════════════════════════════════════════════════════════════ */
const Checkout = () => {
  const { items, cartTotal, clearCart, removeFromCart } = useCart()

  const [addresses, setAddresses]       = useState<Address[]>([])
  const [loadingAddrs, setLoadingAddrs] = useState(true)
  const [step, setStep]                 = useState<Step>("address")
  const [selectedAddr, setSelectedAddr] = useState<string>("")
  const [payment, setPayment]           = useState<PaymentMethod>("upi")
  const [coupon, setCoupon]             = useState("")
  const [couponApplied, setCouponApplied] = useState(false)
  const [placing, setPlacing]           = useState(false)
  const [placed, setPlaced]             = useState(false)
  const [createdOrderId, setCreatedOrderId] = useState<string>("")

  // Automatically clear stale/mock cart items that do not have valid ObjectId formats
  useEffect(() => {
    let removedAny = false;
    items.forEach(i => {
      const id = i.product.id || (i.product as any)._id;
      if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
        removeFromCart(id || "");
        removedAny = true;
      }
    });
    if (removedAny) {
      toast.success("Cleared stale mock items from your cart.");
    }
  }, [items, removeFromCart]);

  // Fetch addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const data = await apiFetch("/addresses");
        const mapped = data.map((a: any) => ({ ...a, id: a._id || a.id }));
        setAddresses(mapped);
        if (mapped.length > 0) {
          const def = mapped.find((a: any) => a.isDefault);
          setSelectedAddr(def ? def.id : mapped[0].id);
        }
      } catch (err: any) {
        toast.error("Failed to load shipping addresses.");
      } finally {
        setLoadingAddrs(false);
      }
    };
    fetchAddresses();
  }, []);

  /* ── derived ─────────────────────────────────────────────── */
  const delivery     = cartTotal > 499 ? 0 : 49
  const discount     = couponApplied ? Math.round(cartTotal * 0.1) : 0
  const orderTotal   = cartTotal + delivery - discount
  const activeAddr   = addresses.find(a => a.id === selectedAddr)

  const stepIndex    = STEPS.findIndex(s => s.key === step)

  /* ── handlers ────────────────────────────────────────────── */
  const next = () => {
    if (step === "address") {
      if (!selectedAddr) {
        toast.error("Please select a shipping address.");
        return;
      }
      setStep("payment")
    }
    else if (step === "payment") setStep("review")
  }

  const back = () => {
    if (step === "payment") setStep("address")
    else if (step === "review") setStep("payment")
  }

  const applyCoupon = () => {
    if (coupon.trim().toUpperCase() === "FRESH10") setCouponApplied(true)
    else alert("Invalid coupon code. Try FRESH10!")
  }

  const placeOrder = async () => {
    if (!activeAddr) {
      toast.error("Missing shipping address.");
      return;
    }
    
    setPlacing(true)
    try {
      const addressString = `${activeAddr.fullName}, ${activeAddr.phone}, ${activeAddr.street}, ${activeAddr.city}, ${activeAddr.state} — ${activeAddr.pincode}`;
      
      const payload = {
        items: items.map(i => ({
          product: { id: i.product.id || (i.product as any)._id, name: i.product.name, price: i.product.price, image: i.product.image },
          quantity: i.quantity
        })),
        totalPrice: orderTotal,
        shippingAddress: addressString,
        paymentMethod: payment
      };

      const res = await apiFetch("/orders", {
        method: "POST",
        bodyData: payload
      });

      setCreatedOrderId(res.order._id || res.order.id);
      clearCart();
      toast.success("Order placed successfully!");
      setPlaced(true);
    } catch (err: any) {
      toast.error(err.message || "Failed to place order.");
    } finally {
      setPlacing(false);
    }
  }

  /* ── order placed screen ─────────────────────────────────── */
  if (placed) {
    return (
      <div className="co-success">
        <div className="co-success-inner">
          <span className="co-success-icon"><CheckCircle size={52} /></span>
          <h1 className="co-success-title">Order Placed! 🎉</h1>
          <p className="co-success-sub">
            Your order has been confirmed. We'll send you a tracking link shortly.
          </p>
          <div className="co-success-meta">
            <span><Package size={15} /> Estimated delivery: <strong>2–4 days</strong></span>
            <span><MapPin size={15} /> {activeAddr?.street}, {activeAddr?.city}</span>
          </div>
          <div className="co-success-actions">
            <Link to={`/orders/${createdOrderId}`} className="co-btn-primary" id="co-view-orders-btn">Track Order</Link>
            <Link to="/" className="co-btn-ghost" id="co-continue-shopping-btn">Continue Shopping</Link>
          </div>
        </div>
      </div>
    )
  }

  /* ── empty cart ──────────────────────────────────────────── */
  if (items.length === 0) {
    return (
      <div className="co-empty">
        <ShoppingBag size={52} className="co-empty-icon" />
        <h2 className="co-empty-title">Your cart is empty</h2>
        <p className="co-empty-sub">Add some items before checking out.</p>
        <Link to="/" className="co-btn-primary" id="co-browse-btn">Browse Products</Link>
      </div>
    )
  }

  return (
    <div className="co-page">

      {/* ── page header ── */}
      <div className="co-page-header">
        <Link to="/" className="co-back-link" id="co-back-link"><ArrowLeft size={16} /> Continue Shopping</Link>
        <h1 className="co-page-title"><ShoppingBag size={22} /> Checkout</h1>
      </div>

      {/* ── stepper ── */}
      <div className="co-stepper">
        {STEPS.map((s, i) => (
          <React.Fragment key={s.key}>
            <div className={`co-step ${i <= stepIndex ? "co-step--done" : ""} ${s.key === step ? "co-step--active" : ""}`}>
              <span className="co-step-dot">{i < stepIndex ? <CheckCircle size={14} /> : i + 1}</span>
              <span className="co-step-label">{s.label}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`co-step-line ${i < stepIndex ? "co-step-line--done" : ""}`} />}
          </React.Fragment>
        ))}
      </div>

      {/* ── two-column layout ── */}
      <div className="co-layout">

        {/* ══ LEFT: steps ══ */}
        <div className="co-left">

          {/* ─── STEP 1: Address ─── */}
          {step === "address" && (
            <section className="co-card" id="co-address-section">
              <h2 className="co-card-title"><MapPin size={18} /> Delivery Address</h2>

              <div className="co-addr-list">
                {loadingAddrs ? (
                  <p className="co-review-text" style={{ padding: "1rem" }}>Loading saved addresses...</p>
                ) : addresses.length === 0 ? (
                  <p className="co-review-text" style={{ padding: "1rem", color: "var(--text-secondary)" }}>
                    No saved addresses found. Please add a shipping address first.
                  </p>
                ) : (
                  addresses.map((addr: Address) => (
                    <label
                      key={addr.id}
                      className={`co-addr-option ${selectedAddr === addr.id ? "co-addr-option--selected" : ""}`}
                      htmlFor={`addr-radio-${addr.id}`}
                    >
                      <input
                        type="radio"
                        id={`addr-radio-${addr.id}`}
                        name="address"
                        value={addr.id}
                        checked={selectedAddr === addr.id}
                        onChange={() => setSelectedAddr(addr.id)}
                      />
                      <div className="co-addr-body">
                        <div className="co-addr-name">
                          {addr.fullName}
                          {addr.isDefault && <span className="co-addr-default-badge">Default</span>}
                        </div>
                        <div className="co-addr-detail">{addr.phone}</div>
                        <div className="co-addr-detail">{addr.street}, {addr.city}, {addr.state} — {addr.pincode}</div>
                      </div>
                    </label>
                  ))
                )}
              </div>

              <Link to="/address" className="co-add-addr-link" id="co-add-addr-link">
                + Add a new address
              </Link>

              <div className="co-step-actions">
                <button className="co-btn-primary" onClick={next} id="co-addr-next-btn">
                  Proceed to Payment <ChevronRight size={16} />
                </button>
              </div>
            </section>
          )}

          {/* ─── STEP 2: Payment ─── */}
          {step === "payment" && (
            <section className="co-card" id="co-payment-section">
              <h2 className="co-card-title"><CreditCard size={18} /> Payment Method</h2>

              <div className="co-payment-list">
                {PAYMENT_METHODS.map(pm => (
                  <label
                    key={pm.id}
                    className={`co-payment-option ${payment === pm.id ? "co-payment-option--selected" : ""}`}
                    htmlFor={`pay-${pm.id}`}
                  >
                    <input
                      type="radio"
                      id={`pay-${pm.id}`}
                      name="payment"
                      value={pm.id}
                      checked={payment === pm.id}
                      onChange={() => setPayment(pm.id)}
                    />
                    <span className="co-pay-icon"><pm.Icon size={20} /></span>
                    <div>
                      <div className="co-pay-label">{pm.label}</div>
                      <div className="co-pay-sub">{pm.sub}</div>
                    </div>
                  </label>
                ))}
              </div>

              {/* Coupon */}
              <div className="co-coupon-row">
                <Tag size={16} className="co-coupon-icon" />
                <input
                  id="co-coupon-input"
                  className="co-coupon-input"
                  placeholder="Enter coupon code"
                  value={coupon}
                  onChange={e => setCoupon(e.target.value)}
                  disabled={couponApplied}
                />
                <button
                  id="co-coupon-btn"
                  className={`co-coupon-btn ${couponApplied ? "co-coupon-btn--applied" : ""}`}
                  onClick={applyCoupon}
                  disabled={couponApplied}
                >
                  {couponApplied ? "Applied ✓" : "Apply"}
                </button>
              </div>
              {couponApplied && (
                <p className="co-coupon-success">🎉 FRESH10 applied — 10% off!</p>
              )}

              <div className="co-step-actions">
                <button className="co-btn-ghost" onClick={back} id="co-payment-back-btn">
                  <ArrowLeft size={15} /> Back
                </button>
                <button className="co-btn-primary" onClick={next} id="co-payment-next-btn">
                  Review Order <ChevronRight size={16} />
                </button>
              </div>
            </section>
          )}

          {/* ─── STEP 3: Review ─── */}
          {step === "review" && (
            <section className="co-card" id="co-review-section">
              <h2 className="co-card-title"><Package size={18} /> Order Review</h2>

              {/* address summary */}
              <div className="co-review-block">
                <div className="co-review-block-header">
                  <span><MapPin size={14} /> Delivering to</span>
                  <button className="co-review-edit" onClick={() => setStep("address")} id="co-edit-address-btn">Edit</button>
                </div>
                <p className="co-review-text">
                  <strong>{activeAddr?.fullName}</strong> · {activeAddr?.phone}<br />
                  {activeAddr?.street}, {activeAddr?.city}, {activeAddr?.state} — {activeAddr?.pincode}
                </p>
              </div>

              {/* payment summary */}
              <div className="co-review-block">
                <div className="co-review-block-header">
                  <span><CreditCard size={14} /> Payment</span>
                  <button className="co-review-edit" onClick={() => setStep("payment")} id="co-edit-payment-btn">Edit</button>
                </div>
                <p className="co-review-text">
                  {PAYMENT_METHODS.find(p => p.id === payment)?.label}
                </p>
              </div>

              {/* items */}
              <div className="co-review-items">
                {items.map(({ product, quantity }) => (
                  <div key={product.id} className="co-review-item">
                    <img src={product.image} alt={product.name} className="co-review-img" />
                    <div className="co-review-item-info">
                      <span className="co-review-item-name">{product.name}</span>
                      <span className="co-review-item-qty">×{quantity} · {product.unit}</span>
                    </div>
                    <span className="co-review-item-price">₹{product.price * quantity}</span>
                  </div>
                ))}
              </div>

              <div className="co-step-actions">
                <button className="co-btn-ghost" onClick={back} id="co-review-back-btn">
                  <ArrowLeft size={15} /> Back
                </button>
                <button
                  className="co-btn-place"
                  onClick={placeOrder}
                  disabled={placing}
                  id="co-place-order-btn"
                >
                  {placing ? <span className="co-spinner" /> : <Truck size={16} />}
                  {placing ? "Placing Order…" : `Place Order · ₹${orderTotal}`}
                </button>
              </div>
            </section>
          )}
        </div>

        {/* ══ RIGHT: order summary ══ */}
        <aside className="co-summary">
          <h2 className="co-summary-title">Order Summary</h2>

          <div className="co-summary-items">
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="co-summary-item">
                <img src={product.image} alt={product.name} className="co-summary-img" />
                <div className="co-summary-item-info">
                  <span className="co-summary-item-name">{product.name}</span>
                  <span className="co-summary-item-qty">×{quantity}</span>
                </div>
                <span className="co-summary-item-price">₹{product.price * quantity}</span>
              </div>
            ))}
          </div>

          <div className="co-summary-divider" />

          <div className="co-summary-row">
            <span>Subtotal</span><span>₹{cartTotal}</span>
          </div>
          <div className="co-summary-row">
            <span>Delivery</span>
            <span className={delivery === 0 ? "co-free" : ""}>
              {delivery === 0 ? "FREE" : `₹${delivery}`}
            </span>
          </div>
          {couponApplied && (
            <div className="co-summary-row co-summary-row--discount">
              <span>Coupon (FRESH10)</span><span>−₹{discount}</span>
            </div>
          )}

          <div className="co-summary-divider" />

          <div className="co-summary-total">
            <span>Total</span><span>₹{orderTotal}</span>
          </div>

          {delivery === 0 && (
            <p className="co-free-badge">🚀 Free delivery on this order!</p>
          )}
          {delivery !== 0 && (
            <p className="co-free-hint">Add ₹{499 - cartTotal} more for free delivery</p>
          )}
        </aside>
      </div>
    </div>
  )
}

export default Checkout