import { NavLink, Outlet } from "react-router-dom";
import { PlusIcon, PackageSearchIcon, ShoppingBagIcon, LogOutIcon, BarChart3Icon, ShieldIcon, Truck } from "lucide-react";
import Navbar from "../../components/Navbar";
import "./admin.css";

export default function AdminLayout() {

    const AdminLinkData = [
        { to: "/admin", label: "Dashboard", icon: BarChart3Icon },
        { to: "/admin/products/new", label: "Add Product", icon: PlusIcon },
        { to: "/admin/products", label: "Products", icon: PackageSearchIcon },
        { to: "/admin/orders", label: "Orders", icon: ShoppingBagIcon },
        { to: "/admin/delivery-partners", label: "Delivery Partners", icon: Truck },
        { to: "/", label: "Exit", icon: LogOutIcon },
    ]

    return (
        <div className="admin-layout-container">
            <div className="admin-navbar-desktop-only">
                <Navbar />
            </div>
            <div className="admin-layout-flex">
                {/* Admin Sidebar */}
                <aside className="admin-sidebar">
                    <div className="admin-sidebar-header">
                        <h2 className="admin-sidebar-title">
                            <ShieldIcon className="admin-sidebar-title-icon" /> Admin Panel
                        </h2>
                    </div>
                    <nav className="admin-sidebar-nav">
                        {AdminLinkData.map((link) => (
                            <NavLink
                                key={link.to}
                                to={link.to}
                                end={true}
                                className={({ isActive }) => `admin-sidebar-link ${isActive ? "active" : ""}`}
                            >
                                <link.icon className="admin-sidebar-link-icon" /> {link.label}
                            </NavLink>
                        ))}
                    </nav>
                </aside>
                <main className="admin-layout-main no-scrollbar">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
