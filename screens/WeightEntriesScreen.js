import { StyleSheet, Text, View, StatusBar, FlatList, TouchableOpacity  } from 'react-native'
import React, { useContext, useState, useEffect } from 'react';
import { DarkModeContext } from '../DarkModeProvider/DarkModeProvider';
import { Calendar } from 'react-native-calendars';
import { db } from '../firebase'
import { collection, doc, getDocs, deleteDoc, query, orderBy  } from 'firebase/firestore';
import auth from '@react-native-firebase/auth';

import { Button } from '@rneui/themed';


const WeightEntriesScreen = ({ route }) => {
  const { darkMode, toggleDarkMode, theme, fetchUserData, saveDataToFirestore, userData } = useContext(DarkModeContext);
  const [weightEntries, setWeightEntries] = useState([])
  
  const [weightDataByDay, setWeightDataByDay] = useState([])
  const [markedDates, setMarkedDates] = useState({})
  const [prevSelectedDay, setPrevSelectedDay] = useState(null); // Keep track of the previously selected day
  const [loadingStatus, setLoadingStatus] = useState({});
  

  const [selectedDay, setSelectedDay] = useState(today);
  const [selectedDayEntries, setSelectedDayEntries] = useState([]);
  const [noEntriesMessage, setNoEntriesMessage] = useState('');

  const handleDayPress = (day) => {
    const date = day.dateString;
    setSelectedDay(date); // Update the selected day separately
    const entries = weightDataByDay[date] || [];
    setSelectedDayEntries(entries);

    // Set the message based on the number of entries
    if (entries.length === 0) {
      setNoEntriesMessage('No entries for this day');
    } else {
      setNoEntriesMessage(''); 
    }

    const updatedMarkedDates = {
      ...markedDates,
      [date]: {
        ...markedDates[date],
        selected: true, // Set this to true to highlight the selected day
        selectedTextColor: 'white',
        selectedColor: 'deepskyblue',
      },
    };
    if (prevSelectedDay && prevSelectedDay !== date) {
      updatedMarkedDates[prevSelectedDay] = {
        ...markedDates[prevSelectedDay],
        selected: false, // Set this to false to remove the highlight from the previous day
        selectedColor: undefined, 
      };
    }

    setMarkedDates(updatedMarkedDates);
    setPrevSelectedDay(date)
  };

  // Get today's date in the format "YYYY-MM-DD"
  const today = new Date().toISOString().split('T')[0];
  const userId = auth().currentUser.uid; // Replace with the actual user ID


  const loadWeightEntries = async () => {
    try {
      const weightEntries = await getWeightEntriesFromDatabase();

      setWeightEntries(weightEntries);

      // Calculate weightDataByDay using the latest weightEntries data
      const updatedWeightDataByDay = weightEntries.reduce((data, entry) => {
        const date = entry.timestamp.toDate().toISOString().split('T')[0];
        if (!data[date]) {
          data[date] = [];
        }
        data[date].push(entry);
        return data;
      }, {});
      setWeightDataByDay(updatedWeightDataByDay);

      updateMarkedDates(updatedWeightDataByDay);
      // After loading entries, update the selected day entries
      const entries = updatedWeightDataByDay[selectedDay] || [];
      setSelectedDayEntries(entries);

    } catch (error) {
      // Handle the error, if any
      console.error('Error loading weight entries:', error);
    }
  };


  const getWeightEntriesFromDatabase = async () => {
    try {
      const weightRef = collection(db, 'users', userId, 'weightEntries');
      const weightQuery = query(weightRef, orderBy('timestamp', 'asc'));
      const querySnapshot = await getDocs(weightQuery);
      const weightEntries = querySnapshot.docs.map((doc) => {
        return { id: doc.id, ...doc.data() };
      });
      setWeightEntries(weightEntries);

      // Calculate weightDataByDay using the latest weightEntries data
      const updatedWeightDataByDay = weightEntries.reduce((data, entry) => {
        const date = entry.timestamp.toDate().toISOString().split('T')[0];
        if (!data[date]) {
          data[date] = [];
        }
        data[date].push(entry);
        return data;
      }, {});
      setWeightDataByDay(updatedWeightDataByDay);

      // Update the markedDates state based on the weightDataByDay
      const updatedMarkedDates = {
        ...Object.keys(updatedWeightDataByDay).reduce((dates, date) => {
          dates[date] = { marked: true, selectedTextColor: 'white' };
          return dates;
        }, {}),
      
      };
      setMarkedDates(updatedMarkedDates);
      return weightEntries
    } catch (error) {
      console.error('Error getting weight entries:', error);
    }
  };

  useEffect(() => {
    loadWeightEntries()
  }, []);


  const calendarTheme = {
    backgroundColor: theme.background,
    calendarBackground: theme.background,
    textSectionTitleColor: theme.primaryText,
    selectedDayBackgroundColor: 'deepskyblue',
    selectedDayTextColor: 'deepskyblue',
    todayTextColor: 'deepskyblue',
    dayTextColor: theme.primaryText,
    textDisabledColor: theme.primaryText,
    dotColor: 'deepskyblue',
    selectedDotColor: theme.background,
    arrowColor: 'deepskyblue',
    monthTextColor: theme.primaryText,
    indicatorColor: 'deepskyblue',
    textDayFontFamily: 'monospace',
    textMonthFontFamily: 'monospace',
    textDayHeaderFontFamily: 'monospace',
    textDayFontWeight: '300',
    textMonthFontWeight: 'bold',
    textDayHeaderFontWeight: '300',
    textDayFontSize: 16,
    textMonthFontSize: 16,
    textDayHeaderFontSize: 16,
   
  };


  const handleRemoveEntryFromDatabase = async (entryId) => {
    try {
      setLoadingStatus((prevLoadingStatus) => ({
        ...prevLoadingStatus,
        [entryId]: true,
      }));
      const entryRef = doc(db, 'users', userId, 'weightEntries', entryId);
      await deleteDoc(entryRef);
      console.log('Weight entry deleted successfully.');
      await loadWeightEntries();
      setLoadingStatus((prevLoadingStatus) => ({
        ...prevLoadingStatus,
        [entryId]: false,
      }));
    } catch (error) {
      console.error('Error deleting weight entry:', error);
      setLoadingStatus((prevLoadingStatus) => ({
        ...prevLoadingStatus,
        [entryId]: false,
      }));
    }
  };
  
 
  const updateUserWeight = () => {
    const latestEntry = weightEntries.length > 0 ? weightEntries[weightEntries.length - 1] : null;

    if (latestEntry) {
      const userWeight = latestEntry.weight;
      
      saveDataToFirestore("weight", userWeight)
    } else {

    }
  };
  useEffect(() => {
    // Whenever weightEntries changes, update the user's weight
    updateUserWeight();
  }, [weightEntries]);



  const updateMarkedDates = (dataByDay) => {
    const updatedMarkedDates = {
      ...Object.keys(dataByDay).reduce((dates, date) => {
        dates[date] = { marked: true, selectedTextColor: 'white' };
        return dates;
      }, {}),
    };
    setMarkedDates(updatedMarkedDates);
  };
  return (
    <View style={{ minHeight: '100%', backgroundColor: theme.background }}>
    <View style={styles.container}>
      {/* Wrap the Calendar inside a separate View with fixed height */}
      <View style={{ height: 'auto', width: '100%' }}>
        <Calendar
          onDayPress={handleDayPress}
          theme={calendarTheme}
          markingType={'custom'}
          markedDates={markedDates}
          initialDate={today}
        />
      </View>
      {noEntriesMessage ? (
        <Text style={styles.noEntriesText}>{noEntriesMessage}</Text>
      ) : (
        <FlatList
          data={selectedDayEntries}
          keyExtractor={(item) => item.timestamp.toDate().toISOString()}
          renderItem={({ item }) => (
            <View style={{ flex: 1,alignItems: 'center', flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: 'lightgray'}}>
              <TouchableOpacity style={styles.entryItem}>
                <Text style={styles.entryWeight}>{`${item.weight} kg`}</Text>
                <Text style={styles.entryTime}>{item.timestamp.toDate().toLocaleTimeString()}</Text>
              </TouchableOpacity>
              <Button
                color="red"
                onPress={() => handleRemoveEntryFromDatabase(item.id)}
                loading={loadingStatus[item.id]}
                buttonStyle={{width: 80}}
              >
                Remove
              </Button>
             </View>
          )}
        />
      )}
    </View>
  </View>
  )
}

export default WeightEntriesScreen


const styles = StyleSheet.create({
  container: {
    flex: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontWeight: '700',
    fontSize: 30,
    marginLeft: 10,
    marginTop: 10,
  },
  entryItem: {
    padding: 10,
    marginRight: 0,
    width: 120
  },
  entryWeight: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  entryTime: {
    fontSize: 16,
    color: 'gray',
  },
  noEntriesText: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
    marginTop: 20,
  },
});