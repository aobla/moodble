'use strict';

let bleCharacteristic = [];
var bluetoothDevice = null;
let turnedOn = false;

let pwrButtonColorOn = "#3366ff";//"#99ff99";//"#ffcc66 e6f2ff 0077e6 3366ff";
let pwrButtonColorOff = "#33334d"; //ff7b59

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
	ble.getTemperature().then(handleTemperature)
	.then(ble.getHumidity().then(handleHumidity))
	
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

//thanks to:
//https://github.com/gdgfresno/candle-bluetooth/blob/3624c6bc717b43d8785857c13631c3f3f1a59d2b/after/ble.js

(function() {
  'use strict';

  let encoder = new TextEncoder('utf-8');
  let decoder = new TextDecoder('utf-8');

  const BLE_UUID_MOODBLE_SERVICE = 'battery_service'; // find some service
	const BLE_UUID_DEVICE_NAME_SERVICE= 'generic_access';
  const BLE_UUID_DEVICE_NAME_CHAR = 'gap.device_name';
  const BLE_UUID_ENVIRONMENTAL_SERVICE = 'environmental_sensing'
  const BLE_UUID_TEMPERATURE_CHAR = 'temperature'
  const BLE_UUID_HUMIDTY_CHAR = 'humidity'

  class ble {
    constructor() {
      this.device = null;
      this.turnedOn = false;
    }
    scan() {
			this.device = null;
			console.log('Requesting Bluetooth Device...');
      let options = {filters:[{services:[ BLE_UUID_MOODBLE_SERVICE ]}],
                     optionalServices: ['environmental_sensing']};			
			navigator.bluetooth.requestDevice(options)
			.then(device => {
				this.device = device;
				this.device.addEventListener('gattserverdisconnected', this.onDisconnected);
			// return connect();
			return this.connect();
			})
			.catch(error => {
			console.log('Argh! ' + error);
			});    	
    }
		connect() {
			console.log('Connecting to Bluetooth Device...');
			return this.device.gatt.connect()
			.then(server => {
				console.log('> Bluetooth Device connected');
				this.turnedOn = true;
				onConnected();
			})
			.catch(error => {
			console.log('Argh! ' + error);
			});   			
		}    
    disconnect() {
			if (!this.device) {
		    	return;
		 	}
			console.log('Disconnecting from Bluetooth Device...');
			if (this.device.gatt.connected) {
				this.device.gatt.disconnect();
				this.turnedOn = false;
				console.log('> Bluetooth Device is disconnected' + this.device);
				// document.getElementById('power-button').style.backgroundColor = pwrButtonColorOff;
				// document.querySelector('.on-off-icon').style.color = "black"; 
				document.getElementById('power-button').classList.add('hidden');
				document.getElementById('connect-button').style.backgroundColor = pwrButtonColorOff;   
		 	} else {
				console.log('> Bluetooth Device is already disconnected');
		 	}
    }
    reconnect() {
		  if (!this.device) {
		    return;
		  }
		  if (this.device.gatt.connected) {
		    console.log('> Bluetooth Device is already connected');
		    return;
		  }
		  this.connect()
		  .catch(error => {
		    console.log('Argh! ' + error);
		  });
    }
		onDisconnected(event) {
		  // Object event.target is Bluetooth Device getting disconnected.
		  console.log('> Bluetooth Device disconnected');
		}

    getDeviceName() {
      return this.device.gatt.getPrimaryService(BLE_UUID_DEVICE_NAME_SERVICE) // TODO
      .then(service => service.getCharacteristic(BLE_UUID_DEVICE_NAME_CHAR))
      .then(characteristic => characteristic.readValue())
      .then(data => {
        let decoder = new TextDecoder('utf-8');
        return decoder.decode(data);
      });
    }
    setDeviceName(name) {
      return this.device.gatt.getPrimaryService(BLE_UUID_DEVICE_NAME_SERVICE)	// TODO
      .then(service => service.getCharacteristic(BLE_UUID_DEVICE_NAME_CHAR))
      .then(characteristic => {
        let encoder = new TextEncoder('utf-8');
        return characteristic.writeValue(encoder.encode(name));
      });
    }
    getBatteryLevel() {
      return this.device.gatt.getPrimaryService('battery_service')
      .then(service => service.getCharacteristic('battery_level'))
      .then(characteristic => characteristic.readValue())
      .then(data => data.getUint8(0));
    }
     getTemperature() {
      return this.device.gatt.getPrimaryService(BLE_UUID_ENVIRONMENTAL_SERVICE)
      .then(service => service.getCharacteristic(BLE_UUID_TEMPERATURE_CHAR))
      .then(characteristic => characteristic.readValue())
      .then(data => data.getUint16(0, true) / 100);
    }
     getHumidity() {
      return this.device.gatt.getPrimaryService(BLE_UUID_ENVIRONMENTAL_SERVICE)
      .then(service => service.getCharacteristic(BLE_UUID_HUMIDTY_CHAR))
      .then(characteristic => characteristic.readValue())
      .then(data => data.getUint16(0, true) / 100);
    }
  }

  window.ble = new ble();

})();