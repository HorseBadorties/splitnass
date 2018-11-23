/// <reference path="../../node_modules/@types/node/index.d.ts" />

import { Server as HttpServer } from "http";
import * as express from "express";
import * as path from "path";

import { DB } from "./db";
import { WebsocketServer } from "./websocket.server";
import * as m from "../migration";
import { Spieltag } from "../model/spieltag";

export class SplitnassServer {

  public port = process.env.PORT || 4200;
  private app: express.Application;
  private httpServer: HttpServer;
  private websocketServer: WebsocketServer;
  private db: DB;

  constructor() {
    this.app = express();
    this.app.use(express.static(__dirname + "/../../dist/splitnass"));
    this.app.get("/*", function (req, res) {
      res.sendFile(path.join(__dirname + "/../../dist/splitnass/index.html"));
    });

    this.httpServer = new HttpServer(this.app);

    try {
      this.websocketServer = new WebsocketServer(this);
    } catch (error) {
      console.error("Failed to start WebsocketServer");
      console.error(error);
    }

    try {
      this.db = new DB(this);
    } catch (error) {
      console.error("Failed to connect to DB");
      console.error(error);
    }

  }

  public getApp(): express.Application {
    return this.app;
  }

  public getHttpServer(): HttpServer {
    return this.httpServer;
  }

  public dbSuccessfullyInitialized() {
    // do migration
    m.runMigration(spieltag => {
      this.spieltagUpdate(Spieltag.toJSON(spieltag));
      console.log(`migrated ${spieltag.name}`);
    });
    // start server
    this.httpServer.listen(this.port, () => {
      console.log(`Splitnass server running on port ${this.port}`);
    });
  }

  public spieltagUpdate(spieltagJson: string) {
    if (this.db) {
      this.db.updateSpieltag(spieltagJson);
    }
  }

  public listSpieltage(): Promise<Array<Object>> {
    return this.db.listSpieltage();
  }

  public getSpieltag(beginn: Date): Promise<Object> {
    return this.db.getSpieltag(beginn);
  }

}

const splitnassServer = new SplitnassServer();
export { splitnassServer };
