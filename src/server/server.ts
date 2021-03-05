import { Server as HttpServer, createServer } from "http";
import * as express from "express";
import * as cors from 'cors';
import * as path from "path";

import { DB } from "./db";
import { WebsocketServer } from "./websocket.server";

export class SplitnassServer {

  // uberspace port 63085
  public static readonly PORT: number = 63085;
  private app: express.Application;
  private httpServer: HttpServer;
  private db: DB;

  constructor() {
    this.app = express();
    this.app.use(cors());
    this.app.options('*', cors());
    this.app.use(express.static(__dirname + '/../../../../html'));
    this.app.get('/*', (_, res) => res.sendFile(path.join(__dirname + '/../../../../html/index.html')));

    this.httpServer = createServer(this.app);

    try {
      new WebsocketServer(this);
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
    // start server
    this.httpServer.listen(SplitnassServer.PORT, '0.0.0.0', () => {
      console.log(`Splitnass server running on port ${SplitnassServer.PORT}`);
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
