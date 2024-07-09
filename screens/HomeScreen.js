import React, {useState, useContext, useEffect} from 'react'
import { StyleSheet, Text, View, TouchableOpacity, StatusBar, Alert } from 'react-native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import SettingsScreen from './SettingsScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MyMealScreen from './MyMealScreen';
import ProfileScreen from './ProfileScreen';
import { DarkModeContext } from '../DarkModeProvider/DarkModeProvider';
import axios from 'axios';
import auth from '@react-native-firebase/auth';

const HomeScreen = () => {  
  const { userData, theme, saveDataToFirestore, iLoveUserData } = useContext(DarkModeContext);
  const Tab = createBottomTabNavigator();

  const apiKey = `${process.env.EXPO_PUBLIC_API_KEY}`; 
    
  useEffect(() => {   
    iLoveUserData()
    StatusBar.setBarStyle(userData?.darkMode ? 'light-content' : 'dark-content', true);
    StatusBar.setTranslucent(true);
    StatusBar.setBackgroundColor(userData?.darkMode ? 'black' : 'white');
    //console.log(userData)
    if (userData?.spoonacularData == undefined) {
      // Connect the user if the spoonacularData does not exist
      console.log('Trying to connect to spoon')
      connectUser(); 
    } 
    if(auth().currentUser.providerData[0].displayName != undefined){
      saveDataToFirestore('name', auth().currentUser.providerData[0].displayName)
    }
  }, []);
  let notConnecting = false;
  useEffect(() => {  
    //console.log(userData)
    if (userData?.spoonacularData == undefined && notConnecting) {
      // Connect the user if the spoonacularData does not exist
      //console.log('trying to connect to spoon')
      connectUser(); 
      notConnecting = true;
    } 
  }, [userData]);

  const connectUser = async () => {
    axios.post('https://api.spoonacular.com/users/connect', {}, {
      headers: {
        'X-Api-Key': apiKey,
      },
    })
    .then(response => {
      const { username, spoonacularPassword, hash } = response.data;
      // Save Spoonacular data to Firestore
      const spoonacularData = {
        username,
        spoonacularPassword,
        hash,
      };
      saveDataToFirestore('spoonacularData', spoonacularData);
    })
    .catch(error => {
      console.error(error);
    });
  };


  return (


    <Tab.Navigator
   
    screenOptions={({ route }) => ({  
      tabBarHideOnKeyboard: true,
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;
 
        if (route.name === 'MyMeal') {
          iconName = focused
            ? 'ios-home'
            : 'ios-home-outline';
        }
        else if(route.name === 'Profile'){
          iconName = focused ? 'ios-person' : 'person-outline';
        } 
        else if (route.name === 'Settings') {
          iconName = focused ? 'ios-settings' : 'settings-outline';
        }
        size = 25
        
        return <Ionicons name={iconName} size={size} color={color} />;
      },
      headerShown: false,
      tabBarLabelStyle: {
        fontSize: 13,

      },
      tabBarActiveTintColor: 'deepskyblue',
      tabBarInactiveTintColor: theme.primaryText,
      tabBarStyle: {
        height: 60,
        paddingHorizontal: 10,
        paddingTop: 0,
        backgroundColor: theme.background,
        position: 'absolute',
    },
    
    })}
  >
    
     <Tab.Screen name="MyMeal"  component={MyMealScreen} />
     <Tab.Screen name="Profile" component={ProfileScreen} />
     <Tab.Screen name="Settings" component={SettingsScreen} />
    
  </Tab.Navigator>

   
  )
}

export default HomeScreen
