import http from "http";
import express from 'express';
import {GameObject, IGameObject, Player} from "./src/db";
import { readFile } from "fs";
import * as util from "util";
import * as path from "path";
import cors from "cors";
import socketio from "socket.io";
import bodyParser from "body-parser";

// rest of the code remains same

const socketPlayerRegistry = {} as { [key: string]: string };

const app = express();
app.use(bodyParser.json())
const httpServer = http.createServer(app)
const io = socketio(httpServer);
io.on('connection', (socket) => {
  socket.on('disconnect', async() => {
    console.log('user disconnected');
    await Player.deleteOne({ clientId: socketPlayerRegistry[socket.id] });
    io.emit('PLAYER_LEAVE', socketPlayerRegistry[socket.id]);
    const registryKey = Object.keys(socketPlayerRegistry).find(key => socketPlayerRegistry[key] === socket.id);
    if(registryKey){
      delete socketPlayerRegistry[registryKey];
    }
  });

  socket.on('player moved', (msg) => {
    console.log('message: ' + msg);
  });
  socket.on('PLAYER_JOIN', async(player) => {
    socketPlayerRegistry[socket.id] = player.clientId;
    io.emit('PLAYER_JOIN', player)
    await Player.create(player);
  });
  socket.on('PLAYER_MOVE', async(message) => {
    const { clientId, x, y } = message;
    io.emit('PLAYER_MOVE', message);
    await Player.update({ clientId }, { $inc: { x, y }});
  });
  socket.on('PLAYER_FACING_DIRECTION', async(message) => {
    const { clientId, x, y } = message;
    io.emit('PLAYER_FACING_DIRECTION', message);
    await Player.update({ clientId }, { $set: { facingDirection: message.facingDirection }});
  });
});
app.use(cors())
const PORT = 9000;
app.get('/', (req, res) => res.send('Xpress + TypeScript Server'));
app.get('/map', async(req, res) => {
  const gameObjects = await GameObject.find({
    x: {
      $gte: parseInt((req.query.xMin || "").toString()),
      $lte: parseInt((req.query.xMax || "").toString()),
    },
    y: {
      $gte: parseInt((req.query.yMin || "").toString()),
      $lte: parseInt((req.query.yMax || "").toString()),
    },
  });
  const players = await Player.find();
  console.log("players...", players);
  res.send(gameObjects.concat(players))
});
app.post('/game_objects', async(req, res) => {
  console.log("boday", req.body);
  await GameObject.create(req.body);
  res.status(201).end();
});
app.get('/players', async(req, res) => {
  const data = await Player.find();
  res.send(data)
});
app.get('/refresh', async(req, res) => {
  await GameObject.deleteMany({});
  await Player.deleteMany({});

  const gameObjects = new Array<any>();

  const readFilePromise = util.promisify(readFile);

  const data = await readFilePromise(path.resolve(__dirname, "src/maps/corneria.txt"), "utf8")

  data.split(/\n/).forEach((line, y) => {
    line.split("").forEach((code, x) => {
      if (code == "x") {
        gameObjects.push({
          objectType: "Wall",
          layer: 2,
          x,
          y,
        });
      }
      if (code == "l") {
        gameObjects.push({
          objectType: "Tree",
          layer: 2,
          x,
          y,
        });
      }
      if (code == "o") {
        gameObjects.push({
          objectType: "Water",
          layer: 2,
          x,
          y,
        });
      }
      if (code == "m") {
        gameObjects.push({
          objectType: "Street",
          layer: 0,
          x,
          y,
        });
      }
      if (code == "u") {
        gameObjects.push({
          objectType: "HouseWall",
          layer: 2,
          x,
          y,
          role: "side"
        });
        gameObjects.push({
          objectType: "Roof",
          layer: 3,
          x,
          y,
          groupId: 1
        });
      }
      if (code == "r") {
        gameObjects.push({
          objectType: "HouseFloor",
          layer: 0,
          x,
          y,
        });
        gameObjects.push({
          objectType: "Roof",
          layer: 3,
          x,
          y,
          groupId: 1
        });
      }
      if (code == "n") {
        gameObjects.push({
          objectType: "HouseWall",
          layer: 2,
          x,
          y,
          role: "front"
        });
      }
      if (code == "d") {
        gameObjects.push({
          objectType: "HouseFloor",
          layer: 0,
          x,
          y,
        });
        gameObjects.push({
          objectType: "Door",
          layer: 1,
          x,
          y,
        });
        gameObjects.push({
          objectType: "Empty",
          layer: 3,
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
httpServer.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
})
