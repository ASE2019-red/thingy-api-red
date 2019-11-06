import {loadConfig} from '../../src/config';
import MQTTTopicClient from '../../src/mqtt/client';
import CoffeeDetector from '../../src/service/coffeeDetector';

test('Coffee detector', async () => {
    // TODO
    // const mqttClient = new MQTTTopicClient();
    // mqttClient.connect(loadConfig().mqtt);
    // new CoffeeDetector(process.env.COFFEE_TOPIC, () => console.log('Coffee made!'), mqttClient);

    expect(true).toBe(true);
});
