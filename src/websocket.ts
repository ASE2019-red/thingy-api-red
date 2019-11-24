import * as http from 'http';
import * as url from 'url';
import * as WebSocket from 'ws';

export class Websocket {
    private wss?: WebSocket.Server;

    public constructor(private server: http.Server, private path: string) {
        this.wss = new WebSocket.Server({noServer: true});

        this.listen();
    }

    public async broadcast(callback: any) {
        for (const client of this.wss.clients) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(await callback());
            }
        }
    }

    public broadcastInterval(callback: any, interval: number) {
        setInterval(async () => this.broadcast(callback), interval);
    }

    public listen() {
        this.wss.on('connection', (ws: WebSocket, req) => {
            console.log(`New websocket client: ${req.connection.remoteAddress}`);
        });

        this.server.on('upgrade', (request, socket, head) => {
            const pathname = url.parse(request.url).pathname;

            if (pathname === this.path) {
                this.wss.handleUpgrade(request, socket, head, (ws) => {
                    this.wss.emit('connection', ws, request);
                });
            }
        });
    }
}

export default Websocket;
