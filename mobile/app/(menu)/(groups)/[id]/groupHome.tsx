import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useNavigation } from 'expo-router'
import React from 'react'
import { View, Text, Pressable} from 'react-native';

export default function GroupHome() {
    const {id} = useLocalSearchParams();
    const navigation = useNavigation();

    React.useEffect(() => {
      // keep mount/unmount logs for debugging only; do not mutate navigator here
      console.log('GroupHome mounted');
      return () => {
        console.log('GroupHome unmounted');
      };
    }, []);

  return (
    <>
      <Pressable onPress={() => navigation.goBack()} style={{ marginLeft: 18 }}>
        <Ionicons name="arrow-back" size={30} color="#fff" />
      </Pressable>
      <View>
        <Text>Group Home for Group ID: {id}</Text>
      </View>
    </>
  )
}
