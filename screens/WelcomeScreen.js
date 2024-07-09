import React, { useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button } from '@rneui/themed'; 

const WelcomeScreen = () => {
  const navigation = useNavigation();

  const goToWeightInput = () => {
    navigation.navigate('AgeAndGenderScreen');
  };

  useEffect(() => {  
    StatusBar.setBarStyle('light-content');
    StatusBar.setTranslucent(true);
    StatusBar.setBackgroundColor('deepskyblue');
   
  }, []); 
  return (
    <View style={styles.container}>
  
      <Text style={styles.welcomeText}>Welcome to MyMeal</Text>
      <Text style={styles.subText}>Keep healthy, easily!</Text>
      <Button
              title="Get Started"
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
              titleStyle={{ fontWeight: 'bold',  color: 'deepskyblue',fontSize: 22 }}
              onPress={goToWeightInput} 
              raised={true}
            />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'deepskyblue', // Background color
  },
  welcomeText: {
    fontSize: 35,
    fontWeight: 'bold',
    marginVertical: 20,
    color: 'white', // Text color
  },
  subText: {
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 30,
    color: 'white', // Text color
  },
  logo: {
    width: 150, // Customize the width of your logo
    height: 150, // Customize the height of your logo
    
  },

});

export default WelcomeScreen;
