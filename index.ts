import express from 'express';
import {GameObject, IGameObject} from "./src/db";
import { readFile } from "fs";
import * as util from "util";
import * as path from "path";
import cors from "cors";
// rest of the code remains same
const app = express();
app.use(cors())
const PORT = 9000;
app.get('/', (req, res) => res.send('Xpress + TypeScript Server'));
app.get('/map', async(req, res) => {
  const data = await GameObject.find();
  res.send(data)
});
app.get('/refresh', async(req, res) => {
  await GameObject.deleteMany({});

  const gameObjects = new Array<any>();

  const readFilePromise = util.promisify(readFile);

  const data = await readFilePromise(path.resolve(__dirname, "src/maps/corneria.txt"), "utf8")

  data.split(/\n/).forEach((line, y) => {
    line.split("").forEach((code, x) => {
      if (code == "x") {
        gameObjects.push({
          objectType: "Wall",
          layer: "interactive",
          x,
          y,
        });
      }
      if (code == "l") {
        gameObjects.push({
          objectType: "Tree",
          layer: "interactive",
          x,
          y,
        });
      }
      if (code == "o") {
        gameObjects.push({
          objectType: "Water",
          layer: "interactive",
          x,
          y,
        });
      }
      if (code == "m") {
        gameObjects.push({
          objectType: "Street",
          layer: "ground",
          x,
          y,
        });
      }
      if (code == "u") {
        gameObjects.push({
          objectType: "HouseWall",
          layer: "interactive",
          x,
          y,
          role: "side"
        });
        gameObjects.push({
          objectType: "Roof",
          layer: "overhead",
          x,
          y,
          groupId: 1
        });
      }
      if (code == "r") {
        gameObjects.push({
          objectType: "HouseFloor",
          layer: "ground",
          x,
          y,
        });
        gameObjects.push({
          objectType: "Roof",
          layer: "overhead",
          x,
          y,
          groupId: 1
        });
      }
      if (code == "n") {
        gameObjects.push({
          objectType: "HouseWall",
          layer: "interactive",
          x,
          y,
          role: "front"
        });
      }
      if (code == "d") {
        gameObjects.push({
          objectType: "HouseFloor",
          layer: "ground",
          x,
          y,
        });
        gameObjects.push({
          objectType: "Door",
          layer: "passive",
          x,
          y,
        });
        gameObjects.push({
          objectType: "Empty",
          layer: "overhead",
          x,
          y,
          groupId: 1
        });
      }
    });
  });

  await Promise.all(gameObjects.map(gameObject => GameObject.create(gameObject)))

  res.status(200).end();
});
app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
});
