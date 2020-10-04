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

export interface IPlayer extends Document {
  clientId: string,
  x: number,
  y: number,
  objectType: string,
  layer: string,
}

const GameObjectSchema = new Schema({
  objectType: String,
  layer: String,
  role: String,
  groupId: Number,
  x: Number,
  y: Number,
});

const PlayerSchema = new Schema({
  clientId: String,
  x: Number,
  y: Number,
  objectType: String,
  layer: String,
});

export const GameObject = mongoose.model<IGameObject>("GameObject", GameObjectSchema);
export const Player = mongoose.model<IPlayer>("Player", PlayerSchema);

