import { KeyboardAvoidingView, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native'
import React, {useEffect, useState, useContext}  from 'react'
import { auth, provider, signInWithPopup } from '../firebase';
import { useNavigation } from '@react-navigation/native'
import { getAuth, GoogleAuthProvider } from "firebase/auth";


const LoginScreen = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation()

  const auth = getAuth();
    
  const handleSignInWithGoogle = async () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        //const token = credential.accessToken;
        // The signed-in user info.
        const user = result.user;
        // IdP data available using getAdditionalUserInfo(result)
        const isNewUser = result.additionalUserInfo?.isNewUser;
        if (isNewUser) {
          console.log("User is signing in with Google for the first time!");
          navigation.replace("Welcome")
        }
        else{ 
          console.log("old mf");
          navigation.replace("Home")
        }
        console.log("success", user) 
      }).catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        //const email = error.customData.email;
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);
        console.log(errorMessage)
      });

    }

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(user => {
      if(user){
        
      }
    })

    return unsub
  }, [])


 

  const handleRegisterPress = () => {
    navigation.navigate("Register");
  };

  
  const handleLogIn = () => {
    setIsLoading(true); 
    Alert.alert(
      "Logging In",
      "Please wait while we log you in...",
      [{ text: "OK", onPress: () => {} }],
      { cancelable: true }
    );
    auth
    .signInWithEmailAndPassword(email, password)
    .then((userCredentials) => {
      const user = userCredentials.user;
      console.log("Logged in with ", user.email);

      setIsLoading(false); // Set isLoading back to false after the login is successful
    })
    .catch((error) => {
      alert(error.message);
      setIsLoading(false); // Set isLoading back to false after the login attempt (whether it succeeded or failed)
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
       

        <TouchableOpacity onPress={handleSignInWithGoogle} style={[styles.button, styles.buttonOutline]}>
          <Text style={styles.btnOutlineText}>GOOGLE</Text>
        </TouchableOpacity>
       
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