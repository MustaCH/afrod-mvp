import mongoose, { Document, Schema } from "mongoose";
import { ISubscriptionType, ISubscriptionTier, IActor } from "../types";

export interface IActorDocument extends Omit<IActor, "_id">, Document {}

const subscriptionSchema: Schema = new Schema<ISubscriptionType>({
  enabled: { type: Boolean, default: false },
  tier: {
    type: String,
    enum: Object.values(ISubscriptionTier),
    default: ISubscriptionTier.NONE,
  },
});

const userSchema: Schema = new Schema<IActorDocument>({
  name: { type: String, required: true },
  lastname: { type: String, required: true },
  nickname: { type: String, required: true },
  social: { type: [String], required: true },
});

export default mongoose.models.User ||
  mongoose.model<IActorDocument>("Actor", userSchema);
