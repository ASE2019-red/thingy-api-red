// todo: we could probably also just use a library, 
// if anyone knows a good and easy to use one
/**
 * Simple immutable vector class
 */
class Vector {
    readonly x: number;
    readonly y: number;
    readonly z: number;

    constructor(x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    minus(otherVector: Vector) {
        return new Vector(
            this.x - otherVector.x,
            this.y - otherVector.y,
            this.z - otherVector.z
        );
    }

    norm() {
        return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z);
    }
}

export default Vector;