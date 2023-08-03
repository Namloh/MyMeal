import { KeyboardAvoidingView, StyleSheet, Text, TextInput, TouchableOpacity, StatusBar, View, Dimensions } from 'react-native'
import React, {useState, useContext, useEffect} from 'react'
import { collection, doc, setDoc, getDoc, serverTimestamp, addDoc, query, orderBy, getDocs  } from 'firebase/firestore';
import auth from '@react-native-firebase/auth';
import {db} from "../firebase"
import { DarkModeContext } from '../DarkModeProvider/DarkModeProvider';
import { useFocusEffect } from '@react-navigation/native';
import WeightChart from '../Components/WeightChart';
import { useNavigation } from '@react-navigation/native'

const ProfileScreen = () => {
  const { darkMode, toggleDarkMode, theme, fetchUserData, saveDataToFirestore, userData } = useContext(DarkModeContext);
  const [editingData, setEditingData] = useState({
    field: '',
    value: '',
  });
  const [weightEntries, setWeightEntries] = useState([]);
  const navigation = useNavigation()

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

  const userId = auth().currentUser.uid;; // Replace with the actual user ID

  const fetchWeightEntries = async () => {
   
    const entries = await getUserWeightEntries(userId);
    setWeightEntries(entries);
    console.log('mam je')

  };

  useFocusEffect(React.useCallback(() => {
    //fetchUserData();
    resetEditingData();
    fetchWeightEntries();
  }, []));

  const openEditor = (field, value) => {
    setEditingData({ field, value });
  };

  const saveData = async () => {
    try {
      if(userData?.weightSystem === 'Imperial' && editingData.field === 'weight'){
        await saveDataToFirestore(editingData.field, (parseFloat(editingData.value)/2.205).toFixed(2));
      }
      else{
        await saveDataToFirestore(editingData.field, editingData.value);
      }
      if(editingData.field === 'weight'){
        const userId = auth().currentUser.uid;
        addWeightEntry(userId, editingData.value)
        fetchWeightEntries();
      }
     
      setEditingData({ field: '', value: '' });
      await fetchUserData(); // Await the fetchUserData function after saving the data
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
    <KeyboardAvoidingView
    style={{ flex: 1, backgroundColor: theme.background }}
    behavior={'padding'}>

    <View style={{ minHeight: '100%', backgroundColor: theme.background , paddingTop: statusBarHeight}}>
    <Text style={[styles.header, { color: theme.primaryText }]}>My Profile</Text>

    <View style={styles.container}>

   
      
      <View style={styles.itemContainer}>
  {editingData.field === 'name' ? (
    // Show the input popup for name if editingData.field is 'name'
    <View style={styles.inputContainer}>
      <TextInput
        style={[styles.input, { color: theme.primaryText, backgroundColor: theme.background }]}
        placeholder={`Enter name`}
        value={editingData.value}
        onChangeText={text => setEditingData({ ...editingData, value: text })}
        numberOfLines={1} // Add this line to allow text to wrap to the next line
      />
      <TouchableOpacity onPress={saveData} style={styles.editButton}>
        <Text style={[styles.editButtonText, { color: theme.btnText }]}>Save</Text>
      </TouchableOpacity>
    </View>
  ) : (
    // Show the name and "Edit" button if not in editing mode for name
    <View style={styles.itemC}>
      <Text style={[styles.label, { color: theme.primaryText }]}>Name: {userData?.name}</Text>
      <TouchableOpacity
        onPress={() => openEditor('name', userData?.name || '')}
        style={styles.editButton}
      >
        <Text style={[styles.editButtonText, { color: theme.btnText }]}>Edit</Text>
      </TouchableOpacity>
    </View>
  )}
</View>

<View style={styles.itemContainer}>
        {editingData.field === 'weight' ? (
          // Show the input popup for weight if editingData.field is 'weight'
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, { color: theme.primaryText, backgroundColor: theme.background }]}
              placeholder={`Enter weight`}
              value={`${editingData.value}`}
              onChangeText={text => setEditingData({ ...editingData, value: text })}
              keyboardType="numeric"
            />
            <TouchableOpacity onPress={saveData} style={styles.editButton}>
              <Text style={[styles.editButtonText, { color: theme.btnText }]}>Save</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Show the weight and "Edit" button if not in editing mode for weight
          <View  style={styles.itemC}>
            <Text style={[styles.label, { color: theme.primaryText }]}>Weight: {userData?.weightSystem === 'Imperial' ? `${(userData?.weight * 2.205).toFixed(2)} lbs` : `${userData?.weight} Kg`}</Text>
            <TouchableOpacity
              onPress={userData?.weightSystem === 'Imperial' ?  () => openEditor('weight', (userData?.weight*2.205).toFixed(2) || '') : () => openEditor('weight', userData?.weight || '')}
              style={styles.editButton}
            >
              <Text style={[styles.editButtonText, { color: theme.btnText }]}>Edit</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>


      
     
     
   

    </View>
    
          <WeightChart style={styles.chart} weightEntries={weightEntries} weightSystem={userData?.weightSystem}/>
        
            <TouchableOpacity
              onPress={() => navigation.navigate("WeightEntriesScreen", { weightEntries })}
              style={[styles.editButton, {width: 200, marginLeft: 'auto', marginRight: 'auto', marginBottom: '20%'}]}
            >
              <Text style={[styles.editButtonText, { color: theme.btnText }]}>Edit Weight Entries</Text>
            </TouchableOpacity>
       
  </View>
  
  </KeyboardAvoidingView>
  );
}; 

export default ProfileScreen

const styles = StyleSheet.create({
  
  itemContainer:{
    width: '90%',
    height: '60%',
    minHeight: 50,
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
  editButton: {
    padding: 10,
    backgroundColor: 'deepskyblue',
    borderRadius: 5,
    width: 100,
    height: 40,
    alignItems: 'center'

  },
  editButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 15,
  },
  container:{
    flex: 1,
    justifyContent: "flex-start",
    marginLeft: 30,
    marginTop: 30,
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
      fontSize: 20,
      maxWidth: 200,
    },
    buttonContainer: {
      width: "60%",
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 40,
      
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