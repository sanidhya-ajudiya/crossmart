import { Schema, model } from 'mongoose';

const deliveryPartnerSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  vehicleType: { type: String, required: true }, // e.g. "bike", "scooter", "car"
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

export const DeliveryPartner = model('DeliveryPartner', deliveryPartnerSchema);
export default DeliveryPartner;
