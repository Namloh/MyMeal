import React, { useState, useContext, useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { ButtonGroup } from '@rneui/themed';
import { DarkModeContext } from '../DarkModeProvider/DarkModeProvider';

const WeightGoalSelection = () => {
  const weightLossOptions = [
    { label: 'Fast Loss', value: '-500' },
    { label: 'Mild Loss', value: '-250' },
    { label: 'Maintain', value: '0' },
    { label: 'Mild Gain', value: '250' },
    { label: 'Fast Gain', value: '500' },
  ];

  const { theme, userData, saveDataToFirestore } = useContext(DarkModeContext);
  const [selectedWeightLoss, setSelectedWeightLoss] = useState(userData?.weightGoal || weightLossOptions[0].value);

  useEffect(() => {
    // Update the selected weight loss goal when userData changes
    setSelectedWeightLoss(userData?.weightGoal || weightLossOptions[0].value);
  }, [userData]);

  const handleWeightLossChange = (selectedIndex) => {
    const newWeightLossGoal = weightLossOptions[selectedIndex].value;
    setSelectedWeightLoss(newWeightLossGoal);

    // Save the selected weight loss goal to userData in Firestore
    saveDataToFirestore('weightGoal', newWeightLossGoal);
  };

  return (
    <View style={styles.itemContainer}>
        <Text style={[styles.label, { color: theme.primaryText, marginTop: 30 }]}>
            Weight Goal
         </Text>
      <ButtonGroup
        buttons={weightLossOptions.map((option) => option.label)}
        selectedIndex={weightLossOptions.findIndex((option) => option.value === selectedWeightLoss)}
        onPress={handleWeightLossChange}
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
    minHeight: 60,
    marginTop: 10,
    },
  label: {
    fontSize: 20,
    maxWidth: 300,
  },
});

export default WeightGoalSelection;
