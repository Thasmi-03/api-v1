import mongoose from "mongoose";
const { Schema } = mongoose;

const PartnerSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  phone: { type: String, trim: true },
  location: { type: String },
  partnershipFee: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  isApproved: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

export const Partner = mongoose.model("Partner", PartnerSchema);
