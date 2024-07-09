import { useState, useContext, useEffect } from 'react';
import { PermissionsAndroid, Platform, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';
import { collection, doc, setDoc, getDoc, serverTimestamp, addDoc, query, orderBy, getDocs  } from 'firebase/firestore';
import {db} from "../firebase"  
import {
  BleError,
  BleManager,
  Characteristic,
  Device,
} from 'react-native-ble-plx';
import { PERMISSIONS, requestMultiple } from 'react-native-permissions';
import DeviceInfo from 'react-native-device-info';
import { atob } from 'react-native-quick-base64';
import { DarkModeContext } from '../DarkModeProvider/DarkModeProvider';


let SMART_SCALE_UUID = '0000181b-0000-1000-8000-00805f9b34fb';
let SMART_SCALE_CHARACTERISTIC = '00002a9c-0000-1000-8000-00805f9b34fb';

const bleManager = new BleManager();
 
function useBLE() {
  const [allDevices, setAllDevices] = useState([]);
  const [connectedDevice, setConnectedDevice] = useState(null);
  const [scanComplete, setScanComplete] = useState(false); 
  const [weight, setWeight] = useState(0);
  const { saveDataToFirestore, userData } = useContext(DarkModeContext);
  const [characteristicSubscription, setCharacteristicSubscription] = useState(null);

  useEffect(() => {
    if (scanComplete) {
      if (characteristicSubscription) { 
        characteristicSubscription.remove();
        setCharacteristicSubscription(null);
      }
      Alert.alert("Weighing complete!", `You can now step off the scale. Your new weight is ${userData?.weghtSystem === "Imperial" ? `${weight} kg!` : `${(weight * 2.205).toFixed(2)} lbs!` }`, [{ text: "OK" }]);
    }
  }, [scanComplete]);

  const requestPermissions = async (cb) => {
    if (Platform.OS === 'android') {
      const apiLevel = await DeviceInfo.getApiLevel();

      if (apiLevel <  31) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'Bluetooth Low Energy requires Location',
            buttonNeutral: 'Ask Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        cb(granted === PermissionsAndroid.RESULTS.GRANTED);
      } else {
        const result = await requestMultiple([
          PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
          PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
          PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        ]);

        const isGranted =
          result['android.permission.BLUETOOTH_CONNECT'] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          result['android.permission.BLUETOOTH_SCAN'] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          result['android.permission.ACCESS_FINE_LOCATION'] ===
            PermissionsAndroid.RESULTS.GRANTED;

        cb(isGranted);
      }
    } else {
      cb(true);
    }
  };

  const addWeightEntry = async (userId, weight) => {
    try {
      const weightRef = collection(db, 'users', userId, 'weightEntries');
      const newEntry = {
        weight: weight,
        timestamp: serverTimestamp(), // Use serverTimestamp to get the server time
      };
      await addDoc(weightRef, newEntry);
      console.log('Weight entry added successfully.');
    
    } catch (error) {
      console.error('Error adding weight entry:', error);
    }
  };

  const isDuplicteDevice = (devices, nextDevice) =>
    devices.findIndex(device => nextDevice.id === device.id) > -1;

  const scanForPeripherals = () =>
    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.log(error);
      }
      if (device) {
        setAllDevices((prevState) => {
          if (!isDuplicteDevice(prevState, device)) {
            return [...prevState, device];
          }
          return prevState;
        });
      }
    });

    const discoverServicesAndCharacteristics = async (device) => {
        try {
            const services = await device.services();
            services.forEach(async (service) => {
                const characteristics = await service.characteristics();
            });
        } catch (error) {
            console.error('Failed to discover services and characteristics:', error);
        }
    };

  const connectToDevice = async (device) => {
    try {
      const deviceConnection = await bleManager.connectToDevice(device.id);
      setConnectedDevice(deviceConnection);
      await deviceConnection.discoverAllServicesAndCharacteristics();
      await discoverServicesAndCharacteristics(device)
      bleManager.stopDeviceScan();
      startStreamingData(deviceConnection);
    } catch (e) {
      console.log('FAILED TO CONNECT', e);
    }
  };

  const disconnectFromDevice = () => {
    if (connectedDevice) {
      bleManager.cancelDeviceConnection(connectedDevice.id);
      setConnectedDevice(null);
      setWeight(0);
    }
  };


  const onWeightUpdate = async (error, characteristic) => {
    if (error) {
      console.log("update err ",error);
      setConnectedDevice(null);
      setWeight(0);
      return -1;
    } else if (!characteristic?.value) {
      console.log('No Data was recieved');
      return -1;
    }

    let innerWeight = -1;

    function extractWeight(bytes) {
      // Combine the last two bytes to get the weight
      const weight = (bytes[bytes.length - 1] << 8) + bytes[bytes.length - 2];
      return weight / 200; // Convert to kilograms (assuming the weight is represented in 0.01 kg units)
    }

    let newSecondByte = 0
    let tenthByte = 0
    function parseBodyCompositionMeasurement(rawData) {
      // Convert base64 string to byte array
      const bytes = atob(rawData)
        .split('')
        .map(char => char.charCodeAt(0));
      console.log(bytes)
      newSecondByte = bytes[1]; // Get the second byte from the current update
      tenthByte = bytes[9];
      return extractWeight(bytes);
    }
  
    
    const rawDataa = characteristic.value;
    innerWeight = parseBodyCompositionMeasurement(rawDataa);
    setWeight(innerWeight);

    //console.log(innerWeight)
    //scale stopped changing
    setScanComplete(false)
    if (newSecondByte == '36' && tenthByte == '0') {
    
      saveDataToFirestore('weight', innerWeight);
      const userId = auth().currentUser.uid;
      await addWeightEntry(userId, innerWeight)
      setScanComplete(true)
    }


  };

  const startStreamingData = async (device) => {
    if (device) {
      const subscription = device.monitorCharacteristicForService(
        SMART_SCALE_UUID,
        SMART_SCALE_CHARACTERISTIC,
        (error, characteristic) => {
          onWeightUpdate(error, characteristic);
        }
      );
      setCharacteristicSubscription(subscription);
    } else {
      console.log('No Device Connected');
    }
  };

  return {
    scanForPeripherals,
    requestPermissions,
    connectToDevice,
    allDevices,
    connectedDevice,
    disconnectFromDevice,
    weight,

  };
}

export default useBLE;
