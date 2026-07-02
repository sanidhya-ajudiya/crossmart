import React, { useEffect, useState } from "react";
import { PlusIcon, XIcon, TruckIcon, PhoneIcon, MailIcon } from "lucide-react";
import type { DeliveryPartner } from "../../types";
import Loading from "../../components/Loading";
import { apiFetch } from "../../utils/api";
import { toast } from "react-hot-toast";
import "./admin.css";

export default function AdminDeliveryPartners() {
    const [partners, setPartners] = useState<DeliveryPartner[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", vehicleType: "bike" });

    const fetchPartners = async () => {
        try {
            const data = await apiFetch("/admin/partners");
            setPartners(data);
        } catch (err: any) {
            toast.error("Failed to load delivery partners.");
        }
    };

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            await fetchPartners();
            setLoading(false);
        };
        load();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await apiFetch("/admin/partners", {
                method: "POST",
                bodyData: form
            });
            toast.success("Delivery partner onboarded successfully!");
            setForm({ name: "", email: "", password: "", phone: "", vehicleType: "bike" });
            setShowForm(false);
            await fetchPartners();
        } catch (err: any) {
            toast.error(err.message || "Failed to onboard partner.");
        } finally {
            setSaving(false);
        }
    };

    const toggleActive = async (id: string, isActive: boolean) => {
        try {
            await apiFetch(`/admin/partners/${id}`, {
                method: "PUT",
                bodyData: { isActive: !isActive }
            });
            toast.success(`Partner status updated successfully.`);
            await fetchPartners();
        } catch (err: any) {
            toast.error(err.message || "Failed to update status.");
        }
    };


    if (loading) return <Loading />;

    return (
        <div className="partners-dashboard">
            <div className="partners-header">
                <h1 className="partners-title">Delivery Partners</h1>
                <button onClick={() => setShowForm(true)} className="add-partner-btn">
                    <PlusIcon size={16} /> Add Partner
                </button>
            </div>

            {/* Partners Grid */}
            {partners.length === 0 ? (
                <div className="partners-empty-state">
                    <TruckIcon className="partners-empty-icon" />
                    <p className="partners-empty-title">No delivery partners</p>
                    <p className="partners-empty-text">Onboard your first partner to get started</p>
                </div>
            ) : (
                <div className="partners-grid">
                    {partners.map((p) => (
                        <div key={p._id} className="partner-card">
                            <div className="partner-card-header">
                                <div className="partner-info-flex">
                                    <div className="partner-avatar">
                                        <span className="partner-avatar-text">{p.name.charAt(0).toUpperCase()}</span>
                                    </div>
                                    <div className="partner-details">
                                        <p className="partner-name">{p.name}</p>
                                        <p className="partner-vehicle">{p.vehicleType}</p>
                                    </div>
                                </div>
                                <span className={`partner-status ${p.isActive ? "status-active" : "status-inactive"}`}>
                                    {p.isActive ? "Active" : "Inactive"}
                                </span>
                            </div>
                            <div className="partner-contact-list">
                                <p className="partner-contact-item"><MailIcon className="partner-contact-icon" /> {p.email}</p>
                                <p className="partner-contact-item"><PhoneIcon className="partner-contact-icon" /> {p.phone}</p>
                            </div>
                            <button onClick={() => toggleActive(p._id, p.isActive)} className={`partner-toggle-btn ${p.isActive ? "btn-deactivate" : "btn-activate"}`}>
                                {p.isActive ? "Deactivate" : "Activate"}
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Partner Modal */}
            {showForm && (
                <>
                    <div className="modal-backdrop" onClick={() => setShowForm(false)} />
                    <div className="modal-container">
                        <form onSubmit={handleSubmit} className="modal-content-form">
                            <div className="modal-header">
                                <h2 className="modal-title">Onboard Delivery Partner</h2>
                                <button type="button" onClick={() => setShowForm(false)} className="modal-close-btn"><XIcon className="modal-close-icon" /></button>
                            </div>
                            <div className="form-inputs">
                                <div className="form-group">
                                    <label className="form-label">Full Name</label>
                                    <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="form-input" />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Email</label>
                                        <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="form-input" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Password</label>
                                        <input type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="form-input" />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Phone</label>
                                        <input type="text" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="form-input" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Vehicle Type</label>
                                        <select value={form.vehicleType} onChange={(e) => setForm({ ...form, vehicleType: e.target.value })} className="form-select">
                                            <option value="bike">Bike</option>
                                            <option value="scooter">Scooter</option>
                                            <option value="car">Car</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <button type="submit" disabled={saving} className="form-submit-btn">
                                {saving ? "Creating..." : "Create Partner"}
                            </button>
                        </form>
                    </div>
                </>
            )}
        </div>
    );
}
