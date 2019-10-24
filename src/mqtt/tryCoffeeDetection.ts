import MQTTTopicClient from "./mqtt";
import CoffeeDetector from "./coffeDetector";
import * as Koa from 'koa';

const mqttClient = new MQTTTopicClient

mqttClient.connect();
//mqtt_conn();

const coffeeDetector = new CoffeeDetector("d1:d5:9f:34:cf:93/Thingy Motion Service/Thingy Motion Raw data", 
                                          () => console.log("Coffee made!"), mqttClient)
console.log("started");