export type TransformerFn = (data: Buffer) => any;

export const gravityTransformer: TransformerFn = (data: Buffer) => {
    const x = data.readFloatLE(0);
    const y = data.readFloatLE(4);
    const z = data.readFloatLE(8);
    return [x, y, z];
};
