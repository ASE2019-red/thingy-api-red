import { loadConfig } from '../config';
import MQTTTopicClient from '../mqtt/client';
import { FileDataRecorder } from '../service/recorder/fileDataRecorder';
import { gravityTransformer } from '../service/thingy';

const mqttClient = new MQTTTopicClient();
const config = loadConfig();
mqttClient.connect(config.mqtt);

const recorder = new FileDataRecorder(mqttClient, config.mqtt.macThingy1, 'gravity', 'recording.csv');
const exitHandler = () => {
    recorder.stop('gravity');
    process.exit();
};

process.on('SIGINT', exitHandler.bind(null, {exit: true}));

console.log('Starting recorder...');
recorder.start('gravity', {}, gravityTransformer);
