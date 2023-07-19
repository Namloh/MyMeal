import { StyleSheet, Text, View, TouchableOpacity, Appearance, Switch } from 'react-native'
import React, {useState, useEffect} from 'react'
import { auth, db } from '../firebase'
import { useNavigation } from '@react-navigation/native'
import { onAuthStateChanged } from "firebase/auth";
import { collection, doc, getDoc } from 'firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';

const SettingsScreen = () => {

  const [userData, setUserData] = useState(null);
  const navigation = useNavigation()

  const handleSignOut = () => {
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
    <>
     <Text style={styles.header}>My Account</Text>
   
        <View style={styles.container}>

            <Text style={styles.emailText}>Name: {userData?.name}</Text>
            <Text style={styles.emailText}>Weight: {userData?.weight} Kg</Text>
            <Text style={styles.emailText}>Email: {auth.currentUser?.email}</Text>
     
      

          
        </View>
        <TouchableOpacity
            onPress={handleSignOut}
            style={styles.button}
            >
                <Text style={styles.buttonText}>Sign Out</Text>
            </TouchableOpacity>
    </>
  )
}

export default SettingsScreen


const styles = StyleSheet.create({
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