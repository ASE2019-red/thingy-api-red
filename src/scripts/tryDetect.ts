import { loadConfig } from '../config';
import MQTTTopicClient from '../mqtt/client';
import { FileVarianceGravityDetector } from './../service/detector/fileVarianceDetector';

const mqttClient = new MQTTTopicClient();
const config = loadConfig();
mqttClient.connect(config.mqtt);

const onDetect = (machineId: string) => {
    console.log('coffee produced');
};

console.log('Starting detector...');

const detector = new FileVarianceGravityDetector('1234', config.mqtt.macThingy1, mqttClient, onDetect);
