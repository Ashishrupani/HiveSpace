import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import pageStyles from '@/constants/styles/page-styles';
import GoalProgressBar, { Goal } from '@/components/ui/goalsProgressbar';
import { colors } from "../../../constants/theme";

export default function Goals() {
    // TEST DATA - Replace with API call later
    const data: Goal[] = [
        { id: '1', label: 'Save $10,000', goal: 10000, value: 3500, color: '#4CAF50' },
        { id: '2', label: 'Exercise 52 weeks', goal: 52, value: 12, color: '#FF5722' },
        { id: '3', label: 'Read 24 books', goal: 24, value: 8, color: '#2196F3' },
        { id: '4', label: 'Save $10,000', goal: 10000, value: 3500, color: '#4CAF50' },
        { id: '5', label: 'Exercise 52 weeks', goal: 52, value: 12, color: '#FF5722' },
        { id: '6', label: 'Read 24 books', goal: 24, value: 8, color: '#2196F3' },
        { id: '7', label: 'Save $10,000', goal: 10000, value: 3500, color: '#4CAF50' },
        { id: '8', label: 'Exercise 52 weeks', goal: 52, value: 12, color: '#FF5722' },
        { id: '9', label: 'Read 24 books', goal: 24, value: 8, color: '#2196F3' }
    ];

    const [goals, setGoals] = useState<Goal[]>(data);
    // we may wanna talk about adding a "completed" goals page also I think there is a argument for having a seperation between group goals and user goals but its not 
    // clear how these will be managed with the groups and no scheme is setup to store this data.
    return (
        <View style={styles.container}>

            <Text style={pageStyles.title}>My Goals</Text>
            <Text style={pageStyles.subtitle}>{goals.length} active goals</Text>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                style={styles.scrollView}>

                {goals.map((goal) => (
                    <GoalProgressBar key={goal.id} goal={goal} />
                ))}

            </ScrollView>
            <View style={styles.buttonContainer}>

                <TouchableOpacity style={pageStyles.button} onPress={() => console.log('Add goal')}>
                    <Text style={pageStyles.icon}>+</Text>
                </TouchableOpacity>

            </View>
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 20,
    },
    scrollContent: {
        paddingBottom: 20
    },
    buttonContainer: {
        marginTop: 20,
        alignItems: 'flex-end',
        paddingRight: 30
    }
});