import { Text, Image, ScrollView, View, ActivityIndicator, Alert } from 'react-native';
import React, { useEffect, useState, useContext } from 'react';
import { Button, Dialog } from '@rneui/themed';
import axios from 'axios';
import { DarkModeContext } from '../DarkModeProvider/DarkModeProvider';
import { useNavigation } from '@react-navigation/native';

const MealDetailScreen = ({ route }) => {
  const { meal } = route.params;
  const [mealDetails, setMealDetails] = useState(null);
  const navigation = useNavigation();
  const { userData, theme } = useContext(DarkModeContext);

  const [visibleSummary, setVisibleSummary] = useState(false);
  const handleSummaryPress = () => {
    setVisibleSummary(true);
  };

  function removeHtmlTags(str) {
    return str.replace(/(<([^>]+)>)/ig, "");
  }

  useEffect(() => {
    const fetchMealDetails = async () => {
      try {
        const response = await axios.get(`https://api.spoonacular.com/recipes/${meal.id}/information?includeNutrition=true&apiKey=${process.env.EXPO_PUBLIC_API_KEY}`);
        setMealDetails(response.data);
      } catch (error) {
        console.error('Error fetching meal details:', error);
      }
    };

    fetchMealDetails();
  }, [meal.id]);

  useEffect(() => {
    navigation.setOptions({
      headerStyle: { backgroundColor: theme.background },
      headerTitleStyle: {
        color: theme.primaryText
      },
      headerTintColor: theme.primaryText,
      headerTitle: mealDetails?.title,
    });
  }, [mealDetails]);

  if (!mealDetails) {
    return (
      <ScrollView style={{ minHeight: '100%', backgroundColor: theme.background }}>
        <ActivityIndicator
          size="large"
          color='deepskyblue'
          style={{ marginTop: 20 }}
        />
      </ScrollView>
    );
  }

  return (
    <ScrollView style={{ minHeight: '100%', backgroundColor: theme.background }}>
      <Image source={{ uri: mealDetails.image }} style={{ width: "100%", height: 250 }} />

      <View style={{ alignItems: 'center', borderBottomColor: theme.primaryText, borderBottomWidth: 1, paddingBottom: 15, padding: 5 }}>
        <Text style={{ fontSize: 20, fontWeight: '600', marginBottom: 5, color: 'deepskyblue' }}>{Math.ceil(mealDetails.nutrition.nutrients.find(nutrient => nutrient.name === "Calories").amount)} Calories</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', width: "100%" }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: theme.primaryText }}>Carbs: {Math.ceil(mealDetails.nutrition.nutrients.find(nutrient => nutrient.name === "Carbohydrates").amount)}g</Text>
          <Text style={{ fontSize: 18, fontWeight: '600', color: theme.primaryText }}>Fat: {Math.ceil(mealDetails.nutrition.nutrients.find(nutrient => nutrient.name === "Fat").amount)}g</Text>
          <Text style={{ fontSize: 18, fontWeight: '600', color: theme.primaryText }}>Protein: {Math.ceil(mealDetails.nutrition.nutrients.find(nutrient => nutrient.name === "Protein").amount)}g</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', width: "100%", padding: 5, borderBottomColor: theme.primaryText, borderBottomWidth: 1, paddingBottom: 10 }}>
        <Text style={{ fontSize: 18, color: theme.primaryText }}>Servings: {mealDetails.servings} </Text>
        <Text style={{ fontSize: 18, color: theme.primaryText }}>Ready in: {mealDetails.readyInMinutes} mins</Text>
      </View>

      <View style={{ flexDirection: 'column', width: "100%", paddingLeft: 15, paddingTop: 10 }}>
        <Text style={{ fontSize: 20, color: theme.primaryText, fontWeight: '600' }}>Ingredients:</Text>
        {mealDetails.extendedIngredients.map((ingredient, index) => {
          const measurement = userData.weightSystem === 'Imperial' ? ingredient.measures.us : ingredient.measures.metric;
          let amount = measurement.amount;
          if (measurement.amount > 10) {
            amount = parseFloat(amount.toFixed(1));
          } else if (measurement.amount > 100) {
            amount = Math.floor(measurement.amount);
          }
          return (
            <Text key={index} style={{ fontSize: 18, color: theme.primaryText, marginLeft: 15 }}>
              <Text style={{ color: 'deepskyblue' }}>{amount} {measurement.unitShort}</Text> {ingredient.name}
            </Text>
          );
        })}
      </View>

      <View style={{ flexDirection: 'column', width: "100%", paddingLeft: 15, paddingTop: 10, paddingRight: 20 }}>
        
      {mealDetails.analyzedInstructions.length > 0 && (
        <>
          <Text style={{ fontSize: 20, color: theme.primaryText, fontWeight: '600' }}>Instructions:</Text>
          {mealDetails.analyzedInstructions[0].steps.map((step, index) => (
            <View key={index} style={{ marginBottom: 10 }}>
              <Text style={{ fontSize: 18, color: theme.primaryText, marginLeft: 15 }}>
                <Text style={{ fontWeight: 'bold', color: 'deepskyblue' }}>{step.number}. </Text>
                {step.step}
              </Text>
            </View>
          ))}
        </>
      )}

      </View>
      <Button
        title="About Meal"
        onPress={handleSummaryPress}
        buttonStyle={{
          backgroundColor: 'deepskyblue',
          borderRadius: 20,
          height: 45,
          width: 130,
          marginTop: 15,
          marginBottom: 20,
          marginLeft: 'auto',
          marginRight: 'auto'
        }}
      />

      <Dialog
        isVisible={visibleSummary}
        onBackdropPress={() => { setVisibleSummary(false) }}
        overlayStyle={{ backgroundColor: theme.background, width: "90%" }}
      >
        <ScrollView>
          <Dialog.Title titleStyle={{ fontSize: 20, color: theme.primaryText }} title="About meal" />
          <Text style={{ fontSize: 17, color: theme.primaryText }}>{removeHtmlTags(mealDetails.summary)}</Text>
          <Dialog.Actions>
            <Dialog.Button title="Close" onPress={() => setVisibleSummary(false)} />
          </Dialog.Actions>
        </ScrollView>
      </Dialog>


    </ScrollView>
  );
};

export default MealDetailScreen;
