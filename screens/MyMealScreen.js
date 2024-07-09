import { StyleSheet, View, StatusBar, ScrollView, ActivityIndicator } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { DarkModeContext } from '../DarkModeProvider/DarkModeProvider';
import { collection, doc, setDoc, serverTimestamp, addDoc, query, getDocs, where, deleteDoc } from 'firebase/firestore';
import {db} from "../firebase"
import auth from '@react-native-firebase/auth';
import { Card, Button, Text, Icon, Divider } from '@rneui/themed';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native'

const MyMealScreen = () => {
 const { userData, theme } = useContext(DarkModeContext);
 const [mealPlan, setMealPlan] = useState();
 const [isFetching, setIsFetching] = useState(false);
 
 const statusBarHeight = StatusBar.currentHeight || 0;

 useEffect(() => {
  fetchMealPlanFromFirestore(currentDate)
 }, [currentDate]);

 const navigation = useNavigation()
  
 const fetchMealPlanFromFirestore = async (date) => {
  setIsFetching(true);
  try {
    const userId = auth().currentUser.uid;
    const mealPlanRef = collection(db, 'users', userId, 'mealPlans');
    const q = query(mealPlanRef, where("date", "==", date.toISOString().split('T')[0]));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const mealPlanDoc = querySnapshot.docs[0];
      const mealPlanData = mealPlanDoc.data().mealPlan;
      setMealPlan(mealPlanData);
    } else {
      setMealPlan(null);
    }
    setIsFetching(false);
  } catch (error) {
    console.error('Error fetching meal plan:', error);
    setIsFetching(false);
  }
 };
 
 const mealPlanPresent = async (date) => {
  try {
    const userId = auth().currentUser.uid;
    const mealPlanRef = collection(db, 'users', userId, 'mealPlans');
    const q = query(mealPlanRef, where("date", "==", date.toISOString().split('T')[0]));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return true
    } else {
      return false
    }
  } catch (error) {
    console.error('Error fetching meal plan:', error);
    setIsFetching(false);
  }
 };

 const saveMealPlanToFirestore = async (mealPlan) => {
  try {
  const userId = auth().currentUser.uid;
  const mealPlanRef = collection(db, 'users', userId, 'mealPlans');

  // Add new meal plan
  const newMealPlan = {
    mealPlan: mealPlan,
    date: currentDate.toISOString().split('T')[0], 
    timestamp: serverTimestamp(), // Use serverTimestamp to get the server time
  };
  await addDoc(mealPlanRef, newMealPlan);
  console.log('Meal plan added successfully.');
  } catch (error) {
  console.error('Error adding meal plan:', error);
  }
 };
 const updateMealPlanInFirestore = async (mealPlan) => {
  try {
     const userId = auth().currentUser.uid;
     const mealPlanRef = collection(db, 'users', userId, 'mealPlans');
     const q = query(mealPlanRef, where("date", "==", currentDate.toISOString().split('T')[0])); 
     const querySnapshot = await getDocs(q);
     if (!querySnapshot.empty) {
       const mealPlanDoc = querySnapshot.docs[0];
       await setDoc(doc(db, 'users', userId, 'mealPlans', mealPlanDoc.id), {
         mealPlan: mealPlan,
         date: currentDate.toISOString().split('T')[0], 
         timestamp: serverTimestamp(),
       });
       console.log('Meal plan updated successfully.');
     } else {
       console.error('No meal plan found to update.');
     }
  } catch (error) {
     console.error('Error updating meal plan:', error);
  }
 };

 const generateMeal = async () => {
  setIsFetching(true);
  const apiKey = `${process.env.EXPO_PUBLIC_API_KEY}`;
  const username = userData.spoonacularData.username;
  const hash = userData.spoonacularData.hash;
  try {
    let response;
    if (userData?.diet == "None") {
      response = await axios.get(`https://api.spoonacular.com/mealplanner/generate?apiKey=${apiKey}&username=${username}&hash=${hash}&timeFrame=day&targetCalories=${userData?.dailyCalories}`);
    } else {
      response = await axios.get(`https://api.spoonacular.com/mealplanner/generate?apiKey=${apiKey}&username=${username}&hash=${hash}&timeFrame=day&targetCalories=${userData?.dailyCalories}&diet=${userData?.diet}`);
    }

    const newMealPlan = response.data;
    // Check if there is already a meal plan for the current date
    let mPres = await mealPlanPresent(currentDate)
    if (mPres == true) {
      // If yes, delete the existing meal plan from Firestore
      await deleteMealPlanFromFirestore();
    }
    // Save the new meal plan to Firestore
    saveMealPlanToFirestore(newMealPlan);
    setMealPlan(newMealPlan);
    setIsFetching(false);
  } catch (error) {
    console.error(error);
    setIsFetching(false);
  }
};

