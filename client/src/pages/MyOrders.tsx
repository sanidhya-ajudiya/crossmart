import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Truck, FileText, Box, Package,
  Clock, CheckCircle, Home, ArrowLeft, X,
  ShoppingBag, MapPin, Calendar,
  IndianRupee,
} from "lucide-react";
import type { Order } from "../types";
import { apiFetch } from "../utils/api";
import { toast } from "react-hot-toast";
import Loading from "../components/Loading";

/* ─── STATUS CONFIG ─────────────────────────────────────────── */
type StatusKey = "processing" | "shipped" | "delivered" | "cancelled";
const STATUS_CONFIG: Record<StatusKey, { label: string; icon: React.ElementType; className: string }> = {
  delivered:  { label: "Delivered",  icon: CheckCircle, className: "mo-badge-delivered"  },
  processing: { label: "Processing", icon: Clock,       className: "mo-badge-processing" },
  shipped:    { label: "Shipped",    icon: Truck,       className: "mo-badge-shipped"    },
  cancelled:  { label: "Cancelled",  icon: X,           className: "mo-badge-cancelled"  },
};

const StatusBadge = ({ status }: { status: string }) => {
  const cfg = STATUS_CONFIG[status as StatusKey] ?? STATUS_CONFIG.processing;
  const Icon = cfg.icon;
  return (
    <span className={`mo-badge ${cfg.className}`}>
      <Icon size={12} />
      {cfg.label}
    </span>
  );
};

/* ─── MY ORDERS (default export) ───────────────────────────── */
const MyOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "card">("list");

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

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await apiFetch('/orders');
        const transformed = data.map((o: any) => ({
          ...o,
          id: o._id || o.id,
          status: mapBackendStatus(o.status)
        }));
        setOrders(transformed);
      } catch (err: any) {
        toast.error(err.message || "Failed to load orders.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="mo-page">

      {/* ── Header ── */}
      <header className="mo-header">
        <div>
          <h1 className="mo-title">
            <FileText size={24} className="mo-title-icon" />
            My Orders
          </h1>
          <p className="mo-subtitle">Manage your grocery orders and track deliveries</p>
        </div>

        <div className="mo-header-actions">
          {/* View toggle */}
          <div className="mo-view-toggle">
            <button
              id="mo-list-view-btn"
              className={`mo-view-btn ${viewMode === "list" ? "active" : ""}`}
              onClick={() => setViewMode("list")}
            >
              List
            </button>
            <button
              id="mo-card-view-btn"
              className={`mo-view-btn ${viewMode === "card" ? "active" : ""}`}
              onClick={() => setViewMode("card")}
            >
              Cards
            </button>
          </div>

          <Link to="/" className="mo-back-btn" id="mo-back-btn">
            <ArrowLeft size={15} />
            Back to Shop
          </Link>
        </div>
      </header>

      {/* ── Stats Row ── */}
      <div className="mo-stats-row">
        <div className="mo-stat-card">
          <ShoppingBag size={18} className="mo-stat-icon" />
          <div>
            <span className="mo-stat-num">{orders.length}</span>
            <span className="mo-stat-label">Total Orders</span>
          </div>
        </div>
        <div className="mo-stat-card">
          <CheckCircle size={18} className="mo-stat-icon mo-icon-delivered" />
          <div>
            <span className="mo-stat-num">{orders.filter(o => o.status === "delivered").length}</span>
            <span className="mo-stat-label">Delivered</span>
          </div>
        </div>
        <div className="mo-stat-card">
          <Clock size={18} className="mo-stat-icon mo-icon-processing" />
          <div>
            <span className="mo-stat-num">{orders.filter(o => o.status === "processing" || o.status === "shipped").length}</span>
            <span className="mo-stat-label">In Progress</span>
          </div>
        </div>
        <div className="mo-stat-card">
          <IndianRupee size={18} className="mo-stat-icon" />
          <div>
            <span className="mo-stat-num">{orders.reduce((s, o) => s + o.totalPrice, 0)}</span>
            <span className="mo-stat-label">Total Spent</span>
          </div>
        </div>
      </div>

      {/* ── Empty State ── */}
      {orders.length === 0 && (
        <div className="mo-empty">
          <Box size={52} className="mo-empty-icon" />
          <h3 className="mo-empty-title">No orders yet</h3>
          <p className="mo-empty-sub">You haven't placed any orders. Start shopping!</p>
          <Link to="/products" className="mo-shop-btn" id="mo-shop-btn">
            <Home size={16} /> Browse Products
          </Link>
        </div>
      )}

      {/* ── List View ── */}
      {orders.length > 0 && viewMode === "list" && (
        <div className="mo-table-wrapper">
          <table className="mo-table">
            <thead>
              <tr>
                <th className="mo-th">Order ID</th>
                <th className="mo-th">Items</th>
                <th className="mo-th">Date</th>
                <th className="mo-th">Total</th>
                <th className="mo-th">Status</th>
                <th className="mo-th">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="mo-tr">
                  <td className="mo-td">
                    <span className="mo-order-id">{order.id}</span>
                  </td>
                  <td className="mo-td">
                    <div className="mo-table-avatars">
                      {order.items.slice(0, 3).map((item) => (
                        <img key={item.productId} src={item.image} alt={item.name} className="mo-avatar" title={item.name} />
                      ))}
                      {order.items.length > 3 && (
                        <span className="mo-avatar-more">+{order.items.length - 3}</span>
                      )}
                    </div>
                    <span className="mo-item-count">{order.items.reduce((s, i) => s + i.quantity, 0)} items</span>
                  </td>
                  <td className="mo-td">
                    <span className="mo-date">{new Date(order.orderDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                  </td>
                  <td className="mo-td">
                    <span className="mo-total">₹{order.totalPrice}</span>
                  </td>
                  <td className="mo-td">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="mo-td">
                    <Link to={`/orders/${order.id}`} className="mo-track-btn" id={`mo-track-${order.id}`}>
                      Track
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Card View ── */}
      {orders.length > 0 && viewMode === "card" && (
        <div className="mo-cards-grid">
          {orders.map((order) => (
            <div key={order.id} className="mo-card">
              {/* Card header */}
              <div className="mo-card-header">
                <div>
                  <span className="mo-order-id">{order.id}</span>
                  <div className="mo-card-meta">
                    <Calendar size={13} />
                    {new Date(order.orderDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </div>
                </div>
                <StatusBadge status={order.status} />
              </div>

              {/* Items */}
              <div className="mo-card-items">
                {order.items.map((item) => (
                  <div key={item.productId} className="mo-card-item">
                    <img src={item.image} alt={item.name} className="mo-card-item-img" />
                    <div className="mo-card-item-info">
                      <span className="mo-card-item-name">{item.name}</span>
                      <span className="mo-card-item-qty">×{item.quantity} @ ₹{item.unitPrice}</span>
                    </div>
                    <span className="mo-card-item-subtotal">₹{item.unitPrice * item.quantity}</span>
                  </div>
                ))}
              </div>

              {/* Card footer */}
              <div className="mo-card-footer">
                <div className="mo-card-address">
                  <MapPin size={13} className="mo-address-icon" />
                  <span>{order.shippingAddress}</span>
                </div>
                <div className="mo-card-bottom">
                  <div className="mo-card-total">
                    <span className="mo-card-total-label">Total</span>
                    <span className="mo-card-total-val">₹{order.totalPrice}</span>
                  </div>
                  <Link to={`/orders/${order.id}`} className="mo-track-btn" id={`mo-card-track-${order.id}`}>
                    <Package size={14} />
                    Track Order
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;

