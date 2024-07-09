import React, { useContext } from 'react';
import { View, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { DarkModeContext } from '../DarkModeProvider/DarkModeProvider';
import { Divider, Text } from '@rneui/themed';

const WeightChart = ({ weightEntries, weightSystem  }) => {
  const { theme } = useContext(DarkModeContext);
 //console.log(weightEntries, weightEntries.length)
 //data[0].toFixed is weird af idk what to do just delete the entry and try again
 //mozna parseFloat na toFixed but idk -- PARSEFLOAT NA ENTRY.WEIGHT FIX ASI!
 if(weightEntries.length <= 0){
 
    return (
        <View style={{ flex: 0, marginTop: '20%', height: 30}}>
            <Text style={{color: theme.primaryText, marginLeft: 'auto', marginRight: 'auto', fontSize: 20}}>No data to graph</Text>
        </View>
      );
 }
 else{
  const chartData = {
    labels: weightEntries
    .filter((entry) => entry.timestamp) // Filter out entries without valid timestamp
    .map((entry) => {
      const date = entry.timestamp.toDate();
      const options = { day: 'numeric', month: 'short' };
      return date.toLocaleString('en-US', options); 
    }),
      datasets: [
        { 
            data: weightEntries.map((entry) =>       
            weightSystem === 'Imperial' ? parseFloat((entry.weight * 2.205).toFixed(2)) : parseFloat(entry.weight)
          ),
          color: (opacity = 1) => `deepskyblue`, // Customize the line color
          strokeWidth: 3, // Adjust the line thickness
        },
      ],
    };
    //console.log(chartData.datasets[0].data)
    return (
        <View style={{ flex: 1, backgroundColor: theme.background, marginLeft: 5}}>
            <Text style={{color: theme.primaryText, marginLeft: 'auto', marginRight: 'auto', fontSize: 20}}>Your Progress Over Time</Text>
            <Divider  style={{width:"80%",marginTop:5, marginBottom: 5, marginLeft: 'auto', marginRight: 'auto'}} color='deepskyblue' width={2} inset={false} insetType="middle" />
            <LineChart
            data={chartData}
            width={Dimensions.get('window').width - 20}
            height={220}
            yAxisSuffix={weightSystem === 'Imperial' ? 'lbs' : 'kg'}
            yAxisInterval={2}
            chartConfig={{
              backgroundGradientFrom: theme.background,
              backgroundGradientTo: theme.background,
              decimalPlaces: 2,
              color: (opacity = 0.3) => `${theme.primaryText}`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              propsForDots: {
                r: '5',
                strokeWidth: '1',
                stroke: theme.background,
              },
              propsForLabels: {
                fill: theme.primaryText, 
              },
              propsForHorizontalLabels: {
                fill: theme.primaryText,
              },
              propsForVerticalLabels: { 
                rotation: -45,
                fill: theme.primaryText,
                 
             },
            }}
            bezier 
            
          />
        </View>
      );
 }
};

export default WeightChart;