const deleteMealPlanFromFirestore = async () => {
  try {
    const userId = auth().currentUser.uid;
    const mealPlanRef = collection(db, 'users', userId, 'mealPlans');
    const q = query(mealPlanRef, where("date", "==", currentDate.toISOString().split('T')[0])); // Filter by date
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const mealPlanDoc = querySnapshot.docs[0];
      await deleteDoc(doc(db, 'users', userId, 'mealPlans', mealPlanDoc.id));
      console.log('Meal plan deleted successfully.');
    } else {
      console.error('No meal plan found to delete.');
    }
  } catch (error) {
    console.error('Error deleting meal plan:', error);
  }
};


 const fetchMealDetails = async (meal) => {
  try {
    const response = await axios.get(`https://api.spoonacular.com/recipes/${meal.id}/information?includeNutrition=true&apiKey=${process.env.EXPO_PUBLIC_API_KEY}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching meal details:', error);
  }
};
const regenerateMeal = async (meal, index) => {
  setIsFetching(true);
  const apiKey = `${process.env.EXPO_PUBLIC_API_KEY}`; 
  const username = userData.spoonacularData.username; 
  const hash = userData.spoonacularData.hash; 
  const targetCalories = userData?.dailyCalories; 
  try {
    let response;
    if(userData?.diet == "None"){
      response = await axios.get(`https://api.spoonacular.com/mealplanner/generate?apiKey=${apiKey}&username=${username}&hash=${hash}&timeFrame=day&targetCalories=${targetCalories}`);
    }
    else{
      response = await axios.get(`https://api.spoonacular.com/mealplanner/generate?apiKey=${apiKey}&username=${username}&hash=${hash}&timeFrame=day&targetCalories=${targetCalories}&diet=${userData?.diet}`);
    }
    
     
     const newMealPlan = response.data;
     // Get the new meal at the same index
     const newMeal = newMealPlan.meals[index];
     // Fetch the nutrient data for the removed and new meals
     const removedMealDetails = await fetchMealDetails(meal);
     const newMealDetails = await fetchMealDetails(newMeal);

     // Subtract the nutrients of the removed meal from the total nutrients
     const updatedNutrients = {
       calories: mealPlan.nutrients.calories - removedMealDetails.nutrition.nutrients[0].amount,
       carbohydrates: mealPlan.nutrients.carbohydrates - removedMealDetails.nutrition.nutrients[1].amount,
       fat: mealPlan.nutrients.fat - removedMealDetails.nutrition.nutrients[2].amount,
       protein: mealPlan.nutrients.protein - removedMealDetails.nutrition.nutrients[3].amount,
     };
     // Add the nutrients of the new meal to the total nutrients
     updatedNutrients.calories += newMealDetails.nutrition.nutrients[0].amount;
     updatedNutrients.carbohydrates += newMealDetails.nutrition.nutrients[1].amount;
     updatedNutrients.fat += newMealDetails.nutrition.nutrients[2].amount;
     updatedNutrients.protein += newMealDetails.nutrition.nutrients[3].amount;
     // Replace the old meal with the new one in the meal plan
     const updatedMealPlan = mealPlan.meals.map((m, i) => i === index ? newMeal : m);
     // Update the meal plan with the new meals and updated nutrients
     const updatedMealPlanObject = {...mealPlan, meals: updatedMealPlan, nutrients: updatedNutrients};
     setMealPlan(updatedMealPlanObject);
     updateMealPlanInFirestore(updatedMealPlanObject);
     setIsFetching(false); 
  } catch (error) {
     console.error(error); 
     setIsFetching(false);
  }
 };
 
 

 
 const [currentDate, setCurrentDate] = useState(new Date());

 const navigateToNextDay = () => {
 const newDate = new Date(currentDate.getTime());
 newDate.setDate(newDate.getDate() + 1);
 setCurrentDate(newDate);
 fetchMealPlanFromFirestore(newDate);
};

