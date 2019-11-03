import {InfluxDB} from 'influx';
import MQTTTopicClient from '../mqtt/client';

class DataRecorder {
    public static topicDefinitions: any = {};
    private mqttClient: MQTTTopicClient;
    private influxClient: InfluxDB;

    constructor(config: any, mqttClient: MQTTTopicClient, influxClient: InfluxDB) {
        this.mqttClient = mqttClient;
        this.influxClient = influxClient;

        // TODO: later we should store a list of all available sensors and their topics in the db
        DataRecorder.topicDefinitions = {
            thingy1: {
                connected: `${config.macThingy1}/Connected`,
                gravity: `${config.macThingy1}/Thingy Motion Service/Thingy Gravity Characteristic`,
                acceleration: `${config.macThingy1}/Thingy Motion Service/Thingy Acceleration Characteristic`,
                sound: `${config.macThingy1}/Thingy Sound Service/Thingy Microphone Characteristic`,
            },
            thingy2: {
                connected: `${config.macThingy2}/Connected`,
                gravity: `${config.macThingy2}/Thingy Motion Service/Thingy Gravity Characteristic`,
                acceleration: `${config.macThingy2}/Thingy Motion Service/Thingy Acceleration Characteristic`,
                sound: `${config.macThingy2}/Thingy Sound Service/Thingy Microphone Characteristic`,
            },
            thingy3: {
                connected: `${config.macThingy3}/Connected`,
                gravity: `${config.macThingy3}/Thingy Motion Service/Thingy Gravity Characteristic`,
                acceleration: `${config.macThingy3}/Thingy Motion Service/Thingy Acceleration Characteristic`,
                sound: `${config.macThingy3}/Thingy Sound Service/Thingy Microphone Characteristic`,
            },
        };
    }

    public start(topic: string, measurement: string, tags: any = {}, fields: any = {}) {

        this.mqttClient.onTopicMessage(topic, async () => {
            try {
                await this.influxClient.writePoints([{measurement, tags, fields}]);
            } catch (e) {
                console.error('Cannot write to InfluxDB');
            }
        });
    }
}

export default DataRecorder;
