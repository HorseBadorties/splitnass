/// <reference path="../../node_modules/@types/node/index.d.ts" />

import * as socketIo from "socket.io";
import { SplitnassServer } from "./server";

export class WebsocketServer {
  private io: socketIo.Server;
  private rooms = new Map<string, string>();

  constructor(private splitnassServer: SplitnassServer) {
    this.io = socketIo(splitnassServer.getHttpServer());
    this.io.origins("*:*");
    this.io.on("connect", socket => this.onConnect(socket));
    console.log(`WebsocketServer started`);
  }

  private onConnect(socket: socketIo.Socket) {
    console.log(`Client ${socket.client.id} connected`);
    socket.on("disconnect", () => {
      console.log(`Client ${socket.client.id} disconnected`);
    });
    socket.on("spieltagUpdated", (spieltagJSON: string, beginnJSON: string) => {
      this.addClientToRoom(socket, beginnJSON);
      console.log(`spieltag ${beginnJSON} got updated`);
      this.io.compress(true).to(beginnJSON).emit("spieltagUpdated", spieltagJSON);
      this.splitnassServer.spieltagUpdate(spieltagJSON);
    });
    socket.on("listSpieltage", () => {
      this.splitnassServer.listSpieltage().then(list => {
        console.log(`sending list of spieltage`);
        socket.emit("listSpieltage", list);
      });
    });
    socket.on("joinSpieltag", beginnJSON => {
      this.splitnassServer.getSpieltag(beginnJSON).then(spieltag => {
        if (spieltag) {
          this.addClientToRoom(socket, beginnJSON);
          socket.emit("joinedSpieltag", JSON.stringify(spieltag));
        }
      });
    });
  }

  private addClientToRoom(clientSocket: socketIo.Socket, room: string) {
    if (this.rooms.has(clientSocket.client.id)) {
      clientSocket.leave(this.rooms.get(clientSocket.client.id));
    }
    console.log(`client ${clientSocket.client.id} joined ${room}`);
    clientSocket.join(room);
    this.rooms.set(clientSocket.client.id, room);
  }

}
