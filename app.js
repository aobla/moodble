'use strict';

let bleCharacteristic = [];
var bluetoothDevice = null;
let turnedOn = false;

let pwrButtonColorOn = "#3366ff";//"#99ff99";//"#ffcc66 e6f2ff 0077e6";
let pwrButtonColorOff = "#b3daff";

function BleData() {
  this.temperature = 0;
  this.humidity = 0;
  this.battery_level = 0;
}

let bleData = new BleData(); // синтаксис "конструктор объекта"

var values = document.getElementById("values");
var tmpView = document.getElementById("tmp");
var hmdView = document.getElementById("hmd");
var batView = document.getElementById("bat");

function onConnected() {
	document.getElementById('power-button').classList.remove('hidden');
	document.getElementById('power-button').style.backgroundColor = pwrButtonColorOn;
	document.getElementById('connect-button').style.backgroundColor = pwrButtonColorOn;
	
	turnedOn = true;
	getBleDataAll();
}

function handleTemperature(temperature) {
	bleData.temperature = temperature;
	document.getElementById('tmp').innerHTML = temperature
  // console.log('Temperature recived: ' + temperature + ' C');
}

function handleHumidity(humidity) {
	bleData.humidity = humidity;
	document.getElementById('hmd').innerHTML = humidity
  // console.log('Humidity recived: ' + humidity + "%");
}

function handleBatteryLevel(batteryLevel) {
	bleData.battery_level = batteryLevel;
	document.getElementById('bat').innerHTML = batteryLevel + '%'
  // console.log('Battery level recived: ' + batteryLevel + "%");
}

function getBleDataAll()
{
	ble.getTemperature().then(handleTemperature);
	ble.getHumidity().then(handleHumidity);
	// ble.getBatteryLevel().then(handleBatteryLevel);
}

function updValuesButton()
{
	getBleDataAll()
}

function bleConnectButton() {
	if (ble.turnedOn) {
		ble.disconnect();
	} else {
		console.log('> Bluetooth Device' + ble.device);
		if (!ble.device) {
			ble.scan();
	 	}
	 	else{
			ble.reconnect();
		}
	}	
}
//Install service worker - for offline support
if ('serviceWorker' in navigator) {
	navigator.serviceWorker.register('serviceworker.js');
}