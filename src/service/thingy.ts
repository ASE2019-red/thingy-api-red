export type TransformerFn = (data: Buffer) => any;
export interface TopicDefinitions {
    connected: string;
    gravity: string;
    acceleration: string;
    sound: string;
}

export const topicDefinitionsForDevice = (mac: string): TopicDefinitions => {
    return {
        connected: `${mac}/Connected`,
        gravity: `${mac}/Thingy Motion Service/Thingy Gravity Characteristic`,
        acceleration: `${mac}/Thingy Motion Service/Thingy Acceleration Characteristic`,
        sound: `${mac}/Thingy Sound Service/Thingy Microphone Characteristic`,
    };
};

export const gravityTransformer: TransformerFn = (data: Buffer) => {
    const x = data.readFloatLE(0);
    const y = data.readFloatLE(4);
    const z = data.readFloatLE(8);
    return [x, y, z];
};

export const gravityTransformerTagged: TransformerFn = (data: Buffer) => {
    const parsed = gravityTransformer(data);
    return {x: parsed[0], y: parsed[1], z: parsed[2]};
};
