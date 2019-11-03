import {loadConfig} from '../../src/config';
import MQTTTopicClient from '../../src/mqtt/client';
import CoffeeDetector from '../../src/mqtt/coffeDetector';

/**
 * Script to test out the coffee detection. Usage:
 * COFFEE_TOPIC="<full Raw motion data characteristic topic name, including device>" \
 *      npx ts-node ./test/mqtt/tryCoffeeDetection.ts
 */
const mqttClient = new MQTTTopicClient();

mqttClient.connect(loadConfig().mqtt);

new CoffeeDetector(process.env.COFFEE_TOPIC,
    () => console.log('Coffee made!'), mqttClient);
