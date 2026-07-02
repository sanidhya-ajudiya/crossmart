import { useEffect, useState } from "react";
import { PackageIcon, NavigationIcon } from "lucide-react";
import OtpModal from "../../components/Delivery/OtpModal";
import CancelModal from "../../components/Delivery/CancelModal";
import DeliveryOrderCard, {
    type DeliveryOrder,
} from "../../components/Delivery/DeliveryOrderCard";
import { apiFetch } from "../../utils/api";
import { toast } from "react-hot-toast";
import "../../delivery.css";

export default function DeliveryDashboard() {
    const [orders, setOrders] = useState<DeliveryOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<"active" | "completed">("active");
    const [tracking, setTracking] = useState(false);

    /* OTP modal state */
    const [otpModal, setOtpModal] = useState<string | null>(null);
    const [otp, setOtp] = useState("");
    const [submitting, setSubmitting] = useState(false);

    /* Cancel modal state */
    const [cancelModal, setCancelModal] = useState<string | null>(null);
    const [cancelReason, setCancelReason] = useState("");

    /* ─── Data fetching ────────────────────────────────────────── */
    const fetchOrders = async () => {
        setLoading(true);
        try {
            const data = await apiFetch(`/delivery/orders?tab=${tab}`);
            setOrders(data);
        } catch (err: any) {
            toast.error("Failed to load assigned deliveries.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [tab]);

    /* ─── Handlers ─────────────────────────────────────────────── */
    const handleUpdateStatus = async (orderId: string, status: string) => {
        try {
            await apiFetch(`/delivery/orders/${orderId}/status`, {
                method: "PUT",
                bodyData: { status }
            });
            toast.success(`Delivery status updated to: ${status}`);
            await fetchOrders();
        } catch (err: any) {
            toast.error(err.message || "Failed to update delivery status.");
        }
    };

    const handleComplete = async () => {
        if (!otpModal || !otp) return;
        setSubmitting(true);
        try {
            await apiFetch(`/delivery/orders/${otpModal}/complete`, {
                method: "PUT",
                bodyData: { otp }
            });
            toast.success("Delivery completed and verified successfully!");
            setOtpModal(null);
            setOtp("");
            await fetchOrders();
        } catch (err: any) {
            toast.error(err.message || "Invalid OTP code. Please check with customer.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = async () => {
        if (!cancelModal) return;
        setSubmitting(true);
        try {
            await apiFetch(`/delivery/orders/${cancelModal}/cancel`, {
                method: "PUT",
                bodyData: { reason: cancelReason }
            });
            toast.success("Delivery assignment cancelled.");
            setCancelModal(null);
            setCancelReason("");
            await fetchOrders();
        } catch (err: any) {
            toast.error(err.message || "Failed to cancel assignment.");
        } finally {
            setSubmitting(false);
        }
    };


    /* ─── Render ───────────────────────────────────────────────── */
    return (
        <div className="ddb-page">
            {/* ── Tab bar + Location toggle ────────────────────────── */}
            <div className="ddb-bar">
                {(["active", "completed"] as const).map((t) => (
                    <button
                        key={t} onClick={() => setTab(t)} className={`ddb-tab${tab === t ? "ddb-tab--active" : ""}`}>{t === "active" ? "Active" : "Completed"}
                    </button>
                ))}

                <button onClick={() => setTracking((prev) => !prev)} className={`ddb-track-btn${tracking ? " ddb-track-btn--on" : ""}`}>  <NavigationIcon size={14} className={tracking ? "ddb-pulse" : undefined} /> {tracking ? "Sharing Location" : "Share Location"}
                </button>
            </div>

            {/* ── Order list / empty / loading ─────────────────────── */}
            {loading ? (
                <div className="ddb-loading">
                    <div className="ddb-spinner" />
                </div>
            ) : orders.length === 0 ? (
                <div className="ddb-empty">
                    <PackageIcon size={48} className="ddb-empty-icon" />
                    <p className="ddb-empty-title">No {tab} deliveries</p>
                    <p className="ddb-empty-sub">
                        {tab === "active"
                            ? "You'll see new assignments here"
                            : "Completed deliveries will appear here"}
                    </p>
                </div>
            ) : (
                <div className="ddb-list">
                    {orders.map((order) => (
                        <DeliveryOrderCard
                            key={order._id}
                            order={order}
                            tab={tab}
                            handleUpdateStatus={handleUpdateStatus}
                            setOtpModal={setOtpModal}
                            setCancelModal={setCancelModal}
                        />
                    ))}
                </div>
            )}

            {/* ── Modals ───────────────────────────────────────────── */}
            {otpModal && (
                <OtpModal
                    setOtpModal={setOtpModal}
                    otp={otp}
                    setOtp={setOtp}
                    handleComplete={handleComplete}
                    submitting={submitting}
                />
            )}
            {cancelModal && (
                <CancelModal
                    setCancelModal={setCancelModal}
                    cancelReason={cancelReason}
                    setCancelReason={setCancelReason}
                    handleCancel={handleCancel}
                    submitting={submitting}
                />
            )}
        </div>
    );
}
