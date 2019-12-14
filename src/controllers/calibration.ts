import { InfluxDB } from 'influx';
import { getManager } from 'typeorm';
import * as WebSocket from 'ws';
import DetectorManager from '../service/detector/manager';
import DataRecorder from '../service/recorder/dataRecorder';
import { gravityTransformerTagged } from '../service/thingy';
import { WebsocketWiring } from '../websocket';
import { Machine } from './../models/machine';
import { MQTTTopicClient } from './../mqtt/client';
import { InfluxDataRecorder } from './../service/recorder/influxDataRecorder';

export default class CalibrationController implements WebsocketWiring {

    // limit calibration duration to x seconds
    public static timeLimit = 30;

    private static get repository() {
        return getManager().getRepository(Machine);
    }

    constructor(private mqtt: MQTTTopicClient, private influx: InfluxDB, private detectors: DetectorManager) {}

    public addListeners(ws: WebSocket): void {

        let timeout: any;
        let recorder: DataRecorder;
        let machine: Machine;

        ws.addEventListener('message', async event => {
            const data = JSON.parse(event.data);
            if (!data['id']) {
                ws.close(1008, 'No machine specified.');
            }
            machine = await CalibrationController.repository.findOne(data['id']);
            if (machine) {
                recorder = this.startCalibration(machine);

                const answer = {calibrating: true, limit: CalibrationController.timeLimit};
                ws.send(JSON.stringify(answer));

                timeout = setTimeout(() => {
                    ws.close(1000, 'timeout');
                }, CalibrationController.timeLimit * 1000);

            } else {
                ws.close(1008, 'Machine does not exist.');
            }
        });

        ws.addEventListener('error', async event => {
            if (!!timeout) clearTimeout(timeout);
            this.stopCalibration(recorder, machine, false);
            console.error(`Could not calibrate: ${event.error}, ${event.message}`);
        });

        ws.addEventListener('close', event => {
            if (event.reason === 'timeout') {
                console.log('Max. calibration duration reached.');
                this.stopCalibration(recorder, machine);
            } else if (event.reason === 'user-cancel') {
                if (!!timeout) clearTimeout(timeout);
                this.stopCalibration(recorder, machine, false);
                console.log('User cancelled calibration');
            } else if (event.reason === 'finish') {
                if (!!timeout) clearTimeout(timeout);
                this.stopCalibration(recorder, machine, true);
            } else {
                console.error(`Calibration cancelled: ${event.code}, ${event.reason}`);
                if (!!timeout) clearTimeout(timeout);
                this.stopCalibration(recorder, machine, false);
            }
        });
    }

    private async stopCalibration(recorder: DataRecorder, machine: Machine, success = true) {
        if (!!recorder) recorder.stop();
        if (!!machine) {
            machine.calibrated = success;
            const savedMachine = await CalibrationController.repository.save(machine);
            // attach detectors for this machine
            this.detectors.createAll(savedMachine);
        }
    }
    private startCalibration(machine: Machine): DataRecorder {
        // detach detector for this machine
        this.detectors.removeAll(machine);
        const measurement = `reference-${machine.id}`;
        const tags = {metric: 'gravity'};
        const recorder = new InfluxDataRecorder(this.mqtt, this.influx, machine.sensorIdentifier,
            'gravity', gravityTransformerTagged, measurement, tags);
        recorder.start();
        return recorder;
    }

}
