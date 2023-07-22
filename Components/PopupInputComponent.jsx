import React, { useEffect, useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal , StyleSheet} from 'react-native';
import { DarkModeContext } from '../DarkModeProvider/DarkModeProvider';
import { auth, db } from '../firebase'
import { collection, doc, setDoc, getDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native'


const PopupInputComponent = () => {
  const popupTypes = ['name', 'weight']; // Add more popup types as needed
  const [popups, setPopups] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [currentPopupIndex, setCurrentPopupIndex] = useState(0);
  const { theme } = useContext(DarkModeContext);
  const navigation = useNavigation()

  const addPopup = (type) => {
    setPopups((prevPopups) => [...prevPopups, type]);
  };

  const removePopup = () => {
    setPopups((prevPopups) => prevPopups.slice(0, prevPopups.length - 1));
  };


    const saveDataToFirestore = async (fieldName, value) => {
        try {
            const userId = auth.currentUser.uid;
            const userRef = doc(collection(db, 'users'), userId);
            await setDoc(userRef, { [fieldName]: value }, { merge: true });
            console.log(`${fieldName} saved successfully!`);
        } catch (error) {
            console.error(`Error saving ${fieldName}:`, error);
    }
    };

  const handleInputSubmit = () => {
    // Do something with the input value based on the current popup type
    const currentPopupType = popups[popups.length - 1];
    console.log(`Submitted ${currentPopupType}:`, inputValue);

    saveDataToFirestore(currentPopupType, inputValue)

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
    addPopup(popupTypes[currentPopupIndex]);
    
  }, []);

  return (
    <View>
      {popups.map((type, index) => {
        return (
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
                {/* Input field for the current popup */}
                <TextInput
                  placeholder={`Please enter your ${type === 'weight' ? 'Weight' : 'Name'}`}
                  value={inputValue}
                  onChangeText={setInputValue}
                  style={[styles.inpText, {color: theme.primaryText  }]}
                  placeholderTextColor={theme.primaryText} 
                  textAlign='center'
                />

                {/* Submit button for the current popup */}
                <TouchableOpacity title="Submit" onPress={handleInputSubmit} style={styles.btn}>
                  <Text style={[styles.editButtonText, { color: theme.btnText }]}>Submit</Text>
                </TouchableOpacity>

                {/* Close button for the current popup */}
                <TouchableOpacity title="Close" onPress={removePopup} style={styles.btn}>
                    <Text style={[styles.editButtonText, { color: theme.btnText }]}>Later</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        );
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