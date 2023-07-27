import { KeyboardAvoidingView, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native'
import React, {useEffect, useState}  from 'react'
import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native'
import {  Divider, Button  } from '@rneui/themed';


const RegisterScreen = () => {

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isLoadingRegister, setIsLoadingRegister] = useState(false);
   
    const navigation = useNavigation()
    useEffect(() => {
      const unsub = auth().onAuthStateChanged(user => {
        if(user){
          setIsLoadingRegister(false)

          navigation.replace("Welcome")
        }
      })
    
      return unsub
    }, [])
  

    const handleLoginPress = () => {
        navigation.navigate("Login");
      };
    
    const handleSignUp = () => {
      if(email == "" || password == ""){
        Alert.alert(
          "Email or password were not provided",
          "Try again...",
          [{ text: "OK", onPress: () => {} }],
          { cancelable: true }
        );
        return
      }
      setIsLoadingRegister(true)
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
      <Button
              title="Create MyMeal Account"
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
              loading={isLoadingRegister}
              loadingProps={{ size: 'large', color: 'white' }}
              onPress={handleSignUp} 
              raised={true}
            
            />

     
      <Button
              title="Back to Login"
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
              onPress={handleLoginPress} 
              raised={true}
            />
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
      marginTop: 30,
      
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