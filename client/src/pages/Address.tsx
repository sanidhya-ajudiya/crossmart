import React, { useState, useEffect } from "react"
import type { Address } from "../types"
import { apiFetch } from "../utils/api"
import { toast } from "react-hot-toast"

// ─── form shape aligned with Address interface ───────────────────────────────
type FormState = Omit<Address, "id">

const EMPTY_FORM: FormState = {
  fullName: "",
  phone: "",
  street: "",
  city: "",
  state: "",
  pincode: "",
  isDefault: false,
}

// ─── tiny icon helpers (inline SVG, no extra dependency) ─────────────────────
const IconPlus = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)
const IconEdit = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
)
const IconTrash = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
  </svg>
)
const IconMapPin = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
)
const IconX = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

// ─── component ────────────────────────────────────────────────────────────────
const AddressPage = () => {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // ── fetch addresses ──
  const loadAddresses = async () => {
    try {
      const data = await apiFetch("/addresses");
      const mapped = data.map((a: any) => ({
        ...a,
        id: a._id || a.id
      }));
      setAddresses(mapped);
    } catch (err: any) {
      toast.error(err.message || "Failed to load addresses.");
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  // ── helpers ────────────────────────────────────────────────────────────────
  const resetForm = () => {
    setForm(EMPTY_FORM)
    setShowForm(false)
    setEditingId(null)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }))
  }

  const onEditHandler = (add: Address) => {
    setForm({
      fullName: add.fullName,
      phone: add.phone,
      street: add.street,
      city: add.city,
      state: add.state,
      pincode: add.pincode,
      isDefault: add.isDefault ?? false,
    })
    setEditingId(add.id)
    setShowForm(true)
    // scroll form into view
    setTimeout(() => document.getElementById("addr-form")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return;
    setDeletingId(id)
    try {
      await apiFetch(`/addresses/${id}`, { method: "DELETE" });
      toast.success("Address deleted successfully.");
      await loadAddresses();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete address.");
    } finally {
      setDeletingId(null)
    }
  }

  // ── submit (create / update) ───────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (editingId) {
        await apiFetch(`/addresses/${editingId}`, {
          method: "PUT",
          bodyData: form
        });
        toast.success("Address updated successfully.");
      } else {
        await apiFetch("/addresses", {
          method: "POST",
          bodyData: form
        });
        toast.success("Address added successfully.");
      }
      await loadAddresses();
      resetForm();
    } catch (err: any) {
      toast.error(err.message || "Failed to save address.");
    } finally {
      setLoading(false)
    }
  }


  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div className="addr-page">

      {/* ── header ── */}
      <div className="addr-header">
        <div className="addr-header-left">
          <span className="addr-header-icon"><IconMapPin /></span>
          <div>
            <h1 className="addr-title">Saved Addresses</h1>
            <p className="addr-subtitle">{addresses.length} address{addresses.length !== 1 ? "es" : ""} saved</p>
          </div>
        </div>
        <button id="btn-add-address" className="addr-btn-primary" onClick={() => { resetForm(); setShowForm(true) }}>
          <IconPlus /> Add Address
        </button>
      </div>

      {/* ── add / edit form ── */}
      {showForm && (
        <form id="addr-form" className="addr-form" onSubmit={handleSubmit} noValidate>
          <div className="addr-form-header">
            <h2 className="addr-form-title">{editingId ? "Edit Address" : "New Address"}</h2>
            <button type="button" className="addr-icon-btn" onClick={resetForm} aria-label="Close form">
              <IconX />
            </button>
          </div>

          <div className="addr-form-grid">
            <div className="addr-field">
              <label htmlFor="fullName">Full Name</label>
              <input id="fullName" name="fullName" placeholder="John Doe" value={form.fullName} onChange={handleChange} required />
            </div>
            <div className="addr-field">
              <label htmlFor="phone">Phone</label>
              <input id="phone" name="phone" placeholder="+91 98765 43210" value={form.phone} onChange={handleChange} required />
            </div>
            <div className="addr-field addr-field--full">
              <label htmlFor="street">Street / House No.</label>
              <input id="street" name="street" placeholder="123, MG Road, Apt 4B" value={form.street} onChange={handleChange} required />
            </div>
            <div className="addr-field">
              <label htmlFor="city">City</label>
              <input id="city" name="city" placeholder="Mumbai" value={form.city} onChange={handleChange} required />
            </div>
            <div className="addr-field">
              <label htmlFor="state">State</label>
              <input id="state" name="state" placeholder="Maharashtra" value={form.state} onChange={handleChange} required />
            </div>
            <div className="addr-field">
              <label htmlFor="pincode">Pincode</label>
              <input id="pincode" name="pincode" placeholder="400001" value={form.pincode} onChange={handleChange} required maxLength={6} />
            </div>
            <div className="addr-field addr-field--checkbox">
              <input id="isDefault" name="isDefault" type="checkbox" checked={form.isDefault} onChange={handleChange} />
              <label htmlFor="isDefault">Set as default address</label>
            </div>
          </div>

          <div className="addr-form-actions">
            <button type="button" className="addr-btn-ghost" onClick={resetForm}>Cancel</button>
            <button type="submit" className="addr-btn-primary" disabled={loading} id="btn-save-address">
              {loading ? <span className="addr-spinner" /> : null}
              {loading ? "Saving…" : editingId ? "Update Address" : "Save Address"}
            </button>
          </div>
        </form>
      )}

      {/* ── address list ── */}
      {addresses.length === 0 ? (
        <div className="addr-empty">
          <span className="addr-empty-icon"><IconMapPin /></span>
          <p className="addr-empty-title">No addresses yet</p>
          <p className="addr-empty-sub">Add your first delivery address to get started.</p>
          <button className="addr-btn-primary" onClick={() => setShowForm(true)} id="btn-add-first-address">
            <IconPlus /> Add Address
          </button>
        </div>
      ) : (
        <ul className="addr-list">
          {addresses.map(addr => (
            <li key={addr.id} className={`addr-card ${addr.isDefault ? "addr-card--default" : ""} ${deletingId === addr.id ? "addr-card--deleting" : ""}`}>
              {addr.isDefault && <span className="addr-default-badge">Default</span>}
              <p className="addr-card-name">{addr.fullName}</p>
              <p className="addr-card-phone">{addr.phone}</p>
              <p className="addr-card-line">{addr.street}</p>
              <p className="addr-card-line">{addr.city}, {addr.state} — {addr.pincode}</p>
              <div className="addr-card-actions">
                <button className="addr-icon-btn addr-icon-btn--edit" onClick={() => onEditHandler(addr)} aria-label="Edit address" id={`btn-edit-${addr.id}`}>
                  <IconEdit /> Edit
                </button>
                <button className="addr-icon-btn addr-icon-btn--delete" onClick={() => handleDelete(addr.id)} disabled={deletingId === addr.id} aria-label="Delete address" id={`btn-delete-${addr.id}`}>
                  <IconTrash /> {deletingId === addr.id ? "Removing…" : "Delete"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default AddressPage