import { View } from 'native-base';
import React, {FC, useCallback, useContext} from 'react';
import {
  FlatList,
  ListRenderItemInfo,
  Modal,
  SafeAreaView,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {Device} from 'react-native-ble-plx';
import { DarkModeContext } from '../DarkModeProvider/DarkModeProvider';

type DeviceModalListItemProps = {
  item: ListRenderItemInfo<Device>;
  connectToPeripheral: (device: Device) => void;
  closeModal: () => void;
};

type DeviceModalProps = {
  devices: Device[];
  visible: boolean;
  connectToPeripheral: (device: Device) => void;
  closeModal: () => void;
};

const DeviceModalListItem: FC<DeviceModalListItemProps> = props => {
  const {item, connectToPeripheral, closeModal} = props;

  const connectAndCloseModal = useCallback(() => {
    connectToPeripheral(item.item);
    closeModal();
  }, [closeModal, connectToPeripheral, item.item]);

  return (
    <TouchableOpacity
        onPress={connectAndCloseModal}
        style={modalStyle.ctaButton}
      >
        <Text style={modalStyle.ctaButtonText}>
          {item.item.name ? item.item.name : "N/A"}
        </Text>
      </TouchableOpacity>
  );
};

const DeviceModal: FC<DeviceModalProps> = props => {
  const {devices, visible, connectToPeripheral, closeModal} = props;
  const {theme} = useContext(DarkModeContext);

  const renderDeviceModalListItem = useCallback(
    (item: ListRenderItemInfo<Device>) => {
      if(item.item.isConnectable == false){
        return
      }
      return (
        <DeviceModalListItem
          item={item}
          connectToPeripheral={connectToPeripheral}
          closeModal={closeModal}
        />
      );
    },
    [closeModal, connectToPeripheral],
  );

  return (
    <Modal
      style={modalStyle.modalContainer}
      animationType="slide"
      transparent={false}
      visible={visible}>
      <View style={[modalStyle.modalTitle, {backgroundColor: theme.background}]}>
        <Text style={[modalStyle.modalTitleText, {color: theme.primaryText}]}>
          Tap on a device to connect
        </Text>
        {devices.length === 0 ? (
          <Text style={{color: theme.primaryText, fontSize: 20, textAlign: 'center', marginBottom: '140%', marginTop: 50}}>
            No available devices
          </Text>
        ) : (
          <FlatList
            contentContainerStyle={modalStyle.modalFlatlistContiner}
            data={devices}
            renderItem={renderDeviceModalListItem}
          />
        )}
        <TouchableOpacity onPress={closeModal}>
          <Text style={{color: theme.primaryText, fontSize: 20, fontWeight: "500", marginLeft: 'auto', marginRight: 'auto', marginBottom: 50}}>
            Close
          </Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const modalStyle = StyleSheet.create({
  modalContainer: {
    backgroundColor: 'black',
    flex: 1
  },
  modalFlatlistContiner: {
    paddingTop: 50, // Initial padding
    paddingBottom: 100, // Initial padding
  },
  modalCellOutline: {
    borderWidth: 1,
    borderColor: 'black',
    alignItems: 'center',
    marginHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 8,
  },
  modalTitle: {
    backgroundColor: 'white',
    flex: 1
  },
  modalTitleText: {
    marginTop: 30,
    fontSize: 30,
    fontWeight: 'bold',
    marginHorizontal: 20,
    textAlign: 'center',
  },
  ctaButton: {
    backgroundColor: 'deepskyblue',
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    marginHorizontal: 20,
    marginBottom: 5,
    borderRadius: 8,
  },
  ctaButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
});


export default DeviceModal;