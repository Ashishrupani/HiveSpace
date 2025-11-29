import React from 'react';
import { View, Text } from 'react-native';
import * as Progress from 'react-native-progress';
import cardStyles from '@/constants/styles/card-styles';
import { colors } from '@/constants/theme';

export interface Goal {
    id: string;
    label: string;
    value: number;
    goal: number;
    color?: string;
}

interface GoalProgressBarProps {
    goal: Goal;
}

export default function GoalProgressBar({ goal }: GoalProgressBarProps) {
    const progress = goal.goal > 0 ? goal.value / goal.goal : 0;
    const percentage = Math.round(progress * 100);

    return (
        <View style={cardStyles.card}>
            <View style={cardStyles.rowstyles}>
                <Text style={cardStyles.label}>{goal.label}</Text>
                <Text style={cardStyles.label}>{percentage}%</Text>
            </View>

            {/* for full documentation https://github.com/oblador/react-native-progress  */}
            <Progress.Bar
                progress={progress}
                width={null}
                height={10}
                color={goal.color || colors.primary}
                unfilledColor={colors.text}
                borderWidth={0}
                borderRadius={5}
            />

            <Text style={cardStyles.label}>
                {goal.value} / {goal.goal}
            </Text>
        </View>
    );
}