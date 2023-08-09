import React, { useState } from 'react';
import { View, TextInput, Alert, Text } from 'react-native';
import auth from '@react-native-firebase/auth';
import { SocialIcon, Divider, Button, Header  } from '@rneui/themed';
import { useNavigation } from '@react-navigation/native'

const ResetPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const navigation = useNavigation()

  const handleResetPassword = async () => {
    try {
        if(email == ""){
            Alert.alert(
                "Email was not provided",
                "Try again...",
                [{ text: "OK", onPress: () => {} }],
                { cancelable: true }
            );
            return
        }
      await auth().sendPasswordResetEmail(email);
      Alert.alert('Password Reset Email Sent', 'Check your email for instructions on resetting your password.');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleLoginPress = () => {
    navigation.navigate("Login");
  };

  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text style={{fontSize: 25, fontWeight: '700',color: 'deepskyblue', marginBottom: 25}}>Reset your password via email</Text>
      <TextInput
        placeholder="Enter your email"
        value={email}
        onChangeText={(text) => setEmail(text)}
        style={{
            backgroundColor: 'white',
            paddingHorizontal: 15,
            paddingVertical: 10,
            borderRadius: 10,
            marginTop: 5,
            width: 250,
            textAlign: 'center',
            fontSize: 15,
            marginBottom: 30
        }}
      />
      <Button title="Send Reset Email" onPress={handleResetPassword} 
             buttonStyle={{
                backgroundColor: 'deepskyblue',
                borderWidth: 2,
                borderColor: 'white',
                borderRadius: 20,
                height: 62,
              }}
              containerStyle={{
                width: 253,
                marginHorizontal: 10,
                marginVertical: 0,
                borderRadius: 20,
                marginBottom: 10
              }}
              titleStyle={{ fontWeight: 'bold', fontSize: 18 }}
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
  );
};

export default ResetPasswordScreen;
