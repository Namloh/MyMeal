import { StatusBar } from 'expo-status-bar';
import React, {useState, useEffect, useContext} from 'react'
import { StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import { DarkModeProvider } from './DarkModeProvider/DarkModeProvider';
import { NativeBaseProvider} from "native-base";


const Stack = createNativeStackNavigator();



export default function App() {



  return (

        <NativeBaseProvider >
            <NavigationContainer >
            <DarkModeProvider>
          <Stack.Navigator>
            <Stack.Screen options={{headerShown: false}}  name="Login" component={LoginScreen}/>
            <Stack.Screen options={{headerShown: false}} name="Home" component={HomeScreen}/>
          </Stack.Navigator>
          </DarkModeProvider>
        </NavigationContainer>
      </NativeBaseProvider>
   
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
