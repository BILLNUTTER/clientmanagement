import mongoose, { Document, Schema } from "mongoose";

export type RequestStatus = "pending" | "in_progress" | "completed" | "cancelled";
export type PaymentStatus = "unpaid" | "pending" | "paid" | "failed";

export interface IServiceRequest extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  serviceId?: mongoose.Types.ObjectId;
  serviceName: string;
  description: string;
  requirements?: string;
  status: RequestStatus;
  adminNotes?: string;
  completedAt?: Date;
  subscriptionEndsAt?: Date;
  paymentRequired: boolean;
  paymentAmount?: number;
  paymentCurrency: string;
  paymentStatus: PaymentStatus;
  paymentPhone?: string;
  pesapalOrderTrackingId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const serviceRequestSchema = new Schema<IServiceRequest>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    serviceId: { type: Schema.Types.ObjectId, ref: "Service" },
    serviceName: { type: String, required: true },
    description: { type: String, required: true },
    requirements: { type: String },
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed", "cancelled"],
      default: "pending",
    },
    adminNotes: { type: String },
    completedAt: { type: Date },
    subscriptionEndsAt: { type: Date },
    paymentRequired: { type: Boolean, default: false },
    paymentAmount: { type: Number },
    paymentCurrency: { type: String, default: "KES" },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "pending", "paid", "failed"],
      default: "unpaid",
    },
    paymentPhone: { type: String },
    pesapalOrderTrackingId: { type: String },
  },
  { timestamps: true }
);

export const ServiceRequest = mongoose.model<IServiceRequest>("ServiceRequest", serviceRequestSchema);
