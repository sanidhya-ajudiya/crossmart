import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { TruckIcon } from 'lucide-react';
import loginBanner from '../../assets/banner/login_grocery_banner.png';
import '../../delivery.css';

export default function DeliveryLogin() {
    const navigate = useNavigate();
    const { loginDelivery } = useAuth();
    
    const [email, setEmail]       = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading]   = useState(false);

    /* ─── Submit handler ────────────────────────────────────── */
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!email || !password) return;

        setLoading(true);
        try {
            const partner = await loginDelivery(email, password);
            toast.success(`Welcome back, ${partner.name}!`);
            navigate('/delivery');
        } catch (err: any) {
            toast.error(err.message || 'Login failed. Please check credentials.');
            console.error('Login failed:', err);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="dlg-shell">

            {/* ── Left illustrated panel ───────────────────────── */}
            <div className="dlg-panel">
                <img
                    src={loginBanner}
                    alt="Delivery partner illustration"
                    className="dlg-panel-img"
                />
                <div className="dlg-panel-body">
                    <TruckIcon size={56} className="dlg-panel-icon" />
                    <h2 className="dlg-panel-title">
                        Delivery Partner<br />Portal
                    </h2>
                    <p className="dlg-panel-sub">
                        Manage your deliveries efficiently and keep customers happy every day.
                    </p>
                </div>
            </div>

            {/* ── Right form area ──────────────────────────────── */}
            <div className="dlg-form-area">
                <div className="dlg-form-wrap">

                    {/* Header */}
                    <div className="dlg-form-header">
                        <div className="dlg-logo-row">
                            <TruckIcon size={24} className="dlg-logo-icon" />
                            <span className="dlg-logo-name">CrossMart</span>
                            <span className="dlg-logo-tag">Delivery</span>
                        </div>
                        <h1 className="dlg-heading">Partner Login</h1>
                        <p className="dlg-sub">Sign in to manage your deliveries</p>
                    </div>

                    {/* Form card */}
                    <form onSubmit={handleSubmit} className="dlg-card">

                        {/* Email */}
                        <div className="dlg-field">
                            <label htmlFor="dlg-email" className="dlg-label">Email</label>
                            <input
                                id="dlg-email"
                                type="email"
                                required
                                autoComplete="email"
                                placeholder="partner@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="dlg-input"
                            />
                        </div>

                        {/* Password */}
                        <div className="dlg-field">
                            <label htmlFor="dlg-password" className="dlg-label">Password</label>
                            <input
                                id="dlg-password"
                                type="password"
                                required
                                autoComplete="current-password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="dlg-input"
                            />
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="dlg-submit"
                        >
                            {loading ? 'Signing in…' : 'Sign In'}
                        </button>

                    </form>
                </div>
            </div>

        </div>
    );
}
