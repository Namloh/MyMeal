import React from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button } from '@rneui/themed'; 

const WelcomeScreen = () => {
  const navigation = useNavigation();

  const goToWeightInput = () => {
    navigation.navigate('WeightInputScreen');
  };

  return (
    <View style={styles.container}>
        <StatusBar backgroundColor="deepskyblue" barStyle="light-content" />
      {/* logo todo
       <Image
        source={require('./your-image-path.png')} // You should provide your image source
        style={styles.logo}
      />
      */}
      <Text style={styles.welcomeText}>Welcome to MyMeal!</Text>
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
  logo: {
    width: 150, // Customize the width of your logo
    height: 150, // Customize the height of your logo
  },

});

export default WelcomeScreen;
