import { Server, Socket } from 'socket.io';
import { SplitnassServer } from './server';

export class WebsocketServer {
  private io: Server;
  private rooms = new Map<string, string>(); // client.id to Spieltag.beginn
  private admins = new Map<string, string>(); // Spieltag.beginn to client.id

  constructor(private splitnassServer: SplitnassServer) {    
    this.io = new Server(splitnassServer.getHttpServer(), {
      cors : {
        origin: '*',
        credentials: false,       
        methods: ['GET', 'POST']
      }
    });
    // this.io.origins("*:*");
    this.io.on('connect', socket => this.onConnect(socket));
    console.log(`WebsocketServer started`);
  }

  private onConnect(socket: Socket) {
    console.log(`Client ${socket.id} connected using ${socket.conn.transport.name}`);
    socket.on('disconnect', () => {
      this.rooms.delete(socket.id);
      this.removeAsAdmin(socket);
      console.log(`Client ${socket.id} disconnected`);
    });
    socket.on('spieltagUpdated', (spieltagJSON: string, beginnJSON: string) => {
      if (this.makeAdminFor(socket, beginnJSON)) {
        this.addClientToRoom(socket, beginnJSON);
        console.log(`spieltag ${beginnJSON} got updated`);
        this.io.compress(true).to(beginnJSON).emit('spieltagUpdated', spieltagJSON);
        this.splitnassServer.spieltagUpdate(spieltagJSON);
      } else {
        // client was trying to update the Spieltag but is not an admin
        console.log(`spieltag ${beginnJSON} not updated because ${socket.id} is not the admin`);
        socket.emit('message', { severity: 'error', summary: 'No permission',
          detail: 'Der Spieltag wird von jemand anderem gesteuert!' });
      }
    });
    socket.on('message', message => socket.broadcast.emit('message', message));
    socket.on('listSpieltage', () => {
      this.splitnassServer.listSpieltage().then(list => {
        console.log(`sending list of spieltage`);
        socket.emit('listSpieltage', list);
      });
    });
    socket.on('joinSpieltag', beginnJSON => {
      this.splitnassServer.getSpieltag(beginnJSON).then(spieltag => {
        if (spieltag) {
          this.addClientToRoom(socket, beginnJSON);
          socket.emit('joinedSpieltag', JSON.stringify(spieltag));
        } else {
          socket.emit('joinedSpieltag', undefined);
        }
      });
    });
  }

  private makeAdminFor(clientSocket: Socket, room: string) {
    const currentAdmin = this.admins.get(room);
    if (currentAdmin === clientSocket.id) { // client is admin already
      return true;
    } else if (!currentAdmin) { // make him admin
      this.admins.set(room, clientSocket.id);
      console.log(`client ${clientSocket.id} now admin of ${room}`);
      return true;
    } else { // there is already another admin
      return false;
    }
  }

  private removeAsAdmin(clientSocket: Socket) {
    this.admins.forEach((v, k, m) => {
      if (v === clientSocket.id) m.delete(k);
    });
  }

  private addClientToRoom(clientSocket: Socket, room: string) {
    if (this.rooms.get(clientSocket.id) !== room) {
      this.removeAsAdmin(clientSocket);
      clientSocket.leave(this.rooms.get(clientSocket.id));
      clientSocket.join(room);
      this.rooms.set(clientSocket.id, room);
      console.log(`client ${clientSocket.id} joined ${room}`);
    }
  }

}
