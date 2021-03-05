import { MongoClient, MongoError, Db, Collection } from 'mongodb';
import { SplitnassServer } from './server';

export class DB {
  // public static readonly mongoUrl: string = 'mongodb://localhost:27017/splitnass';
  public static readonly mongoUrl: string = "mongodb://client:client@localhost:27017/splitnass"; // uberspace port 31664

  private db: Db;
  private dbCollection: Collection;

  constructor(private splitnassServer: SplitnassServer) {
    let mongoClient = new MongoClient(DB.mongoUrl, { useUnifiedTopology: true });
    mongoClient.connect((_err: MongoError) => {
        if (_err) throw (_err);
        console.log(`successfully connected to ${DB.mongoUrl}`);
        this.db = mongoClient.db('splitnass');
        this.loadOrCreateSpieltag();
      });
  }

  private loadOrCreateSpieltag() {
    this.db.collection('spieltag', (_err: MongoError, _coll: Collection) => {
      if (_err) throw (_err);
      if (_coll) {
        console.log(`collection 'spieltag' already existed`);
        this.setDbCollection(_coll);
      } else {
        this.db.createCollection('spieltag', (_err: MongoError, _coll: Collection) => {
          if (_err) throw (_err);
          console.log(`collection 'spieltag' created`);
          this.setDbCollection(_coll);
        });  
      }
    });
  }

  private setDbCollection(spieltag: Collection) {
    this.dbCollection = spieltag;
    this.splitnassServer.dbSuccessfullyInitialized();
  }

  public updateSpieltag(spieltagJson: string) {
    if (this.dbCollection) {
      const spieltagObject = JSON.parse(spieltagJson);
      this.dbCollection.replaceOne({ 'beginn': spieltagObject.beginn },
        spieltagObject, { 'upsert': true }, (_err: MongoError, result: any) => {
          if (_err) {
            console.error(_err);
          } else {
            console.log(`updated ${spieltagObject.beginn} on db`);
          }
        });
    }
  }

  public listSpieltage(): Promise<Array<Object>> {
    return this.dbCollection.find({}/*, {projection: {name: 1, beginn: 1}}*/).sort({ beginn: -1 }).toArray();
  }

  public getSpieltag(beginn: Date): Promise<Object> {
    return this.dbCollection.find({beginn: beginn}).next();
  }
}

