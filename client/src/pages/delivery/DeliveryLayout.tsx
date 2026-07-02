import { Outlet, Link } from 'react-router-dom';
import { TruckIcon } from 'lucide-react';
import '../../delivery.css';

/**
 * DeliveryLayout
 *
 * Shell wrapper for all /delivery/* routes.
 * Renders a sticky top navbar (brand + partner info) and
 * delegates page content to nested routes via <Outlet />.
 *
 * Usage in App.tsx:
 *   <Route path="/delivery" element={<DeliveryLayout />}>
 *     <Route index element={<DeliveryDashboard />} />
 *     ...more delivery routes...
 *   </Route>
 */
import { useAuth } from '../../context/AuthContext';

export default function DeliveryLayout() {
    const { user } = useAuth();

    const partner = {
        name: user?.name || 'Delivery Partner',
        role: user?.vehicleType ? `${user.vehicleType.charAt(0).toUpperCase() + user.vehicleType.slice(1)} Rider` : 'Delivery Executive',
        isOnline: true,
    };


    return (
        <div className="dly-shell">

            {/* ── Sticky top navbar ───────────────────────────────── */}
            <nav className="dly-nav">
                <div className="dly-nav-inner">

                    {/* Brand */}
                    <Link to="/delivery" className="dly-brand">
                        <TruckIcon size={22} className="dly-brand-icon" />
                        <span className="dly-brand-name">CrossMart</span>
                        <span className="dly-brand-tag">Delivery Hub</span>
                    </Link>

                    {/* Partner info + online badge */}
                    <div className="dly-nav-right">
                        <div className="dly-partner-info">
                            <span className="dly-partner-name">{partner.name}</span>
                            <span className="dly-partner-role">{partner.role}</span>
                        </div>

                        <span
                            className={`dly-status-badge ${
                                partner.isOnline ? 'dly-status-online' : 'dly-status-offline'
                            }`}
                        >
                            {partner.isOnline && <span className="dly-online-dot" />}
                            {partner.isOnline ? 'Online' : 'Offline'}
                        </span>
                    </div>

                </div>
            </nav>

            {/* ── Nested page content ─────────────────────────────── */}
            <main className="dly-content">
                <Outlet />
            </main>

        </div>
    );
}
