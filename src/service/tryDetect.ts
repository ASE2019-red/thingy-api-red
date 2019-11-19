import { loadConfig } from '../config';
import MQTTTopicClient from '../mqtt/client';
import { KSGravityDetector } from './ksGravityDetector';
import { FileDataRecorder } from './recorder/fileDataRecorder';
import { gravityTransformer } from './thingy';

const mqttClient = new MQTTTopicClient();
const config = loadConfig();
mqttClient.connect(config.mqtt);

console.log('Starting recorder...');

const detector = new KSGravityDetector(config.mqtt.macThingy1, mqttClient);
