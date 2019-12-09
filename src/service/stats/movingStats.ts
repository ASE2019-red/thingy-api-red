// implementation of exponential moving average
// suitable for streams of data
export class MovingStats {
    public mean: number;
    private alpha: number;
    private variance: number;

    constructor(alpha: number, mean: number) {
        this.alpha = alpha;
        this.mean = !mean ? 0 : mean;
        this.variance = 0;
    }

    public get beta(): number {
        return 1 - this.alpha;
    }

    public update(newValue: number): void {
        const redistributedMean = this.beta * this.mean;
        const meanIncrement = this.alpha * newValue;
        const newMean = redistributedMean + meanIncrement;
        const varianceIncrement = this.alpha * (newValue - this.mean) ** 2;
        const newVariance = this.beta * (this.variance + varianceIncrement);
        this.mean = newMean;
        this.variance = newVariance;
    }

    public get stdev(): number {
        return Math.sqrt(this.variance);
    }
}
