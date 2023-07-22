import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button, Modal, StatusBar } from 'react-native';
import PopupInputComponent from '../Components/PopupInputComponent';
import { DarkModeContext } from '../DarkModeProvider/DarkModeProvider'

const WelcomeScreen = () => {
    const statusBarHeight = StatusBar.currentHeight || 0;
    const { theme } = useContext(DarkModeContext);


  return (
    <View style={{ minHeight: '100%', backgroundColor: theme.background , paddingTop: statusBarHeight}}>
        <PopupInputComponent  >  

        </PopupInputComponent>

        
    </View>
    
  )
}

export default WelcomeScreen

