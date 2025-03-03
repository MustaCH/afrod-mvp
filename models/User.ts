import mongoose, { Document, Schema } from "mongoose";
import { IUser, ISubscriptionType, ISubscriptionTier } from "../types";

export interface IUserDocument extends Omit<IUser, "_id">, Document {}

const subscriptionSchema: Schema = new Schema<ISubscriptionType>({
  enabled: { type: Boolean, default: false },
  tier: {
    type: String,
    enum: Object.values(ISubscriptionTier),
    default: ISubscriptionTier.NONE,
  },
});

const userSchema: Schema = new Schema<IUserDocument>({
  name: { type: String, required: true },
  lastname: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  subscription: {
    type: subscriptionSchema,
    default: { enabled: false, tier: ISubscriptionTier.NONE },
  },
});

export default mongoose.models.User ||
  mongoose.model<IUserDocument>("User", userSchema);
