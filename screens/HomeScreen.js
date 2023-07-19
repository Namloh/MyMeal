import { StyleSheet, Text, TouchableOpacity, View, Appearance } from 'react-native'
import React, {useState, useContext} from 'react'
import { auth } from '../firebase'
import { useNavigation } from '@react-navigation/native'
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import SettingsScreen from './SettingsScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MyMealScreen from './MyMealScreen';
import ProfileScreen from './ProfileScreen';
import { DarkModeContext } from '../DarkModeProvider/DarkModeProvider';

const HomeScreen = () => {
  const { theme } = useContext(DarkModeContext);
  const Tab = createBottomTabNavigator();
console.log(theme)

  return (


    <Tab.Navigator
    screenOptions={({ route }) => ({     
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
      headerStyle: {
        backgroundColor: theme.background, 
        
      },
      headerTintColor: theme.primaryText, 
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

const styles = StyleSheet.create({

    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    button: {
      backgroundColor: "deepskyblue",
      width: "60%",
      padding: 15,
      borderRadius: 10,
      alignItems: 'center',
    },
    buttonText: {
      color: 'white',
      fontWeight: 700,
      fontSize: 16,
    },


})