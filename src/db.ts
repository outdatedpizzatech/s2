import mongoose, {Document, Schema} from "mongoose";

mongoose.connect("mongodb://localhost/s2").then(
  () => {},
  err => {}
);

export interface IGameObject extends Document {
  objectType: string,
  layer: string,
  groupId?: string,
  role?: number,
  x: number,
  y: number,
}

export interface IPlayer extends Document {
  clientId: string,
  x: number,
  y: number,
  objectType: string,
  layer: string,
}

const GameObjectSchema = new Schema({
  objectType: String,
  layer: Number,
  role: Number,
  groupId: String,
  x: Number,
  y: Number,
});

const PlayerSchema = new Schema({
  clientId: String,
  x: Number,
  y: Number,
  objectType: String,
  layer: Number,
});

export const GameObject = mongoose.model<IGameObject>("GameObject", GameObjectSchema);
export const Player = mongoose.model<IPlayer>("Player", PlayerSchema);

