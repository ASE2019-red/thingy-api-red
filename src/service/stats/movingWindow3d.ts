import { MovingWindow } from './movingWindow';

export class MovingWindow3d implements MovingWindow {
    public readonly maxSize: number;
    public x: number[] = [];
    public y: number[] = [];
    public z: number[] = [];

    constructor(maxSize: number, fill = false) {
        this.maxSize = maxSize;
        for (let i = 0; i < maxSize; i++) {
            this.x.push(0.0);
            this.y.push(0.0);
            this.z.push(0.0);
        }
    }

    public size(): number {
        return this.x.length;
    }

    public shift(): void {
        this.x.shift();
        this.y.shift();
        this.z.shift();
    }

    public push(vector: number[]) {
        if (this.maxSize > 0 && this.size() >= this.maxSize) {
            this.shift();
        }
        const x = vector[0];
        const y = vector[1];
        const z = vector[2];
        this.x.push(x);
        this.y.push(y);
        this.z.push(z);
    }

    public reset(): void {
        this.x = [];
        this.y = [];
        this.z = [];
    }
}
