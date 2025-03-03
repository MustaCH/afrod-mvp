import mongoose, { Document, Schema } from "mongoose";
import { IVideo } from "../types";

export interface IVideoDocument extends Omit<IVideo, "_id">, Document {}

const videoSchema: Schema = new Schema<IVideoDocument>({
  title: { type: String, required: true },
  thumbnail: { type: String, required: true },
  description: { type: String, required: false },
  src: { type: String, required: true, unique: true },
  date: { type: Date, required: true },
  score: { type: Number, required: false },
  actors: { type: Array, required: true },
});

export default mongoose.models.Video ||
  mongoose.model<IVideoDocument>("Video", videoSchema);
