/// <reference path="../../node_modules/@types/node/index.d.ts" />

import * as socketIo from "socket.io";
import { SplitnassServer } from "./server";

export class WebsocketServer {
  private io: socketIo.Server;
  public aktSpieltag: string;
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
      console.log(`updating spieltag ${beginnJSON}`);
      this.io.compress(true).to(beginnJSON).emit("spieltagJoined", spieltagJSON);
      this.splitnassServer.spieltagUpdate(spieltagJSON);
    });
    socket.on("lastSpieltag", callback => {
      if (this.aktSpieltag) {
        console.log(`returning last spieltag`);
        try {
          callback(this.aktSpieltag);
        } catch (error) {
          console.error(error);
        }
      }
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
          if (this.rooms.has(socket.client.id)) {
            socket.leave(this.rooms.get(socket.client.id));
          }
          console.log(`client ${socket.client.id} joined spieltag with beginn ${beginnJSON}`);
          socket.join(beginnJSON);
          this.rooms.set(socket.client.id, beginnJSON);
          socket.emit("joinSpieltag", JSON.stringify(spieltag));
        }
      });
    });
  }

}
