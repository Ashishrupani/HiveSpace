'use client';
import React from 'react';
import { View, Text, ImageBackground } from 'react-native';
import BaseCard from './baseCard';
import { useRouter } from 'expo-router';

export default function ChatCard({ 
  width = 150, 
  height = 150,
  groupId 
}: { 
  width?: number; 
  height?: number;
  groupId?: string;
}) {
  const router = useRouter();
  
  return (
    <BaseCard
      width={width}
      height={height}
      onPress={() => router.push(`/(groups)/${groupId}/chat` as any)}  // ← CHANGE THIS
    >
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 10 }}>
        {/* <ImageBackground source={require('../../assets/hive.png')} style={{ width: 150, height: 150 }}> */}
          <Text style={{ textAlign: 'right' }}>🐝 Chat</Text>
        {/* </ImageBackground> */}
      </View>
    </BaseCard>
  );
}