import React, { useContext, useState } from 'react';
import { View, Text, Alert  } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button, Input } from '@rneui/themed';
import { DarkModeContext } from '../DarkModeProvider/DarkModeProvider';
import { collection, doc, setDoc, getDoc, serverTimestamp, addDoc, query, orderBy, getDocs  } from 'firebase/firestore';
import auth from '@react-native-firebase/auth';
import {db} from "../firebase"

const WeightInputScreen = () => {
  const navigation = useNavigation();
  const { saveDataToFirestore } = useContext(DarkModeContext);
  const [weight, setWeight] = useState('');

  const addWeightEntry = async (userId, weight) => {
    try {
      const weightRef = collection(db, 'users', userId, 'weightEntries');
      const newEntry = {
        weight: weight,
        timestamp: serverTimestamp(), // Use serverTimestamp to get the server time
      };
      await addDoc(weightRef, newEntry);
      console.log('Weight entry added successfully.');
    
    } catch (error) {
      console.error('Error adding weight entry:', error);
    }
  };

  const goToHeightInput = () => {
    // Step 1: Check if the weight is a valid number
    const parsedWeight = parseFloat(weight);
    if (isNaN(parsedWeight)) {
      // Step 2: Show an error message if it's not a valid number
      Alert.alert(
        "Invalid Weight",
        "Please enter a valid weight as a number.",
        [{ text: "OK" }],
        { cancelable: true }
      );
    } else {
      // Step 3: If it's a valid number, save it to Firestore and navigate
      saveDataToFirestore('weight', weight); 
      const userId = auth().currentUser.uid;
      addWeightEntry(userId, weight)
      navigation.navigate('HeightInputScreen');
    }
  };
  const goBack = () => {
    navigation.goBack();
  };
  return (
    <View style={styles.container}>
      <Text style={styles.inputLabel}>Enter your weight in kg:</Text>
      
      <View style={styles.inputContainer}>
      <Input
          inputContainerStyle={{borderBottomWidth:0}}
          style={styles.inputField}
          placeholder="0"
          placeholderTextColor="white"
          color="white"
          keyboardType="numeric"
          underlineColorAndroid="white"
          // Bind the value to the state variable
          value={weight}
          // Update the state when the user types
          onChangeText={(text) => setWeight(text)}
        />
        <Text style={styles.inputUnit}>kg</Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Previous"
          buttonStyle={styles.buttonStyle}
          containerStyle={styles.buttonContainerStyle}
          titleStyle={styles.buttonTitleStyle}
          onPress={goBack}
          raised={true}
        />
        <Button
          title="Next"
          buttonStyle={styles.buttonStyle}
          containerStyle={styles.buttonContainerStyle}
          titleStyle={styles.buttonTitleStyle}
          onPress={goToHeightInput}
          raised={true}
        />
      </View>
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'deepskyblue',
    padding: 20,
  },
  inputLabel: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginVertical: 20,
  },
  inputContainer: {
    width: "80%",
    flexDirection: 'row',
    alignItems: 'start',
    paddingRight: 20,
  },
  inputField: {
    flex: 1, // Take up remaining space
    fontSize: 22,
    paddingBottom: 10,
    paddingLeft: 10,
    color: 'white', // Set the text color
    
  },
  inputUnit: {
    fontSize: 22,
    color: 'white', // Set the text color
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginLeft: 'auto',
    marginTop: 60
  },
  buttonStyle: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: 'deepskyblue',
    borderRadius: 20,
    height: 60,
  },
  buttonContainerStyle: {
    width: '48%',
    marginVertical: 5,
    borderRadius: 20,
  },
  buttonTitleStyle: {
    fontWeight: 'bold',
    color: 'deepskyblue',
    fontSize: 22,
  },
};

export default WeightInputScreen;
