import mongoose, {Document, Schema} from "mongoose";

mongoose.connect("mongodb://localhost/s2").then(
  () => {},
  err => {}
);

export interface IGameObject extends Document {
  objectType: string,
  layer: string,
  groupId?: string,
  x: number,
  y: number,
  scale: {
    x: number,
    y: number,
  }
}

export interface IPlayer extends Document {
  clientId: string,
  x: number,
  y: number,
  objectType: string,
  layer: string,
  scale: {
    x: number,
    y: number,
  }
}

const GameObjectSchema = new Schema({
  objectType: String,
  layer: Number,
  groupId: String,
  x: Number,
  y: Number,
  scale: {
    x: Number,
    y: Number,
  }
});

const PlayerSchema = new Schema({
  clientId: String,
  x: Number,
  y: Number,
  objectType: String,
  layer: Number,
  scale: {
    x: Number,
    y: Number,
  }
});

export const GameObject = mongoose.model<IGameObject>("GameObject", GameObjectSchema);
export const Player = mongoose.model<IPlayer>("Player", PlayerSchema);

