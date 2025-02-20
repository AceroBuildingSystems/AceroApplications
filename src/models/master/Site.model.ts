import mongoose, { Schema, Document } from 'mongoose';

export interface ISite extends Document {
  name: string;
}

const SiteSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
});

export default mongoose.model<ISite>('Site', SiteSchema);