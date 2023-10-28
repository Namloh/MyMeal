import React, { useContext, useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button, Text } from '@rneui/themed';
import { DarkModeContext } from '../DarkModeProvider/DarkModeProvider';

const ActivityInputScreen = () => {
  const navigation = useNavigation();
  const { saveDataToFirestore } = useContext(DarkModeContext);
  const [activity, setActivity] = useState('0');
  const weeklyActivityOptions = [
    { label: 'None', value: '0' },
    { label: 'Moderate', value: '200' },
    { label: 'High', value: '500' },
    { label: 'Extreme', value: '800' },
  ];
  
  const goToHomeScreen = () => {
    saveDataToFirestore('activity', activity);
    navigation.navigate('Home');
  };
  const goBack= () => {
    navigation.goBack();
  };
  return (
    <View style={styles.container}>
      <Text style={styles.inputLabel}>Enter your weekly activity:</Text>
      <View style={styles.activityButtonsContainer}>
        {weeklyActivityOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.activityButton,
              activity === option.value && styles.activityButtonSelected,
            ]}
            onPress={() => setActivity(option.value)}
          >
            <Text
              style={[
                styles.activityButtonText,
                activity === option.value && styles.activityButtonTextSelected,
              ]}
            >
              {option.label + " - " + option.value + "cals"}
            </Text>
          </TouchableOpacity>
        ))}
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
      },
      inputLabel: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
        marginVertical: 20,
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
export default ActivityInputScreen;
