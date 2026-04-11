import { useRouter } from 'expo-router';
import { View, Text, TouchableOpacity } from 'react-native';

export default function SavedSummaries() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>Saved Summaries</Text>
      <TouchableOpacity
        onPress={() => router.back()}
        style={{
          backgroundColor: '#007AFF',
          paddingVertical: 12,
          paddingHorizontal: 30,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
          Back to Saved Pages
        </Text>
      </TouchableOpacity>
    </View>
  );
}