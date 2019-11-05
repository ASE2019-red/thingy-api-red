import { loadConfig } from '../config';
import CoffeeDetector from './coffeDetector';
import MQTTTopicClient from './mqtt';

/**
 * Script to test out the coffee detection. Usage:
 * COFFEE_TOPIC="<full Raw motion data characteristic topic name, including device>" \
 *      yarn ts-node ./src/mqtt/tryCoffeeDetection.ts
 */
const mqttClient = new MQTTTopicClient();

mqttClient.connect(loadConfig().mqtt);

new CoffeeDetector(process.env.COFFEE_TOPIC,
                    () => console.log('Coffee made!'), mqttClient);
