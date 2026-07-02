import {
    CheckCircleIcon,
    ClockIcon,
    MapPinIcon,
    PhoneIcon,
    TruckIcon,
    XCircleIcon,
} from 'lucide-react';
import '../../delivery.css';

/* ─── Local type: matches the backend delivery order shape ─────────────── */
export interface DeliveryOrder {
    _id: string;
    user:
        | { name: string; email: string; phone?: string }
        | string;
    items: {
        productId: string;
        name: string;
        unitPrice: number;
        quantity: number;
        image?: string;
    }[];
    total: number;
    status: string;
    shippingAddress: {
        address: string;
        city: string;
        state: string;
        zip: string;
    };
    paymentMethod: string;
    createdAt: string;
}

/* ─── Status badge colours ──────────────────────────────────────────────── */
const statusColors: Record<string, string> = {
    Assigned:           'dlv-status-confirmed',
    Packed:             'dlv-status-confirmed',
    'Out for Delivery': 'dlv-status-out-for-delivery',
    Delivered:          'dlv-status-delivered',
    Cancelled:          'dlv-status-cancelled',
};

interface DeliveryOrderCardProps {
    order: DeliveryOrder;
    tab: 'active' | 'completed';
    handleUpdateStatus: (orderId: string, status: string) => void;
    setOtpModal: (orderId: string) => void;
    setCancelModal: (orderId: string) => void;
}

export default function DeliveryOrderCard({
    order,
    tab,
    handleUpdateStatus,
    setOtpModal,
    setCancelModal,
}: DeliveryOrderCardProps) {
    const currency = import.meta.env.VITE_CURRENCY_SYMBOL ?? '₹';

    /* Normalise user — can arrive as an object or as a plain id string */
    const user =
        typeof order.user === 'object'
            ? order.user
            : { name: 'Customer', email: '', phone: undefined };

    const statusClass = statusColors[order.status] ?? 'dlv-status-placed';

    return (
        <div className="dlv-order-card">

            {/* ── Header ─────────────────────────────────────────────── */}
            <div className="doc-header">
                <div className="doc-header-left">
                    <span className="doc-order-id">
                        #{order._id.slice(-6).toUpperCase()}
                    </span>
                    <span className={`dlv-status-pill ${statusClass}`}>
                        {order.status}
                    </span>
                </div>
                <span className="doc-total">
                    {currency}{order.total.toFixed(2)}
                </span>
            </div>

            {/* ── Body ───────────────────────────────────────────────── */}
            <div className="doc-body">

                {/* Customer row */}
                <div className="doc-customer-row">
                    <div className="dlv-mini-avatar">
                        {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p className="doc-customer-name">{user.name}</p>
                        {user.phone && (
                            <p className="doc-customer-phone">
                                <PhoneIcon size={11} />
                                {user.phone}
                            </p>
                        )}
                    </div>
                </div>

                {/* Delivery address */}
                <div className="doc-address-row">
                    <MapPinIcon size={14} color="var(--primary-500)" style={{ flexShrink: 0 }} />
                    <span className="doc-address-text">
                        {order.shippingAddress.address},{' '}
                        {order.shippingAddress.city},{' '}
                        {order.shippingAddress.state}{' '}
                        {order.shippingAddress.zip}
                    </span>
                </div>

                {/* Item count & payment method */}
                <p className="doc-meta">
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''} &bull;{' '}
                    {order.paymentMethod.toUpperCase()}
                </p>

            </div>

            {/* ── Actions (active orders) ─────────────────────────────── */}
            {tab === 'active' && (
                <div className="doc-actions">

                    {/* Assigned → Packed  /  Packed → Out for Delivery */}
                    {(order.status === 'Assigned' || order.status === 'Packed') && (
                        <button className="doc-btn-progress" onClick={() =>handleUpdateStatus(order._id, order.status === 'Assigned' ? 'Packed' : 'Out for Delivery',)}>
                            <TruckIcon size={13} />
                            {order.status === 'Assigned' ? 'Mark Packed' : 'Out for Delivery'}
                        </button>
                    )}

                    {/* Out for Delivery → Delivered (OTP) */}
                    {order.status === 'Out for Delivery' && (
                        <button className="doc-btn-deliver" onClick={() => setOtpModal(order._id)}>
                            <CheckCircleIcon size={13} /> Mark Delivered
                        </button>
                    )}

                    {/* Cancel (not already terminal) */}
                    {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                        <button className="doc-btn-cancel" onClick={() => setCancelModal(order._id)}><XCircleIcon size={13} /> Cancel</button>
                    )}

                </div>
            )}

            {/* ── Footer (completed orders) ───────────────────────────── */}
            {tab === 'completed' && (
                <div className="doc-footer">
                    <p className="doc-footer-date">
                        <ClockIcon size={11} />
                        {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', })}
                    </p>
                </div>
            )}

        </div>
    );
}
