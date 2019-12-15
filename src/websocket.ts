import * as http from 'http';
import {BaseContext, ExtendableContext} from 'koa';
import * as querystring from 'querystring';
import * as url from 'url';
import * as WebSocket from 'ws';

class WebsocketFactory {

    public static getInstance(server: http.Server, ctx: BaseContext): WebsocketFactory {
        if (!WebsocketFactory.instance) {
            WebsocketFactory.instance = new WebsocketFactory(server, ctx as ExtendableContext);
        }

        return WebsocketFactory.instance;
    }

    private static instance: WebsocketFactory;
    private sockets: Websocket[] = [];

    private constructor(private server: http.Server, private ctx: ExtendableContext) {
    }

    public newSocket(path: string) {
        const websocket = new Websocket(this.server, this.ctx, path);
        this.sockets.push(websocket);
        return websocket;
    }
}

// tslint:disable-next-line:max-classes-per-file
class Websocket {
    private wss?: WebSocket.Server;

    public constructor(private server: http.Server,
                       private ctx: ExtendableContext,
                       private path: string,
                       private params = {}) {
        this.wss = new WebSocket.Server({noServer: true});
        this.listen();
    }

    public async broadcast(callback: any) {
        for (const client of this.wss.clients) {
            if (client.readyState === WebSocket.OPEN) {
                const data = await (callback(this.ctx, this.params));
                console.log(`Send ${data}`);
                client.send(data);
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
                    this.params = querystring.parse(url.parse(request.url).query);
                });
            }
        });
    }

    public wire(eventWiring: WebsocketWiring) {
        this.wss.on('connection', (ws: WebSocket, req) => {
            eventWiring.addListeners(ws);
        });
    }
}

interface WebsocketWiring {
    addListeners(ws: WebSocket): void;
}

export {Websocket, WebsocketFactory, WebsocketWiring};
export default WebsocketFactory;
