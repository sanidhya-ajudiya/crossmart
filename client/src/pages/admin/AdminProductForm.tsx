import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "lucide-react";
import { categoriesData } from "../../assets/assets";
import Loading from "../../components/Loading";
import { apiFetch } from "../../utils/api";
import { toast } from "react-hot-toast";
import "./admin.css";

export default function AdminProductForm() {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const navigate = useNavigate();

    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        originalPrice: "",
        image: "",
        category: "",
        unit: "",
        stock: "",
        isOrganic: false,
    });

    useEffect(() => {
        const fetchData = async () => {
            if (isEdit) {
                try {
                    const data = await apiFetch(`/products/${id}`);
                    setFormData({
                        name: data.name || "",
                        description: data.description || "",
                        price: String(data.price || ""),
                        originalPrice: String(data.originalPrice || ""),
                        image: data.image || "",
                        category: data.category || "",
                        unit: data.unit || "",
                        stock: String(data.stock || ""),
                        isOrganic: Boolean(data.isOrganic),
                    });
                } catch (err: any) {
                    toast.error("Failed to load product details.");
                }
            }
            setLoading(false);
        };
        fetchData();
    }, [id, isEdit]);

    const getBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            let imgUrl = formData.image;
            if (imageFile) {
                imgUrl = await getBase64(imageFile);
            }

            const body = {
                ...formData,
                image: imgUrl || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400",
                price: Number(formData.price),
                originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
                stock: Number(formData.stock)
            };

            if (isEdit) {
                await apiFetch(`/products/${id}`, {
                    method: "PUT",
                    bodyData: body
                });
                toast.success("Product updated successfully.");
            } else {
                await apiFetch("/products", {
                    method: "POST",
                    bodyData: body
                });
                toast.success("Product created successfully.");
            }
            navigate("/admin/products");
        } catch (err: any) {
            toast.error(err.message || "Failed to save product.");
        } finally {
            setSaving(false);
        }
    };


    return (
        <div className="product-form-container">
            <div className="product-form-header">
                <Link to="/admin/products" className="product-form-back-btn">
                    <ArrowLeftIcon size={18} />
                </Link>
                <h2 className="product-form-title">{isEdit ? "Edit Product" : "New Product"}</h2>
            </div>
            {loading ? (
                <Loading />
            ) : (
                <form onSubmit={handleSubmit} className="product-form">
                    <div className="product-form-grid">
                        <div>
                            <label className="form-label">Name</label>
                            <input
                                required
                                type="text"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="form-input-field"
                            />
                        </div>
                        <div>
                            <label className="form-label">Category</label>
                            <select
                                required
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                className="form-input-field form-select"
                            >
                                <option value="">Select a category</option>
                                {categoriesData.map(c => (
                                    <option key={c.slug} value={c.slug}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="form-label">Price (₹)</label>
                            <input
                                required
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.price}
                                onChange={e => setFormData({ ...formData, price: e.target.value })}
                                className="form-input-field"
                            />
                        </div>
                        <div>
                            <label className="form-label">Original Price (₹) - Optional</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.originalPrice}
                                onChange={e => setFormData({ ...formData, originalPrice: e.target.value })}
                                className="form-input-field"
                            />
                        </div>
                        <div>
                            <label className="form-label">Unit</label>
                            <input
                                required
                                type="text"
                                placeholder="e.g., kg, piece, liter"
                                value={formData.unit}
                                onChange={e => setFormData({ ...formData, unit: e.target.value })}
                                className="form-input-field"
                            />
                        </div>
                        <div>
                            <label className="form-label">Stock</label>
                            <input
                                required
                                type="number"
                                min="0"
                                value={formData.stock}
                                onChange={e => setFormData({ ...formData, stock: e.target.value })}
                                className="form-input-field"
                            />
                        </div>
                        <div className="form-full-width">
                            <label className="form-label">Product Image</label>
                            <div className="image-upload-wrapper">
                                {(imageFile || formData?.image) && (
                                    <div className="image-preview-box">
                                        <img
                                            src={imageFile ? URL.createObjectURL(imageFile) : formData.image}
                                            alt="Preview"
                                            className="image-preview-img"
                                        />
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={e => setImageFile(e.target.files?.[0] || null)}
                                    className="image-file-input"
                                />
                            </div>
                        </div>
                        <div className="form-full-width">
                            <label className="form-label">Description</label>
                            <textarea
                                required
                                rows={4}
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                className="form-input-field"
                            />
                        </div>
                        <div className="checkbox-group-flex">
                            <input
                                type="checkbox"
                                id="isOrganic"
                                checked={formData.isOrganic}
                                onChange={e => setFormData({ ...formData, isOrganic: e.target.checked })}
                                className="checkbox-input"
                            />
                            <label htmlFor="isOrganic" className="checkbox-label">Organic</label>
                        </div>
                    </div>

                    <div className="product-form-footer">
                        <button disabled={saving} type="submit" className="product-form-submit-btn">
                            {saving ? "Saving..." : "Save Product"}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
