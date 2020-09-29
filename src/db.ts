import mongoose, {Schema, Document} from "mongoose";

mongoose.connect("mongodb://localhost/s2").then(
  () => {},
  err => {}
);

export interface IGameObject extends Document {
  objectType: string,
  layer: string,
  groupId?: number,
  role?: string,
  x: number,
  y: number,
}

const GameObjectSchema = new Schema({
  objectType: String,
  layer: String,
  role: String,
  groupId: Number,
  x: Number,
  y: Number,
});

export const GameObject = mongoose.model<IGameObject>("GameObject", GameObjectSchema);

