import React, {useState, useEffect, useContext} from 'react'
import { StyleSheet, View, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import RegisterScreen from './screens/RegisterScreen';
import { DarkModeProvider } from './DarkModeProvider/DarkModeProvider';
import { NativeBaseProvider} from "native-base";
import { auth } from './firebase';
import WelcomeScreen from './screens/WelcomeScreen';

const Stack = createNativeStackNavigator();


export default function App() {

  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // User is logged in
        setUser(user);
      } else {
        // No user logged in
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);


  return (

        <NativeBaseProvider >
            <NavigationContainer >
            <DarkModeProvider>
          <Stack.Navigator>
            {user ? (
              // User is logged in, show HomeScreen and WelcomeScreen
              <>
               <Stack.Screen options={{ headerShown: false }} name="Home" component={HomeScreen} />
              <Stack.Screen options={{ headerShown: false }} name="Welcome" component={WelcomeScreen} />
              </>
            ) : (
              // No user logged in, show LoginScreen and RegisterScreen
              <>
                <Stack.Screen options={{ headerShown: false }} name="Login" component={LoginScreen} />
                <Stack.Screen options={{ headerShown: false }} name="Register" component={RegisterScreen} />
              </>
            )}
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
