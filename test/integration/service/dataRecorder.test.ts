import {InfluxDB} from 'influx';
import {loadConfig} from '../../../src/config';
import MQTTTopicClient from '../../../src/mqtt/client';
import {influxConn} from '../../../src/persistence/database';
import DataRecorder from '../../../src/service/recorder/dataRecorder';
import {InfluxDataRecorder} from '../../../src/service/recorder/influxDataRecorder';

const randomInt = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
};

const sleep = (milliseconds: number) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

const fakeTransformer = (data: Buffer) => {
    console.log('fake transform...');
    return [randomInt(0, 10), randomInt(0, 10), randomInt(0, 10)];
};

const config = loadConfig();
let measurement: string;
let influx: InfluxDB;
let mqtt: MQTTTopicClient;

beforeAll(async () => {
    // Initialize the database
    influx = await influxConn(config.flux);

    // Connect to MQTT broker
    mqtt = new MQTTTopicClient();
    await mqtt.connect(config.mqtt);
});

afterAll(async () => {
    await mqtt.disconnect();
});

beforeEach(async () => {
    measurement = 't_gravity';
    await influx.query(`DROP MEASUREMENT ${measurement}`);
});

test('Add measurements', async () => {
    const dataRecorder1: DataRecorder = new InfluxDataRecorder(mqtt, influx, 'fakeThingy');
    dataRecorder1.start(measurement, {}, fakeTransformer);

    // Send fake messages
    const publications = 3;
    for (let i = 0; i < publications; i++) {
        await mqtt.publish(dataRecorder1.topicDefinitions.gravity, 'fakeMessage');
    }

    await dataRecorder1.stop(measurement);
    await sleep(1000);

    const rows = await influx.query(`select * from ${measurement}`);
    expect(rows.length).toBe(publications);
});

test('Query measurements by tag', async () => {

    const tags1 = {machine: 'ff-adrianos'};
    const dataRecorder1: DataRecorder = new InfluxDataRecorder(mqtt, influx, 'fakeThingy1');
    dataRecorder1.start(measurement, tags1, fakeTransformer);

    const tags2 = {machine: 'another one'};
    const dataRecorder2: DataRecorder = new InfluxDataRecorder(mqtt, influx, 'fakeThingy2');
    dataRecorder2.start(measurement, tags2, fakeTransformer);

    // Send fake messages
    const publications = 3;
    for (let i = 0; i < publications; i++) {
        await mqtt.publish(dataRecorder1.topicDefinitions.gravity, 'foo');
        await mqtt.publish(dataRecorder2.topicDefinitions.gravity, 'bar');
    }

    await sleep(1000);

    const rows = await influx.query(`select * from ${measurement} where machine='${tags1.machine}'`);
    expect(rows.length).toBe(publications);
});
