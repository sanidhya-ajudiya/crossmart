import { Schema, model } from 'mongoose';

const addressSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  isDefault: { type: Boolean, default: false }
}, {
  timestamps: true
});

export const Address = model('Address', addressSchema);
export default Address;