const navigateToPreviousDay = () => {
 const newDate = new Date(currentDate.getTime());
 newDate.setDate(newDate.getDate() - 1);
 setCurrentDate(newDate);
 fetchMealPlanFromFirestore(newDate);
};
 

 function getFormattedDate(date) {
  const today = new Date();
  const formattedDate = date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  const isToday = date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
 
  return isToday ? "Today" : formattedDate;
 }


 return (
  <ScrollView style={{ backgroundColor: theme.background}}>
    <View style={{ minHeight: '100%', backgroundColor: theme.background, paddingTop: statusBarHeight, paddingBottom: 70 }}>
      <Text style={[styles.header, { color: theme.primaryText }]}>My Meals</Text>
      <View style={styles.navigationButtonsContainer}>
        <Icon
          type="material"
          name="arrow-back"
          size={20}
          color={'deepskyblue'}
          onPress={navigateToPreviousDay}
          iconStyle={{ color: 'white' }}
          reverse={true}
          containerStyle={{}}
        />
        <Text style={{ color: theme.primaryText, fontSize: 18 }}>
          {getFormattedDate(currentDate)}
        </Text>
        <Icon
          type="material"
          name="arrow-forward"
          size={20}
          color={'deepskyblue'}
          onPress={navigateToNextDay}
          iconStyle={{ color: 'white' }}
          reverse={true}
          containerStyle={{}} 
        />
      </View>

      {isFetching && (
        <ActivityIndicator
          size="large"
          color='deepskyblue'
          style={{ marginTop: 20 }}
        />
      )}

      {!isFetching && mealPlan ? (
        <>
       <View style={{ alignItems: 'center' }}>
        <Text style={{ fontSize: 20, marginBottom: 10, color: theme.primaryText }}>{Math.ceil(mealPlan.nutrients.calories)} Calories</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', width: "100%" }}>
            <Text style={{ fontSize: 18, color: theme.primaryText }}>Carbs: {Math.ceil(mealPlan.nutrients.carbohydrates)}g</Text>
            <Divider orientation="vertical" color='deepskyblue' width={1}/>
            <Text style={{ fontSize: 18, color: theme.primaryText }}>Fat: {Math.ceil(mealPlan.nutrients.fat)}g</Text>
            <Divider orientation="vertical" color='deepskyblue' width={1}/>
            <Text style={{ fontSize: 18, color: theme.primaryText }}>Protein: {Math.ceil(mealPlan.nutrients.protein)}g</Text>
        </View>
      </View>

      {mealPlan.meals.map((meal, index) => (
        <Card key={index} containerStyle={[styles.cardContainer, { backgroundColor: theme.cardBackground }]}>
            <Card.Title style={{ fontSize: 18, fontWeight: '600', color: theme.primaryText}}>{meal.title}</Card.Title>
            <Card.Divider style={{backgroundColor: theme.primaryText}}/>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10}}>
              <View>
                <Text style={{ fontSize: 18, color: theme.primaryText }}>Ready in: {meal.readyInMinutes} minutes</Text>
                <Text style={{ fontSize: 18, color: theme.primaryText }}>Servings: {meal.servings}</Text>
              </View>

              <View>
              <Button
                title="View Details"
                onPress={() => navigation.navigate('MealDetail', { meal: meal })}
                buttonStyle={{
                  backgroundColor: 'deepskyblue',
                  borderRadius: 20,
                  height: 45,
                  width: 130,
                  marginTop: 0
                }}
              />
              <Button
                title="Regenerate"
                onPress={() => regenerateMeal(meal, index)}
                buttonStyle={{
                    backgroundColor: 'deepskyblue',
                    borderRadius: 20,
                    height: 45,
                    width: 130,
                    marginTop: 15
                }}
                />

                   </View>
            </View>
        </Card>
        ))}
        <Button
                title="Regenerate Day"
                onPress={generateMeal}
                containerStyle={{
                  marginLeft: 'auto', marginRight: 'auto', marginTop: 15
                }}
                buttonStyle={{
                  backgroundColor: 'deepskyblue',
                  borderRadius: 20,
                  height: 45,
                  width: 160,
                  marginTop: 0
                }}
              />
        </>
      ) : mealPlan === null && !isFetching &&(
        <View style={styles.generateButtonContainer}>
          <Text style={{ color: theme.primaryText, fontSize: 20 }}>No meals generated for this day.</Text>
          <Button
            title="Generate Meal Plan"
            raised={true}
            onPress={generateMeal}
            buttonStyle={{
              backgroundColor: 'deepskyblue',
              borderWidth: 2,
              borderColor: 'white',
              borderRadius: 20,
              height: 60,
            }}
            containerStyle={{
              width: 220,
              marginHorizontal: 10,
              marginVertical: 5,
              borderRadius: 30,
            }}
            titleStyle={{ fontWeight: 'normal', color: 'white', fontSize: 20 }}
          />
        </View>
      )}
    </View>
  </ScrollView>
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
 navigationButtonsContainer: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingHorizontal: 10,
 },
 generateButtonContainer:{
  marginTop: "70%",
  flex: 1,
  flexDirection: 'column',
  alignItems: 'center'
 },
 cardContainer: {
  borderWidth: 1,
  borderColor: 'deepskyblue',
  shadowColor: 'white'
},
})
