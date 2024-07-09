import React, { useState, useContext, useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { ButtonGroup } from '@rneui/themed';
import { DarkModeContext } from '../DarkModeProvider/DarkModeProvider';

const DailyActivitySection = () => {
  const dailyActivityOptions = [
    { label: 'None', value: '0' },
    { label: 'Moderate', value: '300' },
    { label: 'High', value: '600' },
    { label: 'Extreme', value: '1000' },
  ];

  const { theme, userData, saveDataToFirestore } = useContext(DarkModeContext);
  const [selectedActivity, setSelectedActivity] = useState(userData?.dailyActivity || dailyActivityOptions[0].value);

  useEffect(() => {
    // Update the selected activity when userData changes
    setSelectedActivity(userData?.dailyActivity || dailyActivityOptions[0].value);
  }, [userData]);

  const handleActivityChange = (selectedIndex) => {
    const newActivity = dailyActivityOptions[selectedIndex].value;
    setSelectedActivity(newActivity);

    // Save the selected activity to userData in Firestore
    saveDataToFirestore('dailyActivity', newActivity);
  };

  return (
    <View style={styles.itemContainer}>
      <Text style={[styles.label, { color: theme.primaryText, marginTop: 10 }]}>
        Daily Activity Level: ~{selectedActivity} kcal
      </Text>
      <ButtonGroup
        buttons={dailyActivityOptions.map((option) => option.label)}
        selectedIndex={dailyActivityOptions.findIndex((option) => option.value === selectedActivity)}
        onPress={handleActivityChange}
        containerStyle={{ maxWidth: '100%', marginLeft: 'auto', marginRight: 'auto', backgroundColor: theme.background, borderColor: theme.primaryText }}
        textStyle={{ color: theme.primaryText, fontWeight: '700', fontSize: 15 }}
        selectedButtonStyle={{ backgroundColor: 'deepskyblue' }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    width: '100%',
    height: '60%',
    minHeight: 50,
  },
  label: {
    fontSize: 20,
    maxWidth: 300,
  },
});

export default DailyActivitySection;
