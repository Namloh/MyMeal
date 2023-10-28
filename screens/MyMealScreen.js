import { StyleSheet, Text, View, StatusBar } from 'react-native'
import React, { useContext, useEffect } from 'react';
import { DarkModeContext } from '../DarkModeProvider/DarkModeProvider';

const MyMealScreen = () => {
  const { theme, fetchUserData, toggleDarkMode } = useContext(DarkModeContext);
  const statusBarHeight = StatusBar.currentHeight || 0;

  useEffect(() => {
   
  }, []);  

  return (

    <View style={{ minHeight: '100%', backgroundColor: theme.background , paddingTop: statusBarHeight}}>
       
       <Text style={[styles.header, {color: theme.primaryText}]}>My Meal</Text>
        <View style={styles.container}>


        </View>
    </View>
  )
}

export default MyMealScreen

const styles = StyleSheet.create({
  container:{
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
   
},
header:{
  fontWeight: 700,
  fontSize: 30,
  marginLeft: 10,
  marginTop: 10,
},

})