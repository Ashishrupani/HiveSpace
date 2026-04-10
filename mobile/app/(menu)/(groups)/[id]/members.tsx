import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import BackButton from '@/components/ui/BackButton';

export default function GroupMembersPage() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <BackButton />
      <View style={styles.content}>
        <Text style={styles.title}>View Members</Text>
        <Text style={styles.subtitle}>This page is a placeholder and does not load any database data.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 24,
  },
  content: {
    marginTop: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#342A5f',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#6b6b85',
    lineHeight: 22,
  },
});
