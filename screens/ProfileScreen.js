import { KeyboardAvoidingView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, {useState, useContext} from 'react'
import { collection, doc, setDoc, getDoc } from 'firebase/firestore';
import { auth } from '../firebase'
import {db} from "../firebase"
import { DarkModeContext } from '../DarkModeProvider/DarkModeProvider';
import { useFocusEffect } from '@react-navigation/native';
import { AuthErrorCodes } from 'firebase/auth';
import { Center } from 'native-base';

const ProfileScreen = () => {
  const { theme } = useContext(DarkModeContext);
  const [userData, setUserData] = useState(null);
  const [editingData, setEditingData] = useState({
    field: '',
    value: '',
  });

  const fetchUserData = async () => {
    try {
      const userId = auth.currentUser.uid;
      const userRef = doc(collection(db, 'users'), userId);
      const userSnapshot = await getDoc(userRef);

      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();
        console.log('User data:', userData);
        setUserData(userData);
      } else {
        console.log('No user data found.');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useFocusEffect(React.useCallback(() => {
    fetchUserData();
  }, []));

  const openEditor = (field, value) => {
    setEditingData({ field, value });
  };

  const saveData = async () => {
    try {
      await saveDataToFirestore(editingData.field, editingData.value);
      setEditingData({ field: '', value: '' });
      await fetchUserData(); // Await the fetchUserData function after saving the data
    } catch (error) {
      console.error('Error saving data:', error);
    }
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

  return (
    <View style={{ minHeight: '100%', backgroundColor: theme.background }}>
    <Text style={[styles.header, { color: theme.primaryText }]}>My Profile</Text>

    <View style={styles.container}>

      <View style={styles.itemContainer}>
        {editingData.field === 'weight' ? (
          // Show the input popup for weight if editingData.field is 'weight'
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, { color: theme.primaryText }]}
              placeholder={`Enter weight`}
              value={editingData.value}
              onChangeText={text => setEditingData({ ...editingData, value: text })}
              keyboardType="numeric"
            />
            <TouchableOpacity onPress={saveData} style={styles.button}>
              <Text style={[styles.buttonText, { color: theme.btnText }]}>Save</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Show the weight and "Edit" button if not in editing mode for weight
          <View  style={styles.itemC}>
            <Text style={[styles.label, { color: theme.primaryText }]}>Weight: {userData?.weight}</Text>
            <TouchableOpacity
              onPress={() => openEditor('weight', userData?.weight || '')}
              style={styles.editButton}
            >
              <Text style={[styles.editButtonText, { color: theme.btnText }]}>Edit</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.itemContainer}>
        {editingData.field === 'name' ? (
          // Show the input popup for name if editingData.field is 'name'
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, { color: theme.primaryText }]}
              placeholder={`Enter name`}
              value={editingData.value}
              onChangeText={text => setEditingData({ ...editingData, value: text })}
            />
            <TouchableOpacity onPress={saveData} style={styles.button}>
              <Text style={[styles.buttonText, { color: theme.btnText }]}>Save</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Show the name and "Edit" button if not in editing mode for name
          <View  style={styles.itemC}>
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

    </View>
  </View>
  );
};

export default ProfileScreen

const styles = StyleSheet.create({
  itemContainer:{
    width: '80%',
  } ,
  itemC: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    alignItems: 'center'
  } ,
  inputContainer:{
    flex: 1,
    flexDirection: 'row',
    width: "100%",
  },
  label: {
    fontSize: 20,
  
  },
  editButton: {
    padding: 10,
    backgroundColor: 'deepskyblue',
    borderRadius: 5,
    width: '100px',
    alignItems: 'center'
  },
  editButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 15,
  },
    container:{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
       
    },
    inputContainer: {
      width: '80%'
    },
    input: {
      backgroundColor: 'white',
      paddingHorizontal: 15,
      paddingVertical: 10,
      borderRadius: 10,
      marginTop: 5,

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