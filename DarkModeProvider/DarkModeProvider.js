import React, { createContext, useState, useEffect } from 'react';
import { lightTheme, darkTheme } from '../themes';
import { db } from '../firebase'
import { collection, doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from "firebase/auth";
import { StatusBar, Appearance } from 'react-native'
import auth from '@react-native-firebase/auth';
import debounce from 'lodash/debounce';

const saveDataToFirestore = async (fieldName, value) => {
  try {
    if (fieldName === 'name' && value.length > 15) {
      alert("Name should not be more than 15 characters long.")
      value = value.slice(0, 15); // Truncate the name to 15 characters
    }
    if (fieldName === 'weight' ) {
      if(value.length > 10){
        alert("Weight should not be more than 10 characters long.")
        value = value.slice(0, 10); // Truncate the name to 15 characters
      }
      value = parseFloat(value).toFixed(2);
     
    }
   
    const userId = auth().currentUser.uid;
    const userRef = doc(collection(db, 'users'), userId);
    await setDoc(userRef, { [fieldName]: value }, { merge: true });
    console.log(`${fieldName} saved successfully!`);
  } catch (error) {
    console.error(`Error saving ${fieldName}:`, error);
  }
};


export const DarkModeContext = createContext({
  darkMode: false,
  toggleDarkMode: () => {},
  theme: lightTheme, 
  fetchUserData: () => {},
  saveDataToFirestore: () => {},
  userData: null,
});

export const DarkModeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [userData, setUserData] = useState(null);
  const debouncedUpdateUserData = debounce((data) => {
    setUserData(data);
    // Other UI updates
  }, 500); // Adjust the debounce delay (in milliseconds) as needed
 
  
  const initializeUserData = async () => {
    try {
      const userId = auth().currentUser.uid;
      const userRef = doc(collection(db, 'users'), userId);
 
      const unsubscribeUserData = onSnapshot(userRef, (doc) => {
        if (doc.exists()) {
          const userData = doc.data();
          console.log('User data:', userData);
          if (userData.name === undefined) {
            userData.name = 'Guest';
          }
          setUserData(userData);
          if (userData.darkMode !== undefined) {
            setDarkMode(userData.darkMode);
            StatusBar.setBarStyle(userData.darkMode ? 'light-content' : 'dark-content', true);
            StatusBar.setTranslucent(true);
            StatusBar.setBackgroundColor(userData.darkMode ? 'black' : 'white');
          }
          debouncedUpdateUserData(userData);
        } else {
          console.log('No user data found.');
        }
      }); 

      return unsubscribeUserData;
    } catch (error) {
      console.error('Error initializing user data:', error);
    }
  };
  
  useEffect(() => {
    if (auth().currentUser) {
      const unsubscribeUserData = initializeUserData();
      return () => {
        if (unsubscribeUserData) {
          unsubscribeUserData();
        } 
      };
    } else {
      setUserData(null);
    }
  }, []);

  const toggleDarkMode = async () => {
    setDarkMode((prev) => !prev);
    const userId = auth().currentUser.uid;
    const userRef = doc(collection(db, 'users'), userId);
    // Update the local state immediately, and then perform the Firestore operation
    try {
      await setDoc(userRef, { darkMode: !darkMode }, { merge: true });
      StatusBar.setBarStyle(!darkMode ? 'light-content' : 'dark-content', true);
      StatusBar.setTranslucent(true);
      StatusBar.setBackgroundColor(!darkMode ? 'black' : 'white');
    } catch (error) {
      console.error('Error toggling dark mode:', error);
    }
  };

  const theme = darkMode ? darkTheme : lightTheme;

  return (
    <DarkModeContext.Provider value={{ darkMode, toggleDarkMode, theme, userData, saveDataToFirestore }}>
      {children}
    </DarkModeContext.Provider>
  );
};