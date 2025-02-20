import mongoose, { Document, Schema } from 'mongoose';
import { IVideo } from '../types';

export interface IVideoDocument extends IVideo, Document {}

const videoSchema: Schema = new Schema<IVideoDocument>({
  title: { type: String, required: true },
  description: { type: String, required: false },
  src: { type: String, required: true, unique: true },
  date: { type: Date, required: true},
  score: { type: Number, required: false },
});

export default mongoose.models.Video || mongoose.model<IVideoDocument>('User', videoSchema);