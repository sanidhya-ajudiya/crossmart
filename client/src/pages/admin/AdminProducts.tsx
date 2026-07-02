import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { PlusIcon, EditIcon, XIcon } from "lucide-react";
import Loading from "../../components/Loading";
import { apiFetch } from "../../utils/api";
import { toast } from "react-hot-toast";
import "./admin.css";

interface AdminProduct {
    _id: string;
    name: string;
    category: string;
    price: number;
    stock: number;
    image: string;
}

export default function AdminProducts() {
    const currency = import.meta.env.VITE_CURRENCY_SYMBOL || "₹";

    const [products, setProducts] = useState<AdminProduct[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const data = await apiFetch("/products");
            setProducts(data);
        } catch (err: any) {
            toast.error("Failed to load products list.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleMarkOutOfStock = async (id: string, name: string) => {
        if (!window.confirm(`Are you sure you want to mark "${name}" as out of stock?`)) return;
        try {
            await apiFetch(`/products/${id}`, {
                method: "PUT",
                bodyData: { stock: 0 }
            });
            toast.success(`"${name}" is now out of stock.`);
            await fetchProducts();
        } catch (err: any) {
            toast.error(err.message || "Failed to update stock status.");
        }
    };


    if (loading) return <Loading />;

    return (
        <div className="products-table-container">
            <div className="products-table-header">
                <h2 className="products-table-title">Products</h2>
                <Link to="/admin/products/new" className="add-product-btn">
                    <PlusIcon size={16} /> Add Product
                </Link>
            </div>
            <div className="products-table-wrapper">
                <table className="products-table">
                    <thead className="products-thead">
                        <tr>
                            <th className="products-th">Product</th>
                            <th className="products-th">Price</th>
                            <th className="products-th">Stock</th>
                            <th className="products-th text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="products-td" style={{ textAlign: "center" }}>
                                    No products found.
                                </td>
                            </tr>
                        ) : (
                            products.map(product => (
                                <tr key={product._id} className="products-tr">
                                    <td className="products-td">
                                        <div className="product-display-flex">
                                            <img src={product.image} alt={product.name} className="product-thumbnail" />
                                            <div className="product-meta">
                                                <p className="product-name">{product.name}</p>
                                                <p className="product-category">{product.category || "Uncategorized"}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="products-td product-price">
                                        {currency}{product.price.toFixed(2)}
                                    </td>
                                    <td className="products-td">
                                        <span className={`stock-badge ${product.stock > 0 ? "badge-in-stock" : "badge-out-of-stock"}`}>
                                            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                                        </span>
                                    </td>
                                    <td className="products-td text-right">
                                        <div className="actions-flex">
                                            <Link to={`/admin/products/${product._id}`} className="btn-edit">
                                                <EditIcon size={14} />
                                            </Link>
                                            <button
                                                onClick={() => handleMarkOutOfStock(product._id, product.name)}
                                                title="Mark Out of Stock"
                                                className="btn-delete"
                                            >
                                                <XIcon size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
