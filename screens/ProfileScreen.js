import { KeyboardAvoidingView, StyleSheet, Text, TextInput, TouchableOpacity, StatusBar, View, Dimensions, ScrollView, Alert } from 'react-native'
import React, {useState, useContext, useEffect} from 'react'
import { collection, doc, setDoc, getDoc, serverTimestamp, addDoc, query, orderBy, getDocs  } from 'firebase/firestore';
import auth from '@react-native-firebase/auth';
import {db} from "../firebase"
import { DarkModeContext } from '../DarkModeProvider/DarkModeProvider';
import { useFocusEffect } from '@react-navigation/native';
import WeightChart from '../Components/WeightChart';
import { useNavigation } from '@react-navigation/native'
import { Dialog, Button, Icon  } from '@rneui/themed';

const ProfileScreen = ({ route }) => {
  const { darkMode, toggleDarkMode, theme, saveDataToFirestore, userData } = useContext(DarkModeContext);
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
        console.log(userData?.weightSystem)   
        if(userData?.weightSystem === 'Imperial'){
          await saveDataToFirestore(editingData.field, (parseFloat(editingData.value)/2.205).toFixed(2));
          const userId = auth().currentUser.uid;
          await addWeightEntry(userId, (parseFloat(editingData.value)/2.205).toFixed(2))
        }
        else{
          await saveDataToFirestore(editingData.field, editingData.value);
          const userId = auth().currentUser.uid;
          await addWeightEntry(userId, editingData.value)
        }
        
        refreshData() 
      }
      else{
        await saveDataToFirestore(editingData.field, editingData.value);
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

<ScrollView>
    <View style={{ minHeight: '100%', backgroundColor: theme.background , paddingTop: statusBarHeight}}>
    <Text style={[styles.header, { color: theme.primaryText }]}>My Profile</Text>

    <View style={styles.container}>
      <View style={styles.itemContainer}>

     {/*
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
  */}
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
  
      <Dialog
      isVisible={visibleWeight}
      onBackdropPress={() => {setVisibleWeight(false)}}
          
    overlayStyle={{backgroundColor: theme.background, borderColor: theme.primaryText, borderWidth: 2}}
    >
      <Dialog.Title titleStyle={{color: theme.primaryText}} title={editingData.field === 'weight' ? "Set your current weight" : 'Set your new name'}/>
      <TextInput
              style={[styles.input, {borderColor: theme.primaryText, maxWidth: '100%'}]}
              placeholder={`Please enter your ${editingData.field === 'weight' ? 'weight' : 'name'}`}
              value={`${editingData.value}`}
              onChangeText={text => setEditingData({ ...editingData, value: text })}
              keyboardType={editingData.field === 'weight' ? 'numeric' : 'default'}
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
     
    {/* 
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
  */ }
   
      
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


      
   

    </View>
    <View style={{ flex: 1, position: 'relative', marginTop: "65%" }}>
        <Icon
        type="material"
        name="refresh"
        size={20}
        color={'deepskyblue'}
        onPress={() => {
          refreshData()
        }}
        iconStyle={{color: theme.primaryText}}
        disabled={refreshLoad}
        reverse={true}
        containerStyle={{
          padding: 0,
          position: 'absolute',
          top: -10,
          right: 20,
          zIndex: 1,
        }}
      />
        <WeightChart style={styles.chart} weightEntries={weightEntries} weightSystem={userData?.weightSystem}/>
            
            <TouchableOpacity
              onPress={() => navigation.navigate("WeightEntriesScreen", { weightEntries })}
              style={[styles.editButton, {width: 200, marginLeft: 'auto', marginRight: 'auto', marginBottom: '20%', marginTop: 0}]}
            >
              <Text style={[styles.editButtonText, { color: theme.primaryText }]}>Edit Weight Entries</Text>
            </TouchableOpacity>
        </View>
  </View>
  </ScrollView>
 
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
      fontSize: 18,
      maxWidth: '100%',
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