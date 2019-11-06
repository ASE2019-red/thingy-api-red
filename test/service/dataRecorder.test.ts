import {InfluxDB} from 'influx';
import {loadConfig} from '../../src/config';
import MQTTTopicClient from '../../src/mqtt/client';
import {influxConn} from '../../src/persistence/database';
import DataRecorder from '../../src/service/recorder/dataRecorder';

const randomInt = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
};

const sleep = (milliseconds: number) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
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
    const dataRecorder1: DataRecorder = new DataRecorder(config.mqtt, mqtt, influx);
    dataRecorder1.start('faketopic1', measurement, {}, (message: Buffer) => {
        return {x: randomInt(0, 10), y: randomInt(0, 10), z: randomInt(0, 10)};
    });

    // Send fake messages
    const publications = 3;
    for (let i = 0; i < publications; i++) {
        await mqtt.publish('faketopic1', 'faked');
    }

    // FIXME: Wait for InfluxDB insertion
    await sleep(1000);

    const rows = await influx.query(`select * from ${measurement}`);
    rows.forEach((row) => {
        console.log(row);
    });

    expect(rows.length).toBe(publications);
});

test('Query measurements by tag', async () => {

    const tags1 = {machine: 'ff-adrianos'};
    const dataRecorder1: DataRecorder = new DataRecorder(config.mqtt, mqtt, influx);
    dataRecorder1.start('faketopic1', measurement, tags1, (message: Buffer) => {
        return {x: randomInt(0, 10), y: randomInt(0, 10), z: randomInt(0, 10)};
    });

    const tags2 = {machine: 'another one'};
    const dataRecorder2: DataRecorder = new DataRecorder(config.mqtt, mqtt, influx);
    dataRecorder2.start('faketopic2', measurement, tags2, (message: Buffer) => {
        return {x: randomInt(0, 10), y: randomInt(0, 10), z: randomInt(0, 10)};
    });

    // Send fake messages
    const publications = 3;
    for (let i = 0; i < publications; i++) {
        await mqtt.publish('faketopic1', 'faked');
        await mqtt.publish('faketopic2', 'faked');
    }

    // FIXME: Wait for InfluxDB insertion
    await sleep(1000);

    const rows = await influx.query(`select * from ${measurement} where machine='${tags1.machine}'`);
    rows.forEach((row) => {
        console.log(row);
    });
    expect(rows.length).toBe(publications);
});
