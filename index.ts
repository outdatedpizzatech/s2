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
    io.emit('PLAYER_JOIN', player);
    delete player._id;
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
  res.send(gameObjects.concat(players))
});
app.post('/game_objects', async(req, res) => {
  const gameObject = await GameObject.create(req.body);
  res.status(201).send(gameObject);
});
app.patch('/game_objects/:id', async(req, res) => {
  const gameObject = await GameObject.update({ _id: req.params.id }, { groupId: req.body.groupId });
  res.status(204).send(gameObject);
});
app.delete('/game_objects/:id', async(req, res) => {
  await GameObject.deleteOne({ _id: req.params.id });
  res.status(204).end();
});
app.get('/players', async(req, res) => {
  const data = await Player.find();
  res.send(data)
});
httpServer.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
})
