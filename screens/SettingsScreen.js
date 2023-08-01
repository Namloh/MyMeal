import { StyleSheet, Text, View, TouchableOpacity, StatusBar, Alert } from 'react-native'
import React, {useState, useEffect, useContext, useRef} from 'react'
import { db } from '../firebase'
import { useNavigation } from '@react-navigation/native' 
import { onAuthStateChanged } from "firebase/auth";
import { collection, doc, getDoc, deleteDoc  } from 'firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';
import { DarkModeContext } from '../DarkModeProvider/DarkModeProvider';

import auth from '@react-native-firebase/auth';
import { ButtonGroup, Switch  } from '@rneui/themed';


const SettingsScreen = () => {

  const { darkMode, toggleDarkMode, theme, fetchUserData, saveDataToFirestore, userData } = useContext(DarkModeContext);
  const [weightSystem, setWeightSystem] = useState('Metric');
  const [selectedIndex, setSelectedIndex] = useState(userData?.weightSystem === 'Metric' ? 0 : 1);  

  const navigation = useNavigation()
  const statusBarHeight = StatusBar.currentHeight || 0;

  const handleSignOut = () => {
    StatusBar.setBarStyle('dark-content'); 
    StatusBar.setBackgroundColor('transparent');
      auth().signOut()
          .then(() => {
          navigation.replace("Login");
          console.log("Signed out");
          })
          .catch(error => alert(error.message));
      };
    onAuthStateChanged(auth(), (user) => {
    if (user) {
        const uid = user.uid;
    } else {
        // User is signed out
  }
  });
  async function deleteAccount() {
    
    Alert.alert(
      "This action will delete all your data and cannot be undone!",
      "Do you wish to continue?",
      [
        {
          text: "Yes",
          onPress: () => {
            const uid = auth().currentUser.uid;
            auth()
              .currentUser.delete()
              .then(() => {
                deleteDoc(doc(db, "users", uid));
              })
              .catch((error) => {
                console.log(error, "error");
              })
              .finally(() => {
                navigation.replace("Login");
                console.log("Account terminated");
              });
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
  }, [selectedIndex]);  

  const toggleWeightSystem = async () => { 
    try {   
        if(selectedIndex === 0){
          setWeightSystem("Imperial");
        }
        else{
          setWeightSystem("Metric");
        } 
 
      

        await saveDataToFirestore('weightSystem', weightSystem);
        fetchUserData();
      } catch (error) {
        console.error('Error toggling weight system:', error);
      }  
  }; 
 
  useFocusEffect(
    React.useCallback(() => {
      fetchUserData()
    }, [])
    ); 
    
  return (
    <View style={[styles.wrap, {backgroundColor: theme.background, paddingTop: statusBarHeight}]}>
     <Text style={[styles.header, {color: theme.primaryText }]}>My Account</Text>

        <View style={styles.container}>
        
            <Text style={[styles.emailText, {color: theme.primaryText }]}>Name: {userData?.name}</Text>
            <Text style={[styles.emailText, {color: theme.primaryText }]}>Weight: {userData?.weightSystem === 'Imperial' ? `${(userData?.weight * 2.205).toFixed(2)} lbs` : `${userData?.weight} Kg`}</Text>
            <Text style={[styles.emailText, {color: theme.primaryText }]}>Email: {auth().currentUser?.email}</Text>
     
         

            <View style={styles.switchContainer}>
            <Text style={[styles.emailText, {color: theme.primaryText }]}>
              {darkMode ? 'Light Mode' : 'Dark Mode'}   
            </Text>
            <Switch style={{marginLeft: "auto", marginTop: 5}} color={"deepskyblue"} value={darkMode}  onValueChange={() => toggleDarkMode()} />
          </View> 
 

            <ButtonGroup
              buttons={['Metric System', 'Imperial System (US)']}
              selectedIndex={selectedIndex}
              onPress={(value) => {
                setSelectedIndex(value)
              }} 
              containerStyle={{ maxWidth: '100%', marginLeft: 'auto', marginRight: 30, backgroundColor: theme.background, borderColor: theme.primaryText }}
              textStyle={{ color: theme.primaryText, fontWeight: '700', fontSize: 15 }}
              selectedButtonStyle={{backgroundColor: 'deepskyblue'}}
            />
          </View>
   

            <TouchableOpacity
                onPress={handleSignOut}
                style={styles.button}
                >
                <Text  style={[styles.buttonText, {color: theme.btnText }]}>Sign Out</Text>
            </TouchableOpacity>
            <TouchableOpacity
                onPress={deleteAccount}
                style={styles.buttonDel}
                >
                <Text  style={[styles.buttonText, {color: theme.btnText }]}>Terminate Account</Text>
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
        marginLeft: 30,
        marginTop: 30,
        maxHeight: "65%",
    },
    emailText: {
        fontSize: 20,
        marginBottom: 5
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
        width: "90%",
        flexDirection: 'row',
        alignItems: 'center',
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