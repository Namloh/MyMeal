import React, { useState, useContext, useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { DarkModeContext } from '../DarkModeProvider/DarkModeProvider'; // Import your DarkModeContext

const DietPicker = () => {
  const { theme, userData, saveDataToFirestore } = useContext(DarkModeContext); // Use the theme context
  
  const [selectedDiet, setSelectedDiet] = useState(userData.diet ? userData.diet : 'None');

  const dietOptions = [
    { label: 'None', value: 'None' },
    { label: 'Vegan', value: 'Vegan' },
    { label: 'Vegetarian', value: 'Vegetarian' },
    { label: 'Ketogenic', value: 'Ketogenic' },
    { label: 'Paleo', value: 'Paleo' }, 
    { label: 'Lacto-Vegetarian', value: 'Lacto-Vegetarian' },
    { label: 'Pescetarian', value: 'Pescetarian' },
    { label: 'Primal', value: 'Primal' },
    { label: 'Low FODMAP', value: 'Low FODMAP' },
    { label: 'Whole30', value: 'Whole30' },
  ];

  useEffect(() => {
    saveDataToFirestore('diet', selectedDiet)
  }, [selectedDiet]);

  return (
    <View style={styles.container}>
        <Text style={[styles.label, { color: theme.primaryText }]}>Diet:</Text>
        <View style={styles.dropdownContainer}>
            <Dropdown
                placeholder={userData.diet ? userData.diet : 'None'}
                placeholderStyle={{fontSize: 20}}
                autoScroll={false}
                labelField="label" 
                valueField="value" 
                data={dietOptions}
                value={selectedDiet}
                maxHeight={300}
                onChange={(itemValue) => setSelectedDiet(itemValue.label)}
                selectedTextStyle={[styles.label, { color: theme.primaryText}]}
                containerStyle={[styles.dropdown, { backgroundColor: theme.background, marginTop: 0 }]} 
                itemTextStyle={{color: theme.primaryText}}
                activeColor={'deepskyblue'}
            />
        </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
    marginTop: 5
  },
  dropdownContainer: {
    position: 'absolute',
    left: '14%',
    width: '86%' 
  }, 
  label: {
    fontSize: 20,
  },
});

export default DietPicker;
