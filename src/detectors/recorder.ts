import MQTTTopicClient from '../mqtt/mqtt';

export class Recorder {
    private isRecording: boolean = false;
    private frames_: any[] = [];

    constructor(private topic: string, private client: MQTTTopicClient,
                private transformer: (data: Buffer) => any) {
        this.client.onTopicMessage(topic, this.onDataFrame);
    }

    public start(): void {
        this.isRecording = true;
    }

    public stop(): void {
        this.isRecording = false;
    }

    public get frames(): any[] {
        return this.frames_;
    }

    private onDataFrame = (data: Buffer) => {
        if (this.isRecording) {
            const frame = this.transformer(data);
            this.frames_.push(frame);
        }
    }
}
