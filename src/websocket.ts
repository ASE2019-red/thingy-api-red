import * as http from 'http';
import * as WebSocket from 'ws';

export class Websocket {
    private wss?: WebSocket.Server;
    private listenerCallbacks: any = Array();
    private isListening: boolean = false;

    public constructor(server: http.Server) {
        this.wss = new WebSocket.Server({server});
    }

    public listen() {
        this.wss.on('connection', (ws: WebSocket) => {
            // Register all listeners
            this.listenerCallbacks.forEach((el: any) => {
                ws.on('message', el);
            });

            // Apply for all listeners
            ws.on('message', (message: string) => {
                ws.send(`[DEBUG] You sent -> ${message}`);
            });

            // Send connection confirmation to client
            ws.send('Connection established');

            this.isListening = true;
        });
    }

    public async addListener(listener: (message: string) => void) {
        if (!this.isListening) {
            this.listenerCallbacks.push(listener);
        } else {
            throw Error('Not implemented yet: Dynamically add listeners');
            // await this.disconnect();
            // this.listen();
        }
    }

    public async disconnect() {
        await this.wss.close();
        this.isListening = false;
    }
}

export default Websocket;
