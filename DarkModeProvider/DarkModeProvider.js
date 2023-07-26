import React, { createContext, useState, useEffect } from 'react';
import { lightTheme, darkTheme } from '../themes';
import { db } from '../firebase'
import { collection, doc, setDoc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from "firebase/auth";
import { StatusBar, Appearance } from 'react-native'
import auth from '@react-native-firebase/auth';

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


  const fetchUserData = async () => {
    try {
        const userId = auth().currentUser.uid;
        const userRef = doc(collection(db, 'users'), userId);
        const userSnapshot = await getDoc(userRef);
    
        if (userSnapshot.exists()) {
            const userData = userSnapshot.data();
            console.log('User data:', userData);
            setUserData(userData)
            if (userData.darkMode !== undefined) {
                setDarkMode(userData.darkMode);
                StatusBar.setBarStyle(userData.darkMode ? 'light-content' : 'dark-content', true);
                StatusBar.setTranslucent(true);
                StatusBar.setBackgroundColor(userData.darkMode ? 'black' : 'white');
            }
        } else {
        console.log('No user data found.');
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
    };
  
  useEffect(() => {
    
    const unsubscribe = onAuthStateChanged(auth(), async (user) => {
      if (user) {
        await fetchUserData(setUserData); // Pass setUserData function as a parameter

      } else {
        // Optionally, you can reset the userData state here when the user is not authenticated
        setUserData(null);

      }
     
    });

    return () => unsubscribe(); // Cleanup the listener when the component unmounts
  }, []);



  const toggleDarkMode = async () => { 
    try {     
        setDarkMode((prev) => !prev);
        StatusBar.setBarStyle(!darkMode ? 'light-content' : 'dark-content', true);
        StatusBar.setTranslucent(true);
        StatusBar.setBackgroundColor(!darkMode ? 'black' : 'white');
        await saveDataToFirestore('darkMode', !darkMode);
      } catch (error) {
        console.error('Error toggling dark mode:', error);
      }
  };

  
  const theme = darkMode ? darkTheme : lightTheme;

  return (
    <DarkModeContext.Provider value={{ darkMode, toggleDarkMode, theme, fetchUserData, saveDataToFirestore, userData}}>
      {children}
    </DarkModeContext.Provider>
  );
};