export class MovingWindow {
    public readonly maxSize: number;
    public x: number[] = [];
    public y: number[] = [];
    public z: number[] = [];

    constructor(maxSize: number, alpha: number = 0.5) {
        this.maxSize = maxSize;
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
}
