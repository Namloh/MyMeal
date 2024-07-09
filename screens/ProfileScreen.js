import { StyleSheet, Text, TextInput, TouchableOpacity, StatusBar, View, ActivityIndicator, ScrollView, Alert } from 'react-native'
import React, {useState, useContext, useEffect} from 'react'
import { collection, serverTimestamp, addDoc, query, orderBy, getDocs  } from 'firebase/firestore';
import auth from '@react-native-firebase/auth';
import {db} from "../firebase"
import { DarkModeContext } from '../DarkModeProvider/DarkModeProvider';
import { useFocusEffect } from '@react-navigation/native';
import WeightChart from '../Components/WeightChart';
import DailyActivitySection from '../Components/DailyActivitySection';
import WeightGoalSelection from '../Components/WeightGoalSelection';
import { useNavigation } from '@react-navigation/native'
import { Dialog, Icon  } from '@rneui/themed';
import DietPicker from '../Components/DietPicker';


const ProfileScreen = ({ route }) => {

  const { theme, saveDataToFirestore, userData } = useContext(DarkModeContext);
  const [editingData, setEditingData] = useState({
    field: '',
    value: '',
  }); 
  const [weightEntries, setWeightEntries] = useState([]);
  const navigation = useNavigation()
 
  const [visibleWeight, setVisibleWeight] = useState(false); 
  const [refreshLoad, setRefreshLoad] = useState(false); 

  const statusBarHeight = StatusBar.currentHeight || 0;
  

  const resetEditingData = () => {
    setEditingData({ field: '', value: '' });
  }; 

  const getUserWeightEntries = async (userId) => {
    try {
      const weightRef = collection(db, 'users', userId, 'weightEntries');
      const weightQuery = query(weightRef, orderBy('timestamp', 'asc'));
      const snapshot = await getDocs(weightQuery);
      const weightEntries = snapshot.docs.map((doc) => ({
        entryId: doc.id, // Include the entryId in the data
        ...doc.data(),
      }));
      return weightEntries;
    } catch (error) {
      console.error('Error getting weight entries:', error);
      return []; 
    }
  };

  const userId = auth().currentUser.uid; // Replace with the actual user ID

  const fetchWeightEntries = async () => {
   
    const entries = await getUserWeightEntries(userId);
    setWeightEntries(entries);

    setRefreshLoad(false)
  };

  const refreshData = async () => { 
    setRefreshLoad(true)
    fetchWeightEntries()
  };

  useEffect(() => {
    fetchWeightEntries();
  }, []);

  useFocusEffect(React.useCallback(() => {
    resetEditingData();
  }, []));

  useFocusEffect(React.useCallback(() => {
    resetEditingData();
    
    if (route.params?.weightEntries !== undefined) {
      setWeightEntries(route.params?.weightEntries);
    }
    navigation.setParams({weightEntries: undefined})
  }, [route.params?.weightEntries]));

  const openEditor = (field, value) => {
    setEditingData({ field, value });
    setVisibleWeight(true)
  };
 
  const saveData = async () => {
    try {
      if(editingData.field === 'weight'){ 
        const weightValue = parseFloat(editingData.value);
        if (isNaN(weightValue) || !/^\d+(\.\d+)?$/.test(editingData.value)) {
          Alert.alert(
            "Weight value must be a number",
            "Try again...",
            [{ text: "OK", onPress: () => {} }],
            { cancelable: true }
          );
          return;
        }  
        if(userData?.weightSystem === 'Imperial'){
          saveDataToFirestore(editingData.field, (parseFloat(editingData.value)/2.205).toFixed(2));
          const userId = auth().currentUser.uid;
          await addWeightEntry(userId, (parseFloat(editingData.value)/2.205).toFixed(2))
        }
        else{
          saveDataToFirestore(editingData.field, editingData.value);
          const userId = auth().currentUser.uid;
          await addWeightEntry(userId, editingData.value)
        }
        
        refreshData() 
      }
      if(editingData.field === 'height'){ 
        const heightValue = parseFloat(editingData.value);
        if (isNaN(heightValue) || !/^\d+(\.\d+)?$/.test(editingData.value)) {
          Alert.alert(
            "Height value must be a number",
            "Try again...",
            [{ text: "OK", onPress: () => {} }],
            { cancelable: true }
          );
          return;
        } 
        if(userData?.weightSystem === 'Imperial'){
           saveDataToFirestore(editingData.field, (parseFloat(editingData.value*2.54).toFixed(0)));
        }
        else{
           saveDataToFirestore(editingData.field, editingData.value);
        }     
      }
      if(editingData.field == 'name'){
        if(editingData.value.length <= 0){
          Alert.alert(
            "Name cannot be empty",
            "Try again...",
            [{ text: "OK", onPress: () => {} }],
            { cancelable: true }
          );
          return;
        }
        saveDataToFirestore(editingData.field, editingData.value);
      }
      if(editingData.field == 'dailyCalories'){
        if(editingData.value < 0){
          Alert.alert(
            "Daily calories can't be negative",
            "Try again...",
            [{ text: "OK", onPress: () => {} }],
            { cancelable: true }
          );
          return;
        }
        saveDataToFirestore(editingData.field, editingData.value);
      }
     
      setEditingData({ field: '', value: '' });
      setVisibleWeight(false) 
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const addWeightEntry = async (userId, weight) => {
    try {
      const weightRef = collection(db, 'users', userId, 'weightEntries');
      const newEntry = {
        weight: weight,
        timestamp: serverTimestamp(), // Use serverTimestamp to get the server time
      };
      await addDoc(weightRef, newEntry);
      console.log('Weight entry added successfully.');
    
    } catch (error) {
      console.error('Error adding weight entry:', error);
    }
  };
  

 
  return (

    <View style={{ minHeight: '100%', backgroundColor: theme.background , paddingTop: statusBarHeight}}>
    <Text style={[styles.header, { color: theme.primaryText }]}>My Profile</Text>

    <View style={styles.container}>
      <View style={styles.itemContainer}>
        <View style={styles.itemC}>
          <Text style={[styles.label, { color: theme.primaryText }]}>Name: {userData?.name}</Text>
          <TouchableOpacity
            onPress={() => openEditor('name', userData?.name || '')}
            style={styles.editButton}
          >
            <Text style={[styles.editButtonText, { color: theme.primaryText }]}>Edit</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.itemContainer}>
        <View  style={styles.itemC}>
          <Text style={[styles.label, { color: theme.primaryText }]}>Weight: {userData?.weightSystem === 'Imperial' ? `${(userData?.weight * 2.205).toFixed(2)} lbs` : `${userData?.weight} Kg`}</Text>
          <TouchableOpacity
            onPress={userData?.weightSystem === 'Imperial' ?  () => openEditor('weight', (userData?.weight*2.205).toFixed(2) || '') : () => openEditor('weight', userData?.weight || '')}
            style={styles.editButton}
          >
            <Text style={[styles.editButtonText, { color: theme.primaryText }]}>Edit</Text>
          </TouchableOpacity>
        </View>
      </View>


      <View style={styles.itemContainer}>
        <View  style={styles.itemC}>
          <Text style={[styles.label, { color: theme.primaryText }]}>Height: {userData?.weightSystem === 'Imperial' ? `${(Math.floor(userData?.height/30.48)).toFixed(0)}' ${(((userData?.height/30.48)-(Math.floor(userData?.height/30.48)))*12).toFixed(0)}"` : `${userData?.height} cm`}</Text>
          <TouchableOpacity
            onPress={userData?.weightSystem === 'Imperial' ?  () => openEditor('height', (userData?.height/2.54).toFixed(0) || '') : () => openEditor('height', userData?.height || '')}
            style={styles.editButton}
          >
            <Text style={[styles.editButtonText, { color: theme.primaryText }]}>Edit</Text>
          </TouchableOpacity>
        </View>
      </View>


      <View style={styles.itemContainer}>
        <View  style={styles.itemC}>
          <Text style={[styles.label, { color: theme.primaryText }]}>Daily Calories: {userData?.dailyCalories} kcal</Text>
          <TouchableOpacity
            onPress={() => openEditor('dailyCalories', userData?.dailyCalories)}
            style={styles.editButton}
          >
            <Text style={[styles.editButtonText, { color: theme.primaryText }]}>Edit</Text>
          </TouchableOpacity>
        </View>
      </View>

      <DietPicker style={styles.itemContainer}/>


      <DailyActivitySection />
      <WeightGoalSelection />

      
    </View>
    <Dialog
        isVisible={visibleWeight}
        onBackdropPress={() => {setVisibleWeight(false)}}    
        overlayStyle={{backgroundColor: theme.background, borderColor: theme.primaryText, borderWidth: 2}}
        >
          <Dialog.Title titleStyle={{color: theme.primaryText}} title={editingData.field === 'weight' ? "Set your current weight" : editingData.field === 'height' ? "Set your current height in inches" : "Set your new name"}/>
          <TextInput
                style={[styles.input, {borderColor: theme.primaryText, maxWidth: '100%'}]}
                placeholder={`Please enter your ${editingData.field === 'weight' ? 'weight' : editingData.field === 'height' ? "height" : "name"}`}
                value={`${editingData.value}`}
                onChangeText={text => setEditingData({ ...editingData, value: text })}
                keyboardType={editingData.field === 'name' ? 'default' : 'numeric'}
              />
          <Dialog.Actions>
            <Dialog.Button
              title="SAVE"
              onPress={
                saveData
              }
            />
          <Dialog.Button title="CANCEL" onPress={() => {setVisibleWeight(false)}} />
          </Dialog.Actions>
       </Dialog>

    <View style={{ flex: 0, marginTop: "78%" }}>
        <Icon
        type="material"
        name="refresh"
        size={20}
        color={'deepskyblue'}
        onPress={() => {
          refreshData()
        }}
        iconStyle={{color: 'white'}}
        disabled={refreshLoad}
        reverse={true}
        containerStyle={{
          padding: 0,
          position: 'absolute',
          top: -22,
          right: 15,
          zIndex: 1,
        }}
      />   
      
        {refreshLoad ? (
           <View style={{ flex: 1, backgroundColor: theme.background, marginTop: '30%', height: 440}}>
            <ActivityIndicator size="large" color="deepskyblue" />
          </View>
        ) : (
              <>
          <WeightChart weightEntries={weightEntries} weightSystem={userData?.weightSystem}/>
            {weightEntries.length >= 1 ? (
                    <TouchableOpacity
                    onPress={() => navigation.navigate("WeightEntriesScreen", { weightEntries })}
                    style={[styles.editButtonn, {width: 200, marginLeft: 'auto', marginRight: 'auto', marginTop: 240}]}
                  >
                    <Text style={[{ color: 'white', fontSize: 16, fontWeight: '600'}]}>Edit Weight Entries</Text>
                  </TouchableOpacity>
                  
                ) : (
                  <></>
                )}
          </>
          )}


     
            
           
        </View>
  </View>
  );
}; 

export default ProfileScreen

const styles = StyleSheet.create({
  
  itemContainer:{
    width: '100%',
    minHeight: 40,
  } ,
  itemC: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  } ,
  inputContainer:{
    flex: 1,
    flexDirection: 'row',
    width: "100%",
  },
  label: {
    fontSize: 20,
    maxWidth: 250,
  },
  editButtonn: {
    padding: 10,
    borderRadius: 5,
    width: 100,
    height: 45,
    alignItems: 'center',
    backgroundColor: 'deepskyblue'
  },
  editButton: {
    padding: 10,
    borderRadius: 5,
    width: 100,
    height: 45,
    alignItems: 'center',
   
  },
  editButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
    textDecorationLine: 'underline'
  },
  container:{
    flex: 1,
    justifyContent: "flex-center",
    marginLeft: 15,
    marginRight: 15,
    marginTop: 5,
    maxHeight: "10%",
},
    inputContainer: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    input: {
      backgroundColor: 'white',
      paddingHorizontal: 15,
      paddingVertical: 10,
      borderRadius: 10,
      borderColor: 'deepskyblue',
      borderWidth: 2,
      marginTop: 5,
      fontSize: 18,
      maxWidth: '100%',
    },
    button: {
      backgroundColor: "deepskyblue",
      width: "60%",
      padding: 15,
      borderRadius: 10,
      alignItems: 'center',
    },
    header:{
        fontWeight: 700,
        fontSize: 30,
        marginLeft: 10,
        marginTop: 10,
      }, 
})