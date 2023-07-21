import { StyleSheet, Text, View, TouchableOpacity, StatusBar } from 'react-native'
import React, {useState, useEffect, useContext} from 'react'
import { auth, db } from '../firebase'
import { useNavigation } from '@react-navigation/native'
import { onAuthStateChanged } from "firebase/auth";
import { collection, doc, getDoc } from 'firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';
import { DarkModeContext } from '../DarkModeProvider/DarkModeProvider';
import { Switch } from 'native-base'


const SettingsScreen = () => {

  const { darkMode, toggleDarkMode, theme } = useContext(DarkModeContext);
  const [userData, setUserData] = useState(null);
  const navigation = useNavigation()
  const statusBarHeight = StatusBar.currentHeight || 0;

  const handleSignOut = () => {
    StatusBar.setBarStyle('dark-content');
    StatusBar.setBackgroundColor('transparent');
      auth.signOut()
          .then(() => {
          navigation.replace("Login");
          console.log("Signed out");
          })
          .catch(error => alert(error.message));
      };
  onAuthStateChanged(auth, (user) => {
  if (user) {
      const uid = user.uid;
  } else {
      // User is signed out
  }
  });

 
  const fetchUserData = async () => {
    try {
      const userId = auth.currentUser.uid;
      const userRef = doc(collection(db, 'users'), userId);
      const userSnapshot = await getDoc(userRef);
  
      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();
        console.log('User data:', userData);
        setUserData(userData)
      } else {
        console.log('No user data found.');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };


  useFocusEffect(
    React.useCallback(() => {
      fetchUserData();
    }, [])
    );

    
  return (
    <View style={[styles.wrap, {backgroundColor: theme.background, paddingTop: statusBarHeight}]}>
     <Text style={[styles.header, {color: theme.primaryText }]}>My Account</Text>

        <View style={styles.container}>

            <Text style={[styles.emailText, {color: theme.primaryText }]}>Name: {userData?.name}</Text>
            <Text style={[styles.emailText, {color: theme.primaryText }]}>Weight: {userData?.weight} Kg</Text>
            <Text style={[styles.emailText, {color: theme.primaryText }]}>Email: {auth.currentUser?.email}</Text>
     
      

            <View style={styles.switchContainer}>
            <Text style={[styles.emailText, {color: theme.primaryText }]}>
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </Text>
            <Switch onTrackColor={"deepskyblue"} value={darkMode} onToggle={toggleDarkMode} />
          </View>
        </View>
        <TouchableOpacity
            onPress={handleSignOut}
            style={styles.button}
            >
                <Text  style={[styles.buttonText, {color: theme.btnText }]}>Sign Out</Text>
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
        maxHeight: "70%",
    },
    emailText: {
        fontSize: 20,
      },
      button: {
        backgroundColor: "deepskyblue",
        width: "70%",
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
      }
  
})