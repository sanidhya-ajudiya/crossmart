import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { PackageIcon, UsersIcon, ShoppingBagIcon, AlertTriangleIcon } from "lucide-react";
import Loading from "../../components/Loading";
import { statusColors } from "../../assets/assets";
import { apiFetch } from "../../utils/api";
import "./admin.css";

interface Stats {
    totalOrders: number;
    totalUsers: number;
    totalProducts: number;
    outOfStock: number;
    recentOrders: any[];
}

export default function AdminDashboard() {
    const currency = import.meta.env.VITE_CURRENCY_SYMBOL || "₹";

    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStats = async () => {
            setLoading(true);
            try {
                const data = await apiFetch("/admin/stats");
                setStats(data);
            } catch (err: any) {
                console.error("Failed to load dashboard metrics:", err);
            } finally {
                setLoading(false);
            }
        };
        loadStats();
    }, []);


    const cards = stats
        ? [
            { label: "Total Orders", value: stats.totalOrders, icon: ShoppingBagIcon },
            { label: "Total Users", value: stats.totalUsers, icon: UsersIcon },
            { label: "Total Products", value: stats.totalProducts, icon: PackageIcon },
            { label: "Out of Stock", value: stats.outOfStock, icon: AlertTriangleIcon },
        ]
        : [];

    if (loading) return <Loading />;

    return (
        <div className="admin-dashboard">
            {/* Stat Cards */}
            <div className="admin-stats-grid">
                {cards.map((card) => (
                    <div key={card.label} className="admin-stat-card">
                        <div className="admin-stat-info">
                            <p className="admin-stat-value">{card.value}</p>
                            <p className="admin-stat-label">{card.label}</p>
                        </div>
                        <div className="admin-stat-icon-wrapper">
                            <card.icon size={20} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Orders */}
            <div className="admin-table-container">
                <div className="admin-table-header">
                    <h2 className="admin-table-title">Recent Orders</h2>
                    <Link to="/admin/orders" className="admin-table-link">
                        View All →
                    </Link>
                </div>
                <div className="admin-table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th className="admin-th">Order ID</th>
                                <th className="admin-th">Customer</th>
                                <th className="admin-th">Items</th>
                                <th className="admin-th">Total</th>
                                <th className="admin-th">Status</th>
                                <th className="admin-th">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats?.recentOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="admin-td" style={{ textAlign: "center" }}>
                                        No orders yet.
                                    </td>
                                </tr>
                            ) : (
                                stats?.recentOrders.map((order: any) => (
                                    <tr key={order._id} className="admin-tr">
                                        <td className="admin-td admin-order-id">
                                            #{order._id.slice(-6).toUpperCase()}
                                        </td>
                                        <td className="admin-td">
                                            <div className="admin-customer-info">
                                                <p className="admin-customer-name">{order.user?.name || "—"}</p>
                                                <p className="admin-customer-email">{order.user?.email || ""}</p>
                                            </div>
                                        </td>
                                        <td className="admin-td">
                                            {order.items?.length || 0} items
                                        </td>
                                        <td className="admin-td admin-order-total">
                                            {currency}{order.total?.toFixed(2)}
                                        </td>
                                        <td className="admin-td">
                                            <span className={`status-badge ${statusColors[order.status] || "status-placed"}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="admin-td admin-order-date">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
