import React, { useContext, useState, useEffect } from 'react';
import { View, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button, Text, ButtonGroup, Input } from '@rneui/themed';
import { DarkModeContext } from '../DarkModeProvider/DarkModeProvider';
import DateOfBirthInput from '../Components/DateOfBirthInput';


const AgeAndGenderScreen = () => {
  const navigation = useNavigation();
  const { saveDataToFirestore } = useContext(DarkModeContext);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);  

  const goToHomeScreen = () => {
    if (selectedDate) {
        const formattedDate = selectedDate ? `${selectedDate.getDate()}-${selectedDate.getMonth() + 1}-${selectedDate.getFullYear()}` : '';
        console.log(selectedDate)
        saveDataToFirestore('dateOfBirth', formattedDate);
    }
    else{
        Alert.alert(
            "Invalid Age",
            "Please enter a valid age as a number.",
            [{ text: "OK" }],
            { cancelable: true }
          );
          return
    }
    
    if(selectedIndex == 0){
        saveDataToFirestore('gender', "Male");
    }
    else{
        saveDataToFirestore('gender', "Female");
    }
  
    navigation.navigate('WeightInputScreen');
  };

  const goBack = () => {
    navigation.goBack();
  };
 
  const handleDateChange = (date) => {
    setSelectedDate(date);
  };
  return ( 
    <View style={styles.container}>  

        <Text style={styles.inputLabel}>
                {selectedDate
                ? `Selected Date: ${selectedDate.getDate()}-${selectedDate.getMonth() + 1}-${selectedDate.getFullYear()}`
                : 'Select your date of birth'}
        </Text>
        <DateOfBirthInput  onDateChange={handleDateChange} />
   

      <Text style={styles.inputLabel}>Select your gender:</Text>
      <ButtonGroup
              buttons={['Male', 'Female']}
              selectedIndex={selectedIndex}
              onPress={(value) => {
                setSelectedIndex(value)
              }} 
              containerStyle={{ minWidth: '100%', marginLeft: 'auto', marginRight: 30, backgroundColor: 'deepskyblue', borderColor: 'white' }}
              textStyle={{ color: 'white', fontWeight: '700', fontSize: 15 }}
              selectedButtonStyle={{backgroundColor: 'white'}}
              selectedTextStyle={{color: 'deepskyblue'}}
            />
 

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
          onPress={goToHomeScreen}
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
    marginVertical: 10,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 5,
    height: 40,
    width: '100%',
    paddingHorizontal: 10,
    marginBottom: 20,
    fontSize: 18,
  },
  inputField: {
    flex: 1, // Take up remaining space
    fontSize: 22,
    paddingBottom: 15,
    paddingLeft: 10,
    color: 'white', // Set the text color
  },
  activityButtonsContainer: {
    width: '80%',
  },
  activityButton: {
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 5,
    marginBottom: 10,
  },
  activityButtonText: {
    fontSize: 22,
    textAlign: 'center',
    color: 'deepskyblue',
    fontWeight: 700
  },
  activityButtonSelected: {
    backgroundColor: 'deepskyblue',
    borderColor: 'white',
    borderWidth: 2
  },
  activityButtonTextSelected: {
    color: 'white',
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

export default AgeAndGenderScreen;
