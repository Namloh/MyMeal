import { StyleSheet, Text, View, StatusBar, FlatList, TouchableOpacity, ActivityIndicator  } from 'react-native'
import React, { useContext, useState, useEffect } from 'react';
import { DarkModeContext } from '../DarkModeProvider/DarkModeProvider';
import { Calendar } from 'react-native-calendars';
import { db } from '../firebase'
import { collection, doc, getDocs, deleteDoc, query, orderBy  } from 'firebase/firestore';
import auth from '@react-native-firebase/auth';
import { Button, Icon } from '@rneui/themed';
import { useNavigation } from '@react-navigation/native'

const WeightEntriesScreen = ({ route }) => {
  const { darkMode, toggleDarkMode, theme, fetchUserData, saveDataToFirestore, userData } = useContext(DarkModeContext);
  const [weightEntriesDb, setWeightEntriesDb] = useState([]);

  const [weightEntries, setWeightEntries] = useState(route.params?.weightEntries || []);

  const [markedDates, setMarkedDates] = useState({})
  const [selectedDayEntries, setSelectedDayEntries] = useState([]);
  const [noEntriesMessage, setNoEntriesMessage] = useState('');
  const [loadingStatus, setLoadingStatus] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const [weightDataByDay, setWeightDataByDay] = useState([])

  const [prevSelectedDay, setPrevSelectedDay] = useState(null); // Keep track of the previously selected day

  const weightSystem = userData?.weightSystem || 'Metric';

  const navigation = useNavigation()

  const [selectedDay, setSelectedDay] = useState(today);


  
  useEffect(() => {
    // Update marked dates and calendar theme based on weight entries
    const markedDatesData = {};
    weightEntries.forEach((entry) => {
      const date = entry.timestamp.toDate().toISOString().split('T')[0];
      markedDatesData[date] = {
        marked: true,
        dotColor: 'deepskyblue',
        selectedDotColor: 'white', 
      };
    });

    // Update the marked dates with the data and set the selected day
    setMarkedDates({ ...markedDatesData, [selectedDay]: { selected: true } });

    // Filter weight entries for the selected day
    const entriesForSelectedDay = weightEntries.filter(
      (entry) => entry.timestamp.toDate().toISOString().split('T')[0] === selectedDay
    );

    setSelectedDayEntries(entriesForSelectedDay);

    if (entriesForSelectedDay.length === 0) {
      setNoEntriesMessage('No entries for the selected day.');
    } else {
      setNoEntriesMessage('');
    }
    setIsLoading(false);
  }, [weightEntries, selectedDay]);

  const handleDayPress = (day) => {
    const selectedDate = day.dateString;
    setSelectedDay(selectedDate);
  };

  useEffect(() => {
    // Update selectedDayEntries with weight entries for today from route.params.weightEntries
    
    if (route.params?.weightEntries) {
      const entriesForToday = route.params.weightEntries.filter(
        (entry) => entry.timestamp.toDate().toISOString().split('T')[0] === today
      );

      setSelectedDayEntries(entriesForToday);
      setSelectedDay(today);

      // You can also set the noEntriesMessage state based on whether there are entries or not.
      // Example:
      if (entriesForToday.length === 0) {
        setNoEntriesMessage('No entries for today.');
      } else {
        setNoEntriesMessage('');
      }
    } else {
      // Handle the case when route.params.weightEntries is not available or null
      setSelectedDayEntries([]);
      setSelectedDay(today);
      setNoEntriesMessage('No weight entries available.');
    }

  }, [route.params, today]);



//REMOVINGGGGGGGGGGGGGGGGGGGGGGGREMOVINGGGGGGGGGGGGGGGGGGGGGGGREMOVINGGGGGGGGGGGGGGGGGGGGGGGREMOVINGGGGGGGGGGGGGGGGGGGGGGG

const handleRemoveEntryFromDatabase = async (entryId) => {
  try {
    setLoadingStatus((prevLoadingStatus) => ({
      ...prevLoadingStatus,
      [entryId]: true,
    }));
    const entryRef = doc(db, 'users', userId, 'weightEntries', entryId);
    await deleteDoc(entryRef);
    console.log('Weight entry deleted successfully.');

    const updatedWeightEntries = await getUserWeightEntries(userId);
    setWeightEntries(updatedWeightEntries);

    const latestWeightEntry = updatedWeightEntries[updatedWeightEntries.length - 1];
    console.log(latestWeightEntry)
    saveDataToFirestore('weight', latestWeightEntry.weight)
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


  const calendarTheme = {
    backgroundColor: theme.background,
    calendarBackground: theme.background,
    textSectionTitleColor: theme.primaryText,
    selectedDayBackgroundColor: 'deepskyblue',
    selectedDayTextColor: 'white', 
    todayTextColor: 'deepskyblue',
    dayTextColor: theme.primaryText,
    textDisabledColor: theme.primaryText,
    dotColor: 'deepskyblue',
    selectedDotColor: 'white', 
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

  const statusBarHeight = StatusBar.currentHeight || 0;
  const today = new Date().toISOString().split('T')[0];
  const userId = auth().currentUser.uid; // Replace with the actual user ID
  return (
    <View style={{flex: 1, backgroundColor: theme.background , paddingTop: statusBarHeight }}>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 15, borderBottomColor: theme.primaryText, borderBottomWidth: 1 }}>
        <Icon
          type="material"
          name="arrow-back"
          size={20}
          color={'deepskyblue'}
          onPress={() => navigation.navigate('Profile', { weightEntries: weightEntries })}
          iconStyle={{color: 'white'}}
          reverse={true}
          containerStyle={{
            padding: 0
          }}
        />
        <Text style={[styles.header, { color: theme.primaryText }]}>Weight Entries</Text>
      </View>
      <View style={styles.container}>
        <View style={{ height: 'auto', width: '100%' }}>
          <Calendar
            onDayPress={handleDayPress}
            theme={calendarTheme}
            markingType={'custom'}
            markedDates={markedDates}
            initialDate={today}
          />
        </View>
        {isLoading ? ( // Conditionally render activity indicator while loading
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="deepskyblue" />
          </View>
        ) : (
          <>
            {noEntriesMessage ? (
              <Text style={styles.noEntriesText}>{noEntriesMessage}</Text>
            ) : (
              <FlatList
                data={selectedDayEntries}
                keyExtractor={(item) => item.timestamp.toDate().toISOString()}
                renderItem={({ item }) => (
                  <View style={{ flex: 1,alignItems: 'center', flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: 'lightgray'}}>
                    <TouchableOpacity style={styles.entryItem}>
                      <Text style={[styles.entryWeight, {color: theme.primaryText}]}>{weightSystem === 'Imperial' ? `${(item.weight * 2.205).toFixed(2)} lbs` : `${item.weight} kg`}</Text>
                      <Text style={styles.entryTime}>{item.timestamp.toDate().toLocaleTimeString()}</Text>
                    </TouchableOpacity>
                    <Button
                      color="red"
                      onPress={() => handleRemoveEntryFromDatabase(item.entryId)}
                      loading={loadingStatus[item.entryId]}
                      buttonStyle={{width: 80}}
                    >
                      Remove
                    </Button>
                  </View>
                )}
              />
            )}
          </>
        )}
      </View>
    </View>
  )
}

export default WeightEntriesScreen


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'start',
    alignItems: 'center',
  },
  header: {
    fontWeight: '600',
    fontSize: 25,
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