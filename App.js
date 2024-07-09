import React, {useState, useEffect, useContext} from 'react'
import { StyleSheet, View, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import RegisterScreen from './screens/RegisterScreen';
import { DarkModeProvider } from './DarkModeProvider/DarkModeProvider';
import { NativeBaseProvider} from "native-base";
import WelcomeScreen from './screens/WelcomeScreen';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import WeightEntriesScreen from './screens/WeightEntriesScreen';
import ResetPasswordScreen from './screens/PasswordResetScreen';
import WeightInputScreen from './screens/WeightInputScreen';
import HeightInputScreen from './screens/HeightInputScreen';
import ActivityInputScreen from './screens/ActivityInputScreen';
import MealDetailScreen from './screens/MealDetailScreen';
import AgeAndGenderScreen from './screens/AgeAndGenderScreen';

GoogleSignin.configure({
  webClientId: `${process.env.EXPO_PUBLIC_WEB_CLIENT_ID}`
});

const Stack = createNativeStackNavigator();

export default function App() {

  return (

        <NativeBaseProvider >
            <NavigationContainer >
            <DarkModeProvider>
            <Stack.Navigator>

                  <Stack.Screen options={{ headerShown: false }} name="Login" component={LoginScreen} />
                  <Stack.Screen options={{ headerShown: false }} name="Register" component={RegisterScreen} />
                  <Stack.Screen options={{ headerShown: false }} name="ResetPassword" component={ResetPasswordScreen} />

                  <Stack.Screen options={{ headerShown: false }} name="Home" component={HomeScreen} />
                  <Stack.Screen options={{ headerShown: false }} name="Welcome" component={WelcomeScreen} />
                  <Stack.Screen options={{ headerShown: false }} name="AgeAndGenderScreen" component={AgeAndGenderScreen}/>
                  <Stack.Screen options={{ headerShown: false }} name="WeightInputScreen" component={WeightInputScreen}/>
                  <Stack.Screen options={{ headerShown: false }} name="HeightInputScreen" component={HeightInputScreen}/>
                  <Stack.Screen options={{ headerShown: false }} name="ActivityInputScreen" component={ActivityInputScreen}/>

                  <Stack.Screen options={{ headerShown: false }} name="WeightEntriesScreen" component={WeightEntriesScreen} />
                  <Stack.Screen options={{ headerShown: true, headerTitle: 'Meal Detail'}} name="MealDetail" component={MealDetailScreen} />

            </Stack.Navigator>
          </DarkModeProvider>
        </NavigationContainer>
      </NativeBaseProvider>
   
  );
}

