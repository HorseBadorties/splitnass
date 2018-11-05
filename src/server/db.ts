/// <reference path="../../node_modules/@types/node/index.d.ts" />

import { MongoClient, MongoError, Db, Collection } from "mongodb";
import { SplitnassServer } from "./server";

export class DB {
  public static readonly mongoUrl: string = "mongodb://localhost:27017/splitnass";
  // public static readonly mongoUrl: string = "mongodb://admin:admin123@ds243931.mlab.com:43931/splitnass";

  private db: Db;
  private dbCollection: Collection;

  constructor(private splitnassServer: SplitnassServer) {
    MongoClient.connect(DB.mongoUrl, { useNewUrlParser: true },
      (_err: MongoError, _db: Db) => {
        if (_err) throw (_err);
        this.db = _db.db("splitnass");
        this.db.createCollection("spieltag", (_err2: MongoError, _coll: Collection) => {
          if (_err2) throw (_err2);
          this.dbCollection = _coll;
          console.log(`successfully connected to ${DB.mongoUrl}`);
          this.getLatestSpieltag();
        });
      });

  }

  private getLatestSpieltag() {
    this.dbCollection.find({}).sort({ key: -1 }).limit(1).next((_err: MongoError, result: any) => {
      if (!_err && result) {
        this.splitnassServer.latestSpieltag(JSON.stringify(result));
        console.log(`Read latest Spieltag ${result.key} from db`);
      }
    });
  }

  public updateSpieltag(spieltagJson: string) {
    if (this.dbCollection) {
      const spieltagObject = JSON.parse(spieltagJson);
      this.dbCollection.replaceOne({ "key": spieltagObject.key },
        spieltagObject, { "upsert": true }, (_err: MongoError, result: any) => {
          if (_err) {
            console.error(_err);
          } else {
            console.log(`updated ${spieltagObject.key} on db`);
          }
        });
    }
  }
}

