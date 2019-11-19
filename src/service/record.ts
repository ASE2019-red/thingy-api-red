import { loadConfig } from '../config';
import MQTTTopicClient from '../mqtt/client';
import { FileDataRecorder } from './recorder/fileDataRecorder';
import { gravityTransformer } from './thingy';

const mqttClient = new MQTTTopicClient();
const config = loadConfig();
mqttClient.connect(config.mqtt);

const recorder = new FileDataRecorder(mqttClient, config.mqtt.macThingy1, 'recording.csv');
const exitHandler = () => {
    recorder.stop('gravity');
    process.exit();
};

process.on('SIGINT', exitHandler.bind(null, {exit: true}));

console.log('Starting recorder...');
recorder.start('gravity', {}, gravityTransformer);

// const detector = new KSGravityDetector(topic, () => console.log('Coffee made!'), mqttClient);
