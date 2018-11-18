/// <reference path="../../node_modules/@types/node/index.d.ts" />

import * as socketIo from "socket.io";
import { SplitnassServer } from "./server";

export class WebsocketServer {
  private websocket: socketIo.Server;
  public aktSpieltag: string;

  constructor(private splitnassServer: SplitnassServer) {
    this.websocket = socketIo(splitnassServer.getHttpServer());
    this.websocket.origins("*:*");
    this.websocket.on("connect", socket => this.onConnect(socket));
    console.log(`WebsocketServer started`);
  }

  private onConnect(socket: socketIo.Socket) {
    console.log(`Client ${socket.client.id} connected`);
    socket.on("disconnect", () => {
      console.log(`Client ${socket.client.id} disconnected`);
    });
    socket.on("spieltag", data => {
      console.log(`sending updated spieltag`);
      this.aktSpieltag = data;
      this.websocket.compress(true).emit("spieltag", data);
      this.splitnassServer.spieltagUpdate(this.aktSpieltag);
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
  }

}
