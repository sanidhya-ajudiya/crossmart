import { useState, useEffect } from "react";
import { TruckIcon } from "lucide-react";
import toast from "react-hot-toast";
import type { DeliveryPartner } from "../../types";
import Loading from "../../components/Loading";
import { apiFetch } from "../../utils/api";
import "./admin.css";

export default function AdminOrders() {
    const currency = import.meta.env.VITE_CURRENCY_SYMBOL || "₹";

    const [orders, setOrders] = useState<any[]>([]);
    const [partners, setPartners] = useState<DeliveryPartner[]>([]);
    const [loading, setLoading] = useState(true);
    const [assignModal, setAssignModal] = useState<string | null>(null);
    const [selectedPartner, setSelectedPartner] = useState("");

    const fetchOrders = async () => {
        try {
            const data = await apiFetch("/admin/orders");
            // Map backend 'totalPrice' to frontend expected 'total' key
            const mapped = data.map((o: any) => ({
                ...o,
                total: o.totalPrice
            }));
            setOrders(mapped);
        } catch (err: any) {
            toast.error("Failed to load orders history.");
        }
    };

    const fetchPartners = async () => {
        try {
            const data = await apiFetch("/admin/partners");
            setPartners(data);
        } catch (err: any) {
            toast.error("Failed to load delivery partners list.");
        }
    };

    useEffect(() => {
        const loadAllData = async () => {
            setLoading(true);
            await Promise.all([fetchOrders(), fetchPartners()]);
            setLoading(false);
        };
        loadAllData();
    }, []);

    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            await apiFetch(`/admin/orders/${id}/status`, {
                method: "PUT",
                bodyData: { status: newStatus }
            });
            toast.success(`Order status updated to ${newStatus}`);
            await fetchOrders();
        } catch (err: any) {
            toast.error(err.message || "Failed to update order status.");
        }
    };

    const handleAssign = async () => {
        if (!assignModal || !selectedPartner) return;
        try {
            await apiFetch(`/admin/orders/${assignModal}/assign`, {
                method: "PUT",
                bodyData: { partnerId: selectedPartner }
            });
            toast.success("Delivery partner assigned successfully!");
            await fetchOrders();
        } catch (err: any) {
            toast.error(err.message || "Failed to assign partner.");
        } finally {
            setAssignModal(null);
            setSelectedPartner("");
        }
    };

    const statusOptions = ["Placed", "Confirmed", "Assigned", "Out for Delivery", "Delivered", "Cancelled"];

    if (loading) return <Loading />;


    return (
        <>
            <div className="orders-table-container">
                <div className="orders-table-header">
                    <h2 className="orders-table-title">Orders</h2>
                </div>
                <div className="orders-table-wrapper">
                    <table className="orders-table">
                        <thead className="orders-thead">
                            <tr>
                                <th className="orders-th">Order Details</th>
                                <th className="orders-th">Customer</th>
                                <th className="orders-th">Total</th>
                                <th className="orders-th">Delivery Partner</th>
                                <th className="orders-th">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="orders-td" style={{ textAlign: "center" }}>
                                        No orders found.
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order: any) => (
                                    <tr key={order._id} className="orders-tr">
                                        <td className="orders-td">
                                            <div className="order-details">
                                                <p className="order-id">#{order._id.slice(-6).toUpperCase()}</p>
                                                <p className="order-date">{new Date(order.createdAt).toLocaleString()}</p>
                                            </div>
                                        </td>
                                        <td className="orders-td">
                                            <div className="order-customer">
                                                <p className="customer-name">{order.user?.name || "Unknown User"}</p>
                                                <p className="customer-email">{order.user?.email || "No email"}</p>
                                            </div>
                                        </td>
                                        <td className="orders-td order-total">
                                            {currency}{order.total.toFixed(2)}
                                        </td>
                                        <td className="orders-td order-partner">
                                            {order.deliveryPartner ? (
                                                <div className="partner-assigned-block">
                                                    <div className="partner-mini-avatar">
                                                        <span className="partner-mini-avatar-text">
                                                            {order.deliveryPartner.name?.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="partner-mini-name">{order.deliveryPartner.name}</p>
                                                        <p className="partner-mini-phone">{order.deliveryPartner.phone}</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => { setAssignModal(order._id); setSelectedPartner(""); }}
                                                    className="partner-assign-btn"
                                                >
                                                    <TruckIcon className="partner-assign-btn-icon" /> Assign
                                                </button>
                                            )}
                                        </td>
                                        <td className="orders-td">
                                            <select
                                                value={order.status}
                                                onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                                className={`status-select-dropdown status-${order.status.replace(/\s+/g, '-')}`}
                                            >
                                                {statusOptions.map((s) => (
                                                    <option key={s} value={s}>{s}</option>
                                                ))}
                                            </select>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Assign Modal */}
            {assignModal && (
                <>
                    <div className="modal-backdrop" onClick={() => setAssignModal(null)} />
                    <div className="modal-container">
                        <div className="modal-content">
                            <h3 className="modal-title">Assign Delivery Partner</h3>
                            {partners.length === 0 ? (
                                <p className="modal-empty-text">No active delivery partners. Please onboard a partner first.</p>
                            ) : (
                                <div className="partner-options-list">
                                    {partners.map((p) => (
                                        <label
                                            key={p._id}
                                            className={`partner-option ${selectedPartner === p._id ? "selected" : ""}`}
                                        >
                                            <input
                                                type="radio"
                                                name="partner"
                                                value={p._id}
                                                checked={selectedPartner === p._id}
                                                onChange={() => setSelectedPartner(p._id)}
                                                className="partner-radio-input"
                                            />
                                            <div className="partner-option-avatar">
                                                <span className="partner-option-avatar-text">
                                                    {p.name.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="partner-option-info">
                                                <p className="partner-option-name">{p.name}</p>
                                                <p className="partner-option-details">{p.vehicleType} • {p.phone}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            )}
                            <div className="modal-actions-flex">
                                <button onClick={() => setAssignModal(null)} className="btn-cancel">
                                    Cancel
                                </button>
                                <button onClick={handleAssign} disabled={!selectedPartner} className="btn-confirm">
                                    Assign
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
