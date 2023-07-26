import { KeyboardAvoidingView, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native'
import React, {useEffect, useState, useContext}  from 'react'
import { provider, signInWithPopup } from '../firebase';
import { useNavigation } from '@react-navigation/native'
import { getAuth, GoogleAuthProvider } from "firebase/auth";

import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

import { SocialIcon, Divider } from '@rneui/themed';



const LoginScreen = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation()


  async function onGoogleButtonPress() {
    setIsLoading(true);
    // Check if your device supports Google Play
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    // Get the users ID token
    const { idToken } = await GoogleSignin.signIn();
  
    // Create a Google credential with the token
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);
  
    // Sign-in the user with the credential
    
    return auth().signInWithCredential(googleCredential);
  }

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((user) => {
      if (user) {
        console.log('je tuaaaaaaaaa: ', user.metadata.creationTime);
        console.log('je tuuuuuuuuuu: ', user.metadata.lastSignInTime);
        if (user.metadata.creationTime === user.metadata.lastSignInTime) {
          console.log("User is signing in with Google for the first time!");
          navigation.replace("Welcome"); // Replace "Welcome" with the name of the screen you want to show to new users.
        } else {
          console.log("Returning user.");
          navigation.replace("Home"); // Replace "Home" with the name of the screen you want to show to returning users.
        }
        setIsLoading(false);
      }
    });
    return () => {
      // Clean up the listener when the component is unmounted
      unsubscribe();
    };
  }, [])


 

  const handleRegisterPress = () => {
    navigation.navigate("Register");
  };

  
  const handleLogIn = () => {
    
    Alert.alert(
      "Logging In",
      "Please wait while we log you in...",
      [{ text: "OK", onPress: () => {} }],
      { cancelable: true }
    );
    auth()
    .signInWithEmailAndPassword(email, password)
    .then((userCredentials) => {
      const user = userCredentials.user;
      console.log("Logged in with ", user.email);

    
    })
    .catch((error) => {
      alert(error.message);
     
    });
  
  }



  return (
    <KeyboardAvoidingView style={styles.container} behavior='padding' keyboardVerticalOffset={-350}>
      <View style={styles.inputContainer}>

        <TextInput
          placeholder='Email'
          value={email }
          onChangeText={text => setEmail(text)}
          style={styles.input}/>

        <TextInput
                placeholder='Password'
                value={ password}
                onChangeText={text => setPassword(text)}
                style={styles.input}
                secureTextEntry/>

      </View>
    
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={handleLogIn} style={[styles.button]}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        
        <Text style={styles.newAccText}>Don't have an account?</Text>
        <TouchableOpacity onPress={handleRegisterPress} style={[styles.button, styles.buttonOutline]}>
          <Text style={styles.btnOutlineText}>Register</Text>
        </TouchableOpacity>
       


        <Divider  subHeaderStyle={{ color: 'deepskyblue', marginRight: 'auto', marginLeft: 'auto', fontWeight: '400', fontSize: 20, marginBottom: 10 }}  subHeader="Log in using socials" style={{width:"100%",marginTop:25, marginBottom: 5}} color='deepskyblue' width={1} inset={false} insetType="middle" />

        <SocialIcon onPress={onGoogleButtonPress}
      type='google'
      title='Google'
      iconSize={28}
      loading={isLoading} 
    />
      
       
      </View>


      

    </KeyboardAvoidingView>
  )
}

export default LoginScreen

const styles = StyleSheet.create({
  
    container:{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
       
    },
    inputContainer: {
      width: '80%'
    },
    input: {
      backgroundColor: 'white',
      paddingHorizontal: 15,
      paddingVertical: 10,
      borderRadius: 10,
      marginTop: 5,

    },
    buttonContainer: {
      width: "60%",
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 40,
      textAlign: 'center',
    },
    button: {
      backgroundColor: "deepskyblue",
      width: "100%",
      padding: 15,
      borderRadius: 10,
      alignItems: 'center',
    },
    buttonOutline: {
      backgroundColor: 'white',
      marginTop: 5,
      borderColor: 'deepskyblue',
      borderWidth: 2,
    },
    buttonText: {
      color: 'white',
      fontWeight: '700',
      fontSize: 16,
    },
    btnOutlineText: {
      color: 'deepskyblue',
      fontWeight: '700',
      fontSize: 16,
    },
    newAccText:{
      marginTop: 20,
      color: 'deepskyblue',
      fontSize: 16,
    },
    loadingAlert: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      backgroundColor: 'white',
      padding: 30,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: 'deepskyblue',
      transform: [{ translateX: -50 }, { translateY: -50 }],
      justifyContent: 'center',
      alignItems: 'center',
    },
    
})  