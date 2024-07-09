import { StyleSheet, Text, View, TouchableOpacity, StatusBar, Alert } from 'react-native'
import React, {useState, useEffect, useContext, useRef} from 'react'
import { db } from '../firebase'
import { useNavigation } from '@react-navigation/native' 
import { onAuthStateChanged} from "firebase/auth";
import { collection, doc, setDoc, getDoc, serverTimestamp, addDoc, query, deleteDoc, getDocs  } from 'firebase/firestore';
import { DarkModeContext } from '../DarkModeProvider/DarkModeProvider';
import auth from '@react-native-firebase/auth';
import { ButtonGroup, Switch, Button } from '@rneui/themed';
import useBLE from '../Components/useBle';
import DeviceModal from '../Components/DeviceModal';


const SettingsScreen = () => {

  const {
    requestPermissions,
    scanForPeripherals,
    allDevices,
    connectToDevice,
    connectedDevice,
    weight,
    disconnectFromDevice,
    scanComplete
  } = useBLE();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const scanForDevices = () => {
    requestPermissions(isGranted => {
      if (isGranted) {
        scanForPeripherals();
      }
    });
  };

  const hideModal = () => {
    setIsModalVisible(false);
  };

  const openModal = async () => {
    scanForDevices();
    setIsModalVisible(true);
  };

  const { darkMode, toggleDarkMode, theme, saveDataToFirestore, userData } = useContext(DarkModeContext);
  const [selectedIndex, setSelectedIndex] = useState(userData?.weightSystem === undefined ? 0 : userData?.weightSystem === "Metric" ? 0 : 1);
  const [accountAge, setAccountAge] = useState(null);
 
 
  const navigation = useNavigation()
  const statusBarHeight = StatusBar.currentHeight || 0;

  const handleSignOut = (possTer) => {
    StatusBar.setBarStyle('dark-content'); 
    StatusBar.setBackgroundColor('transparent');
    if(possTer === 'termination'){
      navigation.replace("Login", { possTer });
      console.log("Terminated");
    }
    else{
      Alert.alert(
        "Sign Out",
        "Are you sure you want to sign out?",
        [
          {
            text: "YES",
            onPress: () => {
            auth().signOut()
            .then(() => {
              navigation.replace("Login", { possTer });
              console.log("Signed out");
            })
            .catch(error => alert(error.message));
            }
          },
          {
            text: "CANCEL",
            style: "cancel"
          }
        ]
      );
    }
  
  };
  
  const deleteWeightEntries = async (userId) => {
    try {
        const weightEntriesRef = collection(db, 'users', userId, 'weightEntries');
        const querySnapshot = await getDocs(weightEntriesRef);
        
        querySnapshot.forEach(async (doc) => {
            await deleteDoc(doc.ref);
        });
        
        const mealPlansRef = collection(db, 'users', userId, 'mealPlans');
        const querySnapshott = await getDocs(mealPlansRef);
        
        querySnapshott.forEach(async (doc) => {
            await deleteDoc(doc.ref);
        });

    } catch (error) {
        console.error('Error deleting weight entries:', error);
    }
  };
  async function deleteAccount() {
    Alert.alert(
      "This action will delete all your data and cannot be undone!",
      "Do you wish to continue?",
      [  
        {
          text: "Yes",
          onPress: async ()  => {
            const uid = auth().currentUser.uid
            
            try {
              await auth().currentUser.delete();
              // Delete user document and weight entries
              await deleteDoc(doc(db, "users", uid));
              await deleteWeightEntries(uid)
            
              // Navigate to login screen after successful deletion
              handleSignOut("termination");
              console.log("Account terminated");
            } catch (error) {
              console.log(error, "error");
              if (error.code === 'auth/requires-recent-login') {
                // Handle error if user's last sign-in time does not meet security threshold
                // Prompt the user to sign in again
                Alert.alert(
                  'Session expired',
                  'Please sign in and terminate again to complete this action.',
                  [  {
                    text: 'OK',
                    onPress: () => {
                        handleSignOut('relog');
                    },
                },{
                  text: "Cancel",   
                  onPress: () => {}, 
                  style: "cancel", 
                },],  { cancelable: true }
                );
              }
              else {
                console.log(error, "error");
                Alert.alert(
                  'An error has occured tryng to terminate your account.',
                  error.message,
                  [  {
                    text: 'OK',
                },{
                  text: "Cancel",   
                  onPress: () => {}, 
                  style: "cancel", 
                },],  { cancelable: true }
                );
              }
            }         
          },
        },
        {
          text: "Cancel",   
          onPress: () => {}, 
          style: "cancel", 
        },
      ],
      { cancelable: true }
    );

  }
   

  useEffect(() => {
    toggleWeightSystem()
    const creationTimestamp = auth().currentUser.metadata.creationTime;
    if (creationTimestamp) {
      const creationDate = new Date(creationTimestamp);
      const currentDate = new Date();
      const ageInDays = Math.floor((currentDate - creationDate) / (24 * 60 * 60 * 1000));

      setAccountAge(ageInDays);
    }
  }, [selectedIndex]);   

  const toggleWeightSystem = async () => { 
    try {   
        if(selectedIndex === 1){
          saveDataToFirestore('weightSystem', "Imperial");
        }
        else{
          saveDataToFirestore('weightSystem', "Metric");
        } 

        
      } catch (error) {
        console.error('Error toggling weight system:', error);
      }  
  }; 

  return (
    <View style={[styles.wrap, {backgroundColor: theme.background, paddingTop: statusBarHeight}]}>
     <Text style={[styles.header, {color: theme.primaryText }]}>My Account</Text>

        <View style={styles.container}>
      
    
            <Text style={[styles.emailText, {color: theme.primaryText }]}>Email: {auth().currentUser?.email}</Text>
            <Text style={[styles.emailText, { color: theme.primaryText, marginBottom: 0 }]}>Account Age: {accountAge} days</Text>
         

            <View style={styles.switchContainer}>
           
            <Text style={[styles.emailText, {color: theme.primaryText, marginTop: 10 }]}>
              {'Dark Mode'}   
            </Text>
            <Switch
                style={{ marginLeft: 'auto', marginRight: 10, marginTop: 5, transform: [{ scaleX: 1.5 }, { scaleY: 1.5 }] }}
                trackColor={{ false: '#767577', true: 'deepskyblue' }}
                thumbColor={darkMode ? 'white' : 'white'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={toggleDarkMode}
                value={darkMode}
              />
            </View>
 
            <ButtonGroup
              buttons={['Metric System', 'Imperial System (US)']}
              selectedIndex={selectedIndex}
              onPress={(value) => {
                setSelectedIndex(value)
              }} 
              containerStyle={{ minWidth: '100%', marginLeft: 'auto', marginRight: 30, marginTop: 10, backgroundColor: theme.background, borderColor: theme.primaryText }}
              textStyle={{ color: theme.primaryText, fontWeight: '700', fontSize: 15 }}
              selectedButtonStyle={{backgroundColor: 'deepskyblue'}}
            />

            <View style={{marginTop: 40, marginLeft: 'auto', marginRight: 'auto'}}>
          {connectedDevice ? ( 
             <View style={{ alignItems: 'center', justifyContent: 'center' }}>
             <Text style={{ color: theme.primaryText, fontSize: 20 }}>Your Current Weight Is:</Text>
             <Text style={{ color: theme.primaryText, fontSize: 40 }}>
               {userData?.weightSystem === 'Metric' ? `${weight}` : `${(weight * 2.205).toFixed(2)}`}
             </Text>
             <Text style={{ color: theme.primaryText, fontSize: 20 }}>
               {userData?.weightSystem === 'Metric' ? `kg` : `lbs`}
             </Text>
           </View>
           
            ) : (
              <Text style={{color: theme.primaryText, fontSize: 20}}>
                Measure Weight from a Smart Scale
              </Text>
            )}
            </View>
            <TouchableOpacity
              onPress={connectedDevice ? disconnectFromDevice : openModal}
              style={[styles.button, {width: 120, marginTop: 10}]}>
              <Text style={[styles.buttonText, {color: 'white' }]}>
                {connectedDevice ? 'Disconnect' : 'Connect'}
              </Text>
            </TouchableOpacity>
            {scanComplete ? (
              <>
              <Text>Scan Completed!</Text>
              <Text>Weight!</Text>
              </>
            ) : ( <></>)}

            <DeviceModal
              closeModal={hideModal}
              visible={isModalVisible}
              connectToPeripheral={connectToDevice}
              devices={allDevices}
            />

        </View>
      

            <TouchableOpacity
                onPress={() => handleSignOut("signout")}
                style={styles.button}
                >
                <Text  style={[styles.buttonText, {color: 'white' }]}>Sign Out</Text>
            </TouchableOpacity>
            <TouchableOpacity
                onPress={deleteAccount}
                style={styles.buttonDel}
                >
                <Text  style={[styles.buttonText, {color: 'white'  }]}>Terminate Account</Text>
            </TouchableOpacity>
    </View>
  )
}

export default SettingsScreen


const styles = StyleSheet.create({
    wrap:{
      minHeight: "100%",
    },
    container:{
        flex: 1,
        justifyContent: "flex-start",
        marginLeft: 15,
        marginRight: 15,
        marginTop: 15,
        maxHeight: "65%",
    },
    emailText: {
        fontSize: 20,
        marginBottom: 10
      },
      button: {
        backgroundColor: "deepskyblue",
        width: "60%",
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginLeft: 'auto',
        marginRight: 'auto',
      },
      buttonText: {
        color: 'white',
        fontWeight: 700,
        fontSize: 16,
      },
      header:{
        fontWeight: 700,
        fontSize: 30,
        marginLeft: 10,
        marginTop: 10,
      },
      switchContainer:{
        width: "100%",
        flexDirection: 'row',
        alignItems: 'start',
      },
      buttonDel:{
        backgroundColor: "red",
        width: "60%",
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginLeft: 'auto',
        marginRight: 'auto',
        marginTop: 10
      },
      cancel:{
        color: 'red'
      }
      
})