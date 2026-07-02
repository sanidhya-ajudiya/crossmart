import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  Calendar,
  ShoppingBag,
  IndianRupee,
  X,
  Phone,
  User,
  Hash,
  Shield,
  Copy,
  RefreshCw,
  CheckCheck,
} from "lucide-react";
import type { Order } from "../types";

import { apiFetch } from "../utils/api";
import { toast } from "react-hot-toast";
import Loading from "../components/Loading";

/* ─── STATUS CONFIG ────────────────────────────────────────── */
type StatusKey = "processing" | "shipped" | "delivered" | "cancelled";

const mapBackendStatus = (status: string): StatusKey => {
  switch (status) {
    case 'Placed':
    case 'Processing':
      return 'processing';
    case 'Assigned':
    case 'Out for Delivery':
      return 'shipped';
    case 'Delivered':
      return 'delivered';
    case 'Cancelled':
      return 'cancelled';
    default:
      return 'processing';
  }
};

/* ─── TIMELINE STEPS ────────────────────────────────────────── */
type Step = {
  key: string;
  label: string;
  description: string;
  icon: React.ElementType;
  time?: string;
};

const ALL_STEPS: Step[] = [
  {
    key: "processing",
    label: "Order Placed",
    description: "Your order has been received and is being prepared.",
    icon: ShoppingBag,
  },
  {
    key: "packed",
    label: "Packed",
    description: "Your items have been carefully packed.",
    icon: Package,
  },
  {
    key: "shipped",
    label: "Shipped",
    description: "Your order is on its way to you.",
    icon: Truck,
  },
  {
    key: "delivered",
    label: "Delivered",
    description: "Your order has been delivered. Enjoy!",
    icon: CheckCircle,
  },
];

const STATUS_STEP_INDEX: Record<string, number> = {
  processing: 0,
  packed: 1,
  shipped: 2,
  delivered: 3,
  cancelled: -1,
};

/* ─── HELPERS ───────────────────────────────────────────────── */
const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const getMockTimes = (orderDate: string, status: string) => {
  const base = new Date(orderDate);
  const add = (d: Date, h: number) => {
    const n = new Date(d);
    n.setHours(n.getHours() + h);
    return n.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  };
  const times: Record<string, string> = {
    processing: `${fmtDate(orderDate)}, ${add(base, 0)}`,
    packed: `${fmtDate(orderDate)}, ${add(base, 2)}`,
  };
  if (status === "shipped" || status === "delivered") {
    const next = new Date(base);
    next.setDate(next.getDate() + 1);
    times.shipped = `${fmtDate(next.toISOString())}, ${add(next, 9)}`;
  }
  if (status === "delivered") {
    const del = new Date(base);
    del.setDate(del.getDate() + 2);
    times.delivered = `${fmtDate(del.toISOString())}, ${add(del, 14)}`;
  }
  return times;
};

