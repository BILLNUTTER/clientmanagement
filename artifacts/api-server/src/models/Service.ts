import mongoose, { Document, Schema } from "mongoose";

export interface IService extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  price?: number;
  features: string[];
  icon?: string;
  category?: string;
  popular: boolean;
  createdAt: Date;
}

const serviceSchema = new Schema<IService>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number },
    features: [{ type: String }],
    icon: { type: String },
    category: { type: String },
    popular: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Service = mongoose.model<IService>("Service", serviceSchema);
