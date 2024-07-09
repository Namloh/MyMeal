import React, { useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Button } from '@rneui/themed';
import { useColorScheme } from 'react-native';

const DateOfBirthInput = ({ onDateChange }) => {
  const [date, setDate] = useState(new Date());
  const [show, setShow] = useState(false);
  const theme = useColorScheme();
  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setDate(currentDate);
    setShow(false);
    onDateChange(currentDate); // Call the callback with the selected date
  };

  const showDatepicker = () => {
    setShow(true);
  };

  return (
    <>
        <Button buttonStyle={{
                backgroundColor: "white",
                borderWidth: 0,
                borderRadius: 30,
                }}  
                titleStyle={{ fontWeight: '700', color: 'deepskyblue', fontSize: 20 }}

                containerStyle={{
                    width: 250,
                    marginHorizontal: 50,
                    marginVertical: 10,
                    borderRadius: 30,
                  }} 
                raised='true'
                onPress={showDatepicker}>Enter Date of Birth</Button>

      {show && (
        
        <DateTimePicker
          testID="dateTimePicker"
          value={date}
          mode="date"
          display="spinner"
          onChange={onChange}
          maximumDate={new Date()}
          minimumDate={new Date(1900, 1, 1)}
          positiveButton={{ label: 'OK!', textColor: 'deepskyblue' }}
          negativeButton={{ label: "Cancel", textColor: theme == "light" ? "black" : "white"}}
        />
      )}
    </>
  );
};

export default DateOfBirthInput;
