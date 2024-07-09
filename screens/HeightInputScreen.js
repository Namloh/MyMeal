import React, { useContext, useState } from 'react';
import { View, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button, Text, Input } from '@rneui/themed';
import { DarkModeContext } from '../DarkModeProvider/DarkModeProvider';

const HeightInputScreen = () => {
  const navigation = useNavigation();
  const { saveDataToFirestore } = useContext(DarkModeContext);
  const [height, setHeight] = useState('');

  const goToActivityInput = () => {
    // Step 1: Check if the weight is a valid number
    const parsedHeight = parseFloat(height);
    if (isNaN(parsedHeight)) {
      // Step 2: Show an error message if it's not a valid number
      Alert.alert(
        "Invalid height",
        "Please enter a valid height as a number.",
        [{ text: "OK" }],
        { cancelable: true }
      );
    } else {
      // Step 3: If it's a valid number, save it to Firestore and navigate
        saveDataToFirestore('height', height); 
        navigation.navigate('ActivityInputScreen');
    }
  };
  const goBack = () => {
    navigation.goBack();
  };
  return (
    <View style={styles.container}>
      <Text style={styles.inputLabel}>Enter your height in cm:</Text>
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
          value={height}
          // Update the state when the user types
          onChangeText={(text) => setHeight(text)}
        />
        <Text style={styles.inputUnit}>cm</Text>
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
          onPress={goToActivityInput}
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
        marginVertical: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
      },
      buttonStyle: {
        backgroundColor: 'white',
        borderWidth: 2,
        borderColor: 'deepskyblue',
        borderRadius: 20,
        height: 60,
      },
      buttonContainerStyle: {
        width: 130,
        marginVertical: 5,
        borderRadius: 20,
      },
      buttonTitleStyle: {
        fontWeight: 'bold',
        color: 'deepskyblue',
        fontSize: 22,
      },
    };
export default HeightInputScreen;
