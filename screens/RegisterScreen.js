import { KeyboardAvoidingView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, {useEffect, useState}  from 'react'
import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native'

const RegisterScreen = () => {

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
  
   
    const navigation = useNavigation()
    useEffect(() => {
      const unsub = auth().onAuthStateChanged(user => {
        if(user){
          navigation.replace("Welcome")
        }
      })
    
      return unsub
    }, [])
  

    const handleLoginPress = () => {
        navigation.navigate("Login");
      };
    
    const handleSignUp = () => {
      auth().createUserWithEmailAndPassword(email,password)
      .then(userCredentials => 
        {
          const user = userCredentials.user; 
          console.log("Registered in with ", user.email)
          
        })
      .catch(error => alert(error.message))
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
     
      <TouchableOpacity onPress={handleSignUp} style={[styles.button]}>
        <Text style={styles.buttonText}>Crate MyMeal Account</Text>
      </TouchableOpacity>


      <TouchableOpacity onPress={handleLoginPress} style={[styles.button, styles.buttonOutline]}>
        <Text style={styles.btnOutlineText}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  </KeyboardAvoidingView>
  )
}

export default RegisterScreen

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
      borderColor: 'deepskyblue',
      borderWidth: 2,
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
})