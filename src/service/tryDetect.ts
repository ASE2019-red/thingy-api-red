import { loadConfig } from '../config';
import MQTTTopicClient from '../mqtt/client';
import { VarianceGravityDetector } from './varianceDetector';

const mqttClient = new MQTTTopicClient();
const config = loadConfig();
mqttClient.connect(config.mqtt);

console.log('Starting detector...');

const detector = new VarianceGravityDetector(config.mqtt.macThingy1, mqttClient);
