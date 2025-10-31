import HexagonDial from '@/components/ui/timerdial';
import pageStyles from '@/constants/styles/page-styles';
import colors from '@/constants/theme';
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from 'react';
import { TextInput, TouchableOpacity, View } from 'react-native';

// This is adaped from this open source project 
// https://github.com/nabendu82/TimerReactNative/blob/master/App/index.js
const formatNumber = (number : number) => `0${number}`.slice(-2);

const getRemaining = ( time : number) => {
  const mins = Math.floor(time / 60);
  const secs = time - mins * 60;
  return { mins: formatNumber(mins), secs: formatNumber(secs) };
};

export default function TabTwoScreen() {
  const [remainingSecs, setremainingSecs] = useState(10*60);
  const [isActive, setIsActive] = useState(false);
  const [initialTime, setInitialTime] = useState(10);
  
  const { mins, secs } = getRemaining(remainingSecs);
  const timeDisplay = `${mins}:${secs}`;
  
  const ontimerpress = () => {
    setIsActive(!isActive);
  };

  const onResetPress = () => {
    setIsActive(false);
    setremainingSecs(initialTime*60);
  };
  
  const onTimeChange = (text: string) => {
    const time = parseInt(text) || 0;
    setInitialTime(time);
    setremainingSecs(time*60);
  };

  useEffect(() => {
    if (!isActive || remainingSecs === 0) return;

    const interval = setInterval(() => {
      setremainingSecs(remainingSecs => remainingSecs - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, remainingSecs]);
  
  return (
    <View style={pageStyles.timerdial}>

      <HexagonDial
        progress={1 - (remainingSecs / (initialTime * 60))}
        timeDisplay={timeDisplay}
        size={300}
        color={colors.gradientbottom}
        backgroundColor={colors.primary}
      />

      <TouchableOpacity 
        style={[pageStyles.button,{ marginTop: 60 }]}
        onPress={ontimerpress}
      >
        <Ionicons 
          name={isActive ? 'pause' : 'play'} 
          size={32} 
          color={colors.gradientbottom}
        />
      </TouchableOpacity>


      <TouchableOpacity 
        style={pageStyles.button}
        onPress={onResetPress}
      >
        <Ionicons 
          name="reload" 
          size={32} 
          color={colors.gradientbottom}
        />
      </TouchableOpacity>

        <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
          <TextInput
            style={pageStyles.input}
            keyboardType="numeric"
            value={String(initialTime)}
            onChangeText={onTimeChange}
            editable={!isActive}
            maxLength={4}
            selectTextOnFocus
            returnKeyType="done"
          />
        </View>
    </View>
  );
}