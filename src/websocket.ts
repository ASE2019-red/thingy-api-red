import * as http from 'http';
import * as WebSocket from 'ws';

export class Websocket {
    private wss?: WebSocket.Server;
    private listenerCallbacks: any = Array();

    public constructor(server: http.Server) {
        this.wss = new WebSocket.Server({server});
    }

    public broadcast(data: any) {
        // Register broadcasters
        this.wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                console.log(`Sending data to ${client}`);
                client.send(data);
            }
        });
    }

    public listen() {
        this.wss.on('connection', (ws: WebSocket, req) => {
            // Register all listeners
            this.listenerCallbacks.forEach((el: any) => {
                ws.on('message', el);
            });

            const ip = req.connection.remoteAddress;
            console.log(`New websocket client: ${ip}`);
        });
    }

    public async addListener(listener: (message: string) => void) {
        this.listenerCallbacks.push(listener);
    }
}

export default Websocket;
