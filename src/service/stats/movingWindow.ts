export interface MovingWindow {
    size(): number;
    shift(): void;
    push(element: any): void;
    reset(): void;
}
