import { KeyboardAvoidingView, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native'
import React, {useEffect, useState, useContext}  from 'react'
import { provider, signInWithPopup } from '../firebase';
import { useNavigation } from '@react-navigation/native'
import { getAuth, GoogleAuthProvider, sendPasswordResetEmail } from "firebase/auth";
import { differenceInSeconds } from 'date-fns'; 
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { LoginManager, AccessToken } from 'react-native-fbsdk-next';
import { SocialIcon, Divider, Button  } from '@rneui/themed';


 
const LoginScreen = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [isLoadingLogIn, setIsLoadingLogIn] = useState(false);
  const navigation = useNavigation()


  async function onGoogleButtonPress() {
    setIsLoadingGoogle(true);
    // Check if your device supports Google Play
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    // Get the users ID token
    const { idToken } = await GoogleSignin.signIn();
  
    // Create a Google credential with the token
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);
  
    // Sign-in the user with the credential
    return auth().signInWithCredential(googleCredential);
  }

   
  async function onFacebookButtonPress() {
   // COMPUTER CRASH LIKE WTF!!!!
/*
    const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);
  
    console.log(result)
  
    if (result.isCancelled) {
      console.log("User has cancelled the login process")
    }
    */
   
    // Once signed in, get the users AccessToken
    const data = await AccessToken.getCurrentAccessToken();

    if (!data) {
      console.log('Something went wrong obtaining access token')
    }
    // Create a Firebase credential with the AccessToken
    const facebookCredential = auth.FacebookAuthProvider.credential(data.accessToken);
    // Sign-in the user with the credential
    return auth().signInWithCredential(facebookCredential);
   
  }

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((user) => {
      if (user) {
        const creationTime = new Date(user.metadata.creationTime);
        const lastSignInTime = new Date(user.metadata.lastSignInTime);
        console.log(creationTime)
        console.log(lastSignInTime)
        const thresholdSeconds = -5; // Set the threshold in seconds
    
        const timeDifference = differenceInSeconds(creationTime, lastSignInTime);
        console.log(timeDifference)
        if (timeDifference >= thresholdSeconds) {
          console.log("User is signing in with Google for the first time!");
          navigation.replace("Welcome");
        } else {
          console.log("Returning user.");
          navigation.replace("Home");
        }
 

        //remove loadings
        setIsLoadingGoogle(false);
        setIsLoadingLogIn(false)
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
    if(email == "" || password == ""){
      Alert.alert(
        "Email or password were not provided",
        "Try again...",
        [{ text: "OK", onPress: () => {} }],
        { cancelable: true }
      );
      return
    }
    setIsLoadingLogIn(true)
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
    <KeyboardAvoidingView style={styles.container} behavior='padding' keyboardVerticalOffset={-400}>
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
     
        <Button
              title="LOG IN"
              buttonStyle={{
                backgroundColor: 'deepskyblue',
                borderWidth: 2,
                borderColor: 'white',
                borderRadius: 20,
                height: 63,
              }}
              containerStyle={{
                width: 253,
                marginHorizontal: 10,
                marginVertical: 0,
                borderRadius: 20,
              }}
              titleStyle={{ fontWeight: 'bold', fontSize: 18 }}
              loading={isLoadingLogIn}
              loadingProps={{ size: 'large', color: 'white' }}
              onPress={handleLogIn} 
              raised={true}
            
            />
        
        <Text style={styles.newAccText}>Don't have an account?</Text>
        <Button
              title="Register"
              buttonStyle={{
                backgroundColor: 'white',
                borderWidth: 2,
                borderColor: 'deepskyblue',
                borderRadius: 20,
                height: 60,
                
              }}
         
              containerStyle={{
                width: 250,
                marginHorizontal: 10,
                marginVertical: 5,
                borderRadius: 20,
              }}
              titleStyle={{ fontWeight: 'bold',  color: 'deepskyblue',fontSize: 18 }}
              onPress={handleRegisterPress} 
              raised={true}
            />


        <Divider  subHeaderStyle={{ color: 'deepskyblue', marginRight: 'auto', marginLeft: 'auto', fontWeight: '400', fontSize: 20, marginBottom: 10 }}  subHeader="Log in using socials" style={{width:"100%",marginTop:25, marginBottom: 5}} color='deepskyblue' width={1} inset={false} insetType="middle" />

        <SocialIcon onPress={onGoogleButtonPress}
      type='google'
      title='Google'
      iconSize={28}
      loading={isLoadingGoogle} 
    />

<SocialIcon onPress={onFacebookButtonPress}
      type='facebook'
      title='Facebook'
      iconSize={28}
      loading={isLoadingGoogle} 
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