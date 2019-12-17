import { MovingWindow } from './movingWindow';
export class MovingWindow1d implements MovingWindow {
    public elements: number[] = [];
    public maxSize: number;

    constructor(maxSize: number) {
        this.maxSize = maxSize;
    }

    public size(): number {
        return this.elements.length;
    }
    public shift(): void {
        this.elements.shift();
    }
    public push(num: number): void {
        if (this.maxSize > 0 && this.size() >= this.maxSize) {
            this.shift();
        }
        this.elements.push(num);
    }
    public reset(): void {
        this.elements = [];
    }

}
