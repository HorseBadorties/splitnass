/// <reference path="../../node_modules/@types/node/index.d.ts" />

import * as WebSocket from "ws";
import { SplitnassServer } from "./server";
import { IncomingMessage } from "http";

export class WebsocketServer {
  private io: WebSocket.Server;
  private rooms = new Map<string, string>(); // client.id to Spieltag.beginn
  private admins = new Map<string, string>(); // Spieltag.beginn to client.id

  constructor(private splitnassServer: SplitnassServer) {
    this.io = new WebSocket.Server({
      server: splitnassServer.getHttpServer()
    });
    this.io.on("connection", (socket, request) => this.onConnect(socket, request));
    console.log(`WebsocketServer started`);
  }

  private onConnect(socket: WebSocket, request: IncomingMessage) {
    console.log(`Client ${request.connection.remoteAddress} connected`);
    socket.send("connected");
    socket.on("close", (wasClean: boolean, code: number, reason: string, target: WebSocket) => {
      console.log(`Client ${request.connection.remoteAddress} disconnected due to ${reason}`);
    });
    socket.on("message", (message: string) => {
      console.log(`received message ${message}`);
      if (message === "ping") {
        setTimeout(() => {
          if (socket.readyState === 1) {
            socket.send("pong");
          }
        }, 1000);
      }
    });
    
  }

}
