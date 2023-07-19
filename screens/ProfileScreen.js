import { KeyboardAvoidingView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, {useState, useContext} from 'react'
import { collection, doc, setDoc } from 'firebase/firestore';
import { auth } from '../firebase'
import {db} from "../firebase"
import { DarkModeContext } from '../DarkModeProvider/DarkModeProvider';

const ProfileScreen = () => {
    const { theme } = useContext(DarkModeContext);
    const [weightValue, setWeightValue] = useState('');
    const [name, setName] = useState('');

    const saveDataToFirestore = async (fieldName, value) => {
    try {
        const userId = auth.currentUser.uid;
        const userRef = doc(collection(db, 'users'), userId);
        await setDoc(userRef, { [fieldName]: value }, { merge: true });
        console.log(`${fieldName} saved successfully!`);
    } catch (error) {
        console.error(`Error saving ${fieldName}:`, error);
    }
    };

  return (
    <View style={{minHeight: "100%", backgroundColor: theme.background}}>
       
        <Text style={[styles.header, {color: theme.primaryText}]}>My Profile</Text>
        <View style={styles.container}>
     
          
            
            <TextInput
                style={styles.input}
                placeholder="Enter weight"
                value={weightValue}
                onChangeText={text => setWeightValue(text)}
                keyboardType="numeric"
                />

            <TouchableOpacity onPress={() => saveDataToFirestore('weight', weightValue)} style={styles.button}>
            <Text style={styles.buttonText}>Save Weight</Text>
            </TouchableOpacity>


            <TextInput
            placeholder='Name'
            value={name }
            onChangeText={text => setName(text)}
            style={styles.input}/>
            <TouchableOpacity onPress={() => saveDataToFirestore('name', name)} style={styles.button}>
            <Text style={styles.buttonText}>Save Name</Text>
            </TouchableOpacity>
        </View>
    </View>
  )
}

export default ProfileScreen

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
      width: "60%",
      padding: 15,
      borderRadius: 10,
      alignItems: 'center',
    },
    header:{
        fontWeight: 700,
        fontSize: 30,
        marginLeft: 10,
        marginTop: 10,
      },
})