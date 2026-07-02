import { Schema, model } from 'mongoose';

const orderItemSchema = new Schema({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  unitPrice: { type: Number, required: true },
  quantity: { type: Number, required: true },
  image: { type: String }
});

const orderSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  totalPrice: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['Placed', 'Confirmed', 'Processing', 'Packed', 'Assigned', 'Out for Delivery', 'Delivered', 'Cancelled'],
    default: 'Placed' 
  },
  orderDate: { type: Date, default: Date.now },
  deliveryDate: { type: Date },
  shippingAddress: { type: String, required: true },
  deliveryPartner: { type: Schema.Types.ObjectId, ref: 'DeliveryPartner' },
  otp: { type: String }, // OTP for delivery confirmation (e.g. "1234")
  paymentMethod: { type: String, default: 'cod' }
}, {
  timestamps: true
});

export const Order = model('Order', orderSchema);
export default Order;
