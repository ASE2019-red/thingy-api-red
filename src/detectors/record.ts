import { writeFileSync } from 'fs';
import MQTTTopicClient from '../mqtt/mqtt';
import { KSGravityDetector } from './ks-gravity-detector';
import { Recorder } from './recorder';

const topic = 'e8:e0:72:6b:92:a3/Thingy Motion Service/Thingy Gravity Characteristic';
const mqttClient = new MQTTTopicClient();
mqttClient.connect();

const transformer = (data: Buffer) => {
    const x = data.readFloatLE(0);
    const y = data.readFloatLE(4);
    const z = data.readFloatLE(8);
    return [x, y, z];
};

const recorder = new Recorder(topic, mqttClient, transformer);
const exitHandler = () => {
    const data = recorder.frames.map((v) => v.join(', ')).join('\n');
    writeFileSync('recording.csv', data);
    process.exit();
};

process.on('SIGINT', exitHandler.bind(null, {exit: true}));

console.log('Starting recorder...');
recorder.start();

// const detector = new KSGravityDetector(topic, () => console.log('Coffee made!'), mqttClient);