/* ─── ORDER TRACKING PAGE ───────────────────────────────────── */
const OrderTracking = () => {
  const { id } = useParams<{ id: string }>();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  /* ── OTP state ── */
  const genOtp = () => String(Math.floor(1000 + Math.random() * 9000));
  const [otp, setOtp] = useState(genOtp);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const data = await apiFetch(`/orders/${id}`);
        setOrder({
          ...data,
          id: data._id || data.id,
          status: mapBackendStatus(data.status)
        });
      } catch (err: any) {
        toast.error("Failed to load order details.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchOrder();
  }, [id]);

  /* ── Loading ── */
  if (loading) return <Loading />;

  /* ── Not Found ── */
  if (!order) {
    return (
      <div className="ot-page">
        <div className="ot-not-found">
          <Package size={60} className="ot-not-found-icon" />
          <h2 className="ot-not-found-title">Order Not Found</h2>
          <p className="ot-not-found-sub">
            We couldn't find order <strong>{id}</strong>. It may have been
            removed or the ID is incorrect.
          </p>
          <Link to="/orders" className="ot-back-link" id="ot-back-orders-link">
            <ArrowLeft size={16} /> Back to My Orders
          </Link>
        </div>
      </div>
    );
  }

  const isCancelled = order.status === "cancelled";
  const currentStep = STATUS_STEP_INDEX[order.status] ?? 0;
  const times = getMockTimes(order.orderDate, order.status);
  const totalItems = order.items.reduce((s, i) => s + i.quantity, 0);

  /* ── OTP handlers ── */
  const handleCopy = () => {
    navigator.clipboard.writeText(otp);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const handleRefresh = () => {
    const genOtp = () => String(Math.floor(1000 + Math.random() * 9000));
    setOtp(genOtp());
  };

  return (
    <div className="ot-page">
      {/* ── Header ── */}
      <header className="ot-header">
        <div className="ot-header-left">
          <Link to="/orders" className="ot-back-btn" id="ot-back-btn">
            <ArrowLeft size={16} />
            My Orders
          </Link>
          <div>
            <h1 className="ot-title">
              <Truck size={22} className="ot-title-icon" />
              Track Order
            </h1>
            <p className="ot-subtitle">
              Real-time tracking for your delivery
            </p>
          </div>
        </div>

        <div className={`ot-status-pill ot-status-${order.status}`}>
          {isCancelled ? (
            <X size={14} />
          ) : order.status === "delivered" ? (
            <CheckCircle size={14} />
          ) : order.status === "shipped" ? (
            <Truck size={14} />
          ) : (
            <Clock size={14} />
          )}
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </div>
      </header>

      {/* ── Main Grid ── */}
      <div className="ot-grid">
        {/* ══ LEFT COLUMN ══ */}
        <div className="ot-col-left">

          {/* Order ID Card */}
          <div className="ot-card ot-order-meta-card">
            <div className="ot-meta-row">
              <div className="ot-meta-item">
                <Hash size={14} className="ot-meta-icon" />
                <div>
                  <span className="ot-meta-label">Order ID</span>
                  <span className="ot-meta-val ot-order-id">{order.id}</span>
                </div>
              </div>
              <div className="ot-meta-item">
                <Calendar size={14} className="ot-meta-icon" />
                <div>
                  <span className="ot-meta-label">Order Date</span>
                  <span className="ot-meta-val">{fmtDate(order.orderDate)}</span>
                </div>
              </div>
              {order.deliveryDate && (
                <div className="ot-meta-item">
                  <CheckCircle size={14} className="ot-meta-icon ot-icon-green" />
                  <div>
                    <span className="ot-meta-label">Delivered On</span>
                    <span className="ot-meta-val">{fmtDate(order.deliveryDate)}</span>
                  </div>
                </div>
              )}
              <div className="ot-meta-item">
                <ShoppingBag size={14} className="ot-meta-icon" />
                <div>
                  <span className="ot-meta-label">Items</span>
                  <span className="ot-meta-val">{totalItems} item{totalItems > 1 ? "s" : ""}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Tracking Timeline ── */}
          <div className="ot-card">
            <h2 className="ot-card-title">
              <Truck size={16} />
              Delivery Timeline
            </h2>

            {isCancelled ? (
              <div className="ot-cancelled-banner">
                <X size={18} />
                This order was cancelled
              </div>
            ) : (
              <div className="ot-timeline">
                {ALL_STEPS.map((step, idx) => {
                  const done = idx <= currentStep;
                  const active = idx === currentStep;
                  const Icon = step.icon;
                  const stepTime = times[step.key] ?? times[ALL_STEPS[Math.min(idx, currentStep)].key];

                  return (
                    <div
                      key={step.key}
                      className={`ot-step ${done ? "ot-step-done" : "ot-step-pending"} ${active ? "ot-step-active" : ""}`}
                    >
                      {/* Connector line */}
                      {idx < ALL_STEPS.length - 1 && (
                        <div className={`ot-connector ${idx < currentStep ? "ot-connector-done" : ""}`} />
                      )}

                      {/* Icon bubble */}
                      <div className="ot-step-bubble">
                        <Icon size={16} />
                        {active && <span className="ot-pulse" />}
                      </div>

                      {/* Text */}
                      <div className="ot-step-body">
                        <span className="ot-step-label">{step.label}</span>
                        <span className="ot-step-desc">{step.description}</span>
                        {done && stepTime && (
                          <span className="ot-step-time">
                            <Clock size={11} /> {stepTime}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Shipping Address ── */}
          <div className="ot-card">
            <h2 className="ot-card-title">
              <MapPin size={16} />
              Shipping Address
            </h2>
            <div className="ot-address-box">
              <div className="ot-address-avatar">
                <User size={20} />
              </div>
              <div className="ot-address-info">
                <span className="ot-address-name">Home Address</span>
                <span className="ot-address-text">{order.shippingAddress}</span>
              </div>
            </div>

            {/* Delivery contact (mock) */}
            <div className="ot-delivery-agent">
              <div className="ot-agent-avatar">RK</div>
              <div className="ot-agent-info">
                <span className="ot-agent-label">Delivery Partner</span>
                <span className="ot-agent-name">Ravi Kumar</span>
              </div>
              <a href="tel:+919876543210" className="ot-call-btn" id="ot-call-driver-btn">
                <Phone size={14} />
                Call
              </a>
            </div>
          </div>
        </div>

        {/* ══ RIGHT COLUMN ══ */}
        <div className="ot-col-right">

          {/* ── Order Items ── */}
          <div className="ot-card">
            <h2 className="ot-card-title">
              <Package size={16} />
              Order Items
            </h2>
            <div className="ot-items-list">
              {order.items.map((item) => (
                <div key={item.productId} className="ot-item">
                  <img src={item.image} alt={item.name} className="ot-item-img" />
                  <div className="ot-item-info">
                    <span className="ot-item-name">{item.name}</span>
                    <span className="ot-item-qty">Qty: {item.quantity}</span>
                  </div>
                  <div className="ot-item-price-col">
                    <span className="ot-item-unit">₹{item.unitPrice} each</span>
                    <span className="ot-item-subtotal">₹{item.unitPrice * item.quantity}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Price Summary ── */}
          <div className="ot-card ot-summary-card">
            <h2 className="ot-card-title">
              <IndianRupee size={16} />
              Price Summary
            </h2>
            <div className="ot-summary-rows">
              <div className="ot-summary-row">
                <span>Subtotal ({totalItems} items)</span>
                <span>₹{order.totalPrice}</span>
              </div>
              <div className="ot-summary-row">
                <span>Delivery Fee</span>
                <span className="ot-free-delivery">FREE</span>
              </div>
              <div className="ot-summary-row">
                <span>Discount</span>
                <span className="ot-discount">−₹0</span>
              </div>
              <div className="ot-summary-divider" />
              <div className="ot-summary-row ot-summary-total">
                <span>Total Paid</span>
                <span>₹{order.totalPrice}</span>
              </div>
            </div>

            {/* Payment method (mock) */}
            <div className="ot-payment-badge">
              <span className="ot-payment-dot" />
              Paid via UPI
            </div>
          </div>

          {/* ── Delivery OTP Card ── */}
          {order.status === "shipped" && (
            <div className="ot-card ot-otp-card">
              <h2 className="ot-card-title">
                <Shield size={16} />
                Delivery OTP
              </h2>

              <p className="ot-otp-hint">
                Share this OTP with the delivery partner to confirm receipt of your order.
              </p>

              {/* OTP digits */}
              <div className="ot-otp-display">
                {otp.split("").map((digit, i) => (
                  <div key={i} className="ot-otp-digit">{digit}</div>
                ))}
              </div>

              {/* Actions */}
              <div className="ot-otp-actions">
                <button
                  id="ot-copy-otp-btn"
                  className={`ot-otp-btn ot-otp-copy ${copied ? "ot-otp-copied" : ""}`}
                  onClick={handleCopy}
                >
                  {copied ? <CheckCheck size={14} /> : <Copy size={14} />}
                  {copied ? "Copied!" : "Copy OTP"}
                </button>
                <button
                  id="ot-refresh-otp-btn"
                  className="ot-otp-btn ot-otp-refresh"
                  onClick={handleRefresh}
                >
                  <RefreshCw size={14} />
                  New OTP
                </button>
              </div>

              <p className="ot-otp-warning">
                ⚠️ Never share this OTP before the delivery arrives at your door.
              </p>
            </div>
          )}

          {/* ── Help CTA ── */}
          <div className="ot-help-card">
            <span className="ot-help-emoji">🤝</span>
            <div className="ot-help-text">
              <strong>Need help with your order?</strong>
              <span>Our support team is available 24/7</span>
            </div>
            <a href="mailto:support@freshmart.in" className="ot-help-btn" id="ot-contact-support-btn">
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;