import {InfluxDB} from 'influx';
import {loadConfig} from '../../src/config';
import MQTTTopicClient from '../../src/mqtt/client';
import {influxConn} from '../../src/persistence/database';
import DataRecorder from '../../src/service/dataRecorder';

test('Add measurements', async () => {
    const config = loadConfig();

    // Initialize the database
    const measurement = 't_gravity';
    const influx: InfluxDB = await influxConn(config.flux);

    await influx.query(`DROP MEASUREMENT ${measurement}`);

    // Connect to MQTT broker
    const mqtt = new MQTTTopicClient();
    await mqtt.connect(config.mqtt);

    // Setup recorder
    const dataRecorder: DataRecorder = new DataRecorder(config.mqtt, mqtt, influx);
    const tags = {machine: 'ff-adrianos'};

    dataRecorder.start(DataRecorder.topicDefinitions.thingy1.gravity, measurement, tags,
        (message: Buffer) => {
            return {x: randomInt(0, 10), y: randomInt(0, 10), z: randomInt(0, 10)};
        });

    // Send fake messages
    for (let i = 0; i < 10; i++) {
        await mqtt.publish(DataRecorder.topicDefinitions.thingy1.gravity, 'faked');
    }

    const rows = await influx.query(`select * from ${measurement}`);
    rows.forEach((row) => {
        console.log(row);
    });

    expect(true).toBe(true);
});

function randomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
