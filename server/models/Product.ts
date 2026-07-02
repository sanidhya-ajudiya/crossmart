import { Schema, model } from 'mongoose';

const productSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  image: { type: String, required: true },
  category: { type: String, required: true }, // e.g. "fruits-vegetables", "dairy-eggs"
  unit: { type: String, required: true }, // e.g. "doz", "box", "kg"
  stock: { type: Number, required: true, default: 0 },
  isOrganic: { type: Boolean, default: false },
  rating: { type: Number, default: 4.5 },
  reviewsCount: { type: Number, default: 0 },
  badge: { type: String }
}, {
  timestamps: true
});

export const Product = model('Product', productSchema);
export default Product;
