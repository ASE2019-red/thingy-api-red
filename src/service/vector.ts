/**
 * Minimalistic immutable vector class
 */
class Vector {
    public readonly x: number;
    public readonly y: number;
    public readonly z: number;

    constructor(x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    public minus(otherVector: Vector) {
        return new Vector(
            this.x - otherVector.x,
            this.y - otherVector.y,
            this.z - otherVector.z,
        );
    }

    public norm() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }
}

export default Vector;
