import React, { createContext, useState, useEffect } from 'react';
import { lightTheme, darkTheme } from '../themes';
import { db } from '../firebase'
import { collection, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { StatusBar } from 'react-native'
import auth from '@react-native-firebase/auth';
import debounce from 'lodash/debounce';
 
//keep this function outside or else it doesnt update the userdata idk why bruh -- possible fix by having iLoveUserData lule
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
  calculateDailyCalories: () => {},
  iLoveUserData: () => {},
  userData: null,
}); 

export const DarkModeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false); 
  const [userData, setUserData] = useState(null); 
  const debouncedUpdateUserData = debounce((data) => {
    setUserData(data);
  }, 500);
    
  useEffect(() => {  
    if(userData){ 
      const dailyCalories = calculateDailyCalories();
      saveDataToFirestore('dailyCalories', dailyCalories) 
    }
   
  }, [userData?.weight, userData?.dateOfBirth, userData?.height, userData?.dailyActivity, userData?.weightGoal]);
  
   
  const initializeUserData = async () => {
    try {
      const userId = auth().currentUser.uid;
      const userRef = doc(collection(db, 'users'), userId); 
      const unsubscribeUserData = onSnapshot(userRef, (doc) => {
        if (doc.exists()) {
          const userData = doc.data();
          //console.log('User data:', userData); 
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
  const iLoveUserData = async () => {
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
  };

  useEffect(() => {
    iLoveUserData()
  }, []);


  const toggleDarkMode = async () => {
    setDarkMode((prev) => !prev);
    const userId = auth().currentUser.uid;
    const userRef = doc(collection(db, 'users'), userId);
    // Update the local state immediately, and then perform the Firestore operation
    try {
      StatusBar.setBarStyle(!darkMode ? 'light-content' : 'dark-content', true);
      StatusBar.setTranslucent(true);
      StatusBar.setBackgroundColor(!darkMode ? 'black' : 'white');
      await setDoc(userRef, { darkMode: !darkMode }, { merge: true });
    } catch (error) {
      console.error('Error toggling dark mode:', error);
    }
  };

  const calculateDailyCalories = () => {
    // Constants for calorie calculation
    if(userData.dateOfBirth == null || userData == null || userData.weight == null || userData.height == null){
      return 2000
    }
    const weightMultiplier = 10;
    const heightMultiplier = 6.25;
    const ageMultiplier = 5;
    const birthdate = userData?.dateOfBirth;

    const birthdateArray = birthdate.split('-');
    const birthYear = parseInt(birthdateArray[2]);
    let currentYear = new Date().getFullYear();
    let age = currentYear - birthYear;  


    // Calculate Basal Metabolic Rate (BMR) 
    let bmr = 0;
    if (userData?.gender === "Male") {
      bmr =
        parseInt(userData?.weight) * weightMultiplier +
        parseInt(userData?.height) * heightMultiplier -
        ageMultiplier * age +
        5;
    } else {
      bmr =
        parseInt(userData?.weight) * weightMultiplier +
        parseInt(userData?.height) * heightMultiplier -
        ageMultiplier * age -
        161;
    }
  
    // Calculate Daily Calories based on BMR and activity level
    let activityMultiplier = 1.2; // Default to sedentary
    switch (userData?.dailyActivity) {
      case "300":
        activityMultiplier = 1.375;
        break; 
      case "600":
        activityMultiplier = 1.55;
        break; 
      case "1000":
        activityMultiplier = 1.725;
        break; 
      default:
        break;
    } 
   
  
    const dailyCalories = parseFloat((bmr * activityMultiplier) + parseFloat(userData?.weightGoal));
    console.log(dailyCalories)
    return Math.round(dailyCalories);
  };
  const theme = darkMode ? darkTheme : lightTheme;

  return (
    <DarkModeContext.Provider value={{ darkMode, toggleDarkMode, theme, userData, saveDataToFirestore, calculateDailyCalories, iLoveUserData }}>
      {children}
    </DarkModeContext.Provider>
  );
};