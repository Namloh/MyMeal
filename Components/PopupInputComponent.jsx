import React, { useEffect, useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal , StyleSheet, Alert} from 'react-native';
import { DarkModeContext } from '../DarkModeProvider/DarkModeProvider';
import { db } from '../firebase'
import { collection, doc, setDoc, getDoc, serverTimestamp, addDoc, query, orderBy, getDocs  } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native'
import auth from '@react-native-firebase/auth';
import { Dialog, Button, ButtonGroup  } from '@rneui/themed';

const PopupInputComponent = () => {
  const popupTypes = ['name', 'weight', 'weightSystem']
  const [popups, setPopups] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [currentPopupIndex, setCurrentPopupIndex] = useState(0);
  const { darkMode, toggleDarkMode, theme, fetchUserData, saveDataToFirestore, userData } = useContext(DarkModeContext);
  const navigation = useNavigation()

  const [visibleDialog, setVisibleDialog] = useState(false); 

  const [editingData, setEditingData] = useState({
    field: '',
    value: '',
  }); 


  const addPopup = (type) => {
    setPopups((prevPopups) => [...prevPopups, type]);
  };

  const removePopup = () => {
    setPopups((prevPopups) => prevPopups.slice(0, prevPopups.length - 1));
  };



  const handleInputSubmit = () => {
    const userId = auth().currentUser.uid;
    // Do something with the input value based on the current popup type
    const currentPopupType = popups[popups.length - 1];
    console.log(`Submitted ${currentPopupType}:`, inputValue);

    if(currentPopupType === 'weight' && inputValue === ''){
      saveDataToFirestore(currentPopupType, "0")
    }
    else{
      saveDataToFirestore(currentPopupType, inputValue)
    }
   if(currentPopupType === 'weight' && inputValue !== ''){
      addWeightEntry(userId, inputValue)
   }

    removePopup();
    setInputValue('');

    // Show the next popup if available
    if (currentPopupIndex < popupTypes.length - 1) {
      setCurrentPopupIndex((prevIndex) => prevIndex + 1);
      addPopup(popupTypes[currentPopupIndex + 1]);
    }
    else{
        navigation.navigate("Home");
    }
  };  

  useEffect(() => {
    saveDataToFirestore('darkMode', false)
    saveDataToFirestore('weightSystem', "Metric");
    addPopup(popupTypes[currentPopupIndex]);
    
  }, []);


  const addWeightEntry = async (userId, weight) => {
    try {
      const weightRef = collection(db, 'users', userId, 'weightEntries');
      const newEntry = {
        weight: weight,
        timestamp: serverTimestamp(),
      };
      await addDoc(weightRef, newEntry);
      console.log('Weight entry added successfully.');
    
    } catch (error) {
      console.error('Error adding weight entry:', error);
    }
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
        
    
      }
     
      setEditingData({ field: '', value: '' });
      fetchUserData();
      
      if (currentPopupIndex < popupTypes.length - 1) {
        setCurrentPopupIndex((prevIndex) => prevIndex + 1);
        addPopup(popupTypes[currentPopupIndex + 1]);
      }
      else{
          navigation.navigate("Home");
      }
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const nextPopup = async () => {
    removePopup()
    if (currentPopupIndex < popupTypes.length - 1) {
      setCurrentPopupIndex((prevIndex) => prevIndex + 1);
      addPopup(popupTypes[currentPopupIndex + 1]);
    }
    else{
        navigation.navigate("Home");
    }
  };

  return (
    <View>
      {popups.map((type, index) => {
        if(type === 'weightSystem'){
          return(

            <Dialog
            key={index}
            isVisible={index === popups.length - 1}
            onBackdropPress={() => {nextPopup()}}
            animationType='slide'
            overlayStyle={{backgroundColor: theme.background, borderColor: theme.primaryText, borderWidth: 2, width: '90%'}}
          >
            <Dialog.Title titleStyle={{color: theme.primaryText}} title={'Set your weight system'}/>
            <ButtonGroup
            buttons={['Metric System', 'Imperial System (US)']}
            selectedIndex={editingData.value}
            onPress={(value) => {
              console.log(type, value)
              setEditingData({ field: type, value: value })
            }} 
            containerStyle={{ maxWidth: '100%', marginLeft: 'auto', marginRight: 0, backgroundColor: theme.background, borderColor: theme.primaryText }}
            textStyle={{ color: theme.primaryText, fontWeight: '700', fontSize: 15 }}
            selectedButtonStyle={{backgroundColor: 'deepskyblue'}}
          />
          <Dialog.Actions>
              <Dialog.Button
                title="SAVE" 
                onPress={
                  saveData
                }
              />
              <Dialog.Button title="LATER" onPress={() => {nextPopup()}} />
            </Dialog.Actions> 
          </Dialog>
          );
        }
        else{
          return (

          
            <Dialog
            key={index}
            isVisible={index === popups.length - 1}
            onBackdropPress={() => {nextPopup()}}
            animationType='slide'
            overlayStyle={{backgroundColor: theme.background, borderColor: theme.primaryText, borderWidth: 2}}
          >
            <Dialog.Title titleStyle={{color: theme.primaryText}} title={type === 'weight' ? "Set your current weight" : 'Set your name'}/>
            <TextInput
                    style={[styles.input, {borderColor: theme.primaryText, maxWidth: '100%'}]}
                    placeholder={`Please enter your ${type === 'weight' ? 'weight' : 'name'}`}
                    value={`${editingData.value}`}
                    onChangeText={text => setEditingData({ field: type, value: text })}
                    keyboardType="numeric"
                  /> 
       
            <Dialog.Actions>
              <Dialog.Button
                title="SAVE" 
                onPress={
                  saveData
                }
              />
              <Dialog.Button title="LATER" onPress={() => {nextPopup()}} />
            </Dialog.Actions> 
          </Dialog>
            /* 
            <Modal
              key={index}
              animationType="slide"
              transparent={true}
              visible={index === popups.length - 1} // Show only the last popup in the array
              onRequestClose={removePopup}
            >
              <View
                style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
              >
                <View style={{ backgroundColor: theme.background , padding: 20, borderRadius: 10, flex: 1, alignItems: 'center', maxHeight: 200, justifyContent: 'space-evenly', borderColor: theme.primaryText, borderWidth: 1 }}>
                
                  <TextInput
                    placeholder={`Please enter your ${type === 'weight' ? 'Weight' : 'Name'}`}
                    value={inputValue}
                    onChangeText={setInputValue}
                    style={[styles.inpText, {color: theme.primaryText  }]}
                    placeholderTextColor={theme.primaryText} 
                    textAlign='center'
                  />
   
                
                  <TouchableOpacity title="Submit" onPress={handleInputSubmit} style={styles.btn}>
                    <Text style={[styles.editButtonText, { color: theme.btnText }]}>Submit</Text>
                  </TouchableOpacity>
  
                
                  <TouchableOpacity title="Close" onPress={handleInputSubmit} style={styles.btn}>
                      <Text style={[styles.editButtonText, { color: theme.btnText }]}>Later</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          */
          );
        }
        
      })}
    </View>
  );
};

export default PopupInputComponent;


const styles = StyleSheet.create({
    btn:{
        padding: 10,
        backgroundColor: 'deepskyblue',
        borderRadius: 5,
        width: 100,
        height: 40,
        alignItems: 'center',
        
    },
    editButtonText:{
        color: 'white',
        fontWeight: 'bold',
        fontSize: 15,
    },
   
    inpText:{
        fontSize: 20,
        marginBottom: 20,
    },  
    
  })