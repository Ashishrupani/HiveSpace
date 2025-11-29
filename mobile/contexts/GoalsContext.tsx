import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Goal {
    id: string;
    label: string;
    value: number;
    goal: number;
    color?: string;
    dueDate?: string; // ISO date string
    completedAt?: string; // ISO date string
}

interface GoalsContextType {
    goals: Goal[];
    completedGoals: Goal[];
    addGoal: (goal: Goal) => void;
    updateGoal: (id: string, value: number) => void;
    completeGoal: (id: string) => void;
    deleteGoal: (id: string, isCompleted?: boolean) => void;
    getTopThreeGoals: () => Goal[];
}

const GoalsContext = createContext<GoalsContextType | undefined>(undefined);

export function GoalsProvider({ children }: { children: ReactNode }) {
    // Initial test data
    const initialData: Goal[] = [
        { id: '1', label: 'Save $10,000', goal: 10000, value: 3500, color: '#4CAF50' },
        { id: '2', label: 'Exercise 52 weeks', goal: 52, value: 12, color: '#FF5722' },
        { id: '3', label: 'Read 24 books', goal: 24, value: 8, color: '#2196F3' },
    ];

    const [goals, setGoals] = useState<Goal[]>(initialData);
    const [completedGoals, setCompletedGoals] = useState<Goal[]>([]);

    const addGoal = (goal: Goal) => {
        setGoals([...goals, goal]);
    };

    const updateGoal = (id: string, valueToAdd: number) => {
        setGoals(goals.map(goal => {
            if (goal.id === id) {
                const newValue = Math.min(goal.value + valueToAdd, goal.goal);
                return { ...goal, value: newValue };
            }
            return goal;
        }));
    };
    const completeGoal = (id: string) => {
        const goal = goals.find(g => g.id === id);
        if (goal) {
            setGoals(goals.filter(g => g.id !== id));
            setCompletedGoals([...completedGoals, { 
                ...goal, 
                value: goal.goal,
                completedAt: new Date().toISOString()
            }]);
        }
    };

    const deleteGoal = (id: string, isCompleted: boolean = false) => {
        if (isCompleted) {
            setCompletedGoals(completedGoals.filter(g => g.id !== id));
        } else {
            setGoals(goals.filter(g => g.id !== id));
        }
    };

    const getTopThreeGoals = (): Goal[] => {
        // Sort: 1) Goals with due dates first, 2) Then by completion percentage (closest to 100%)
        const sorted = [...goals].sort((a, b) => {
            // If one has a due date and the other doesn't, prioritize the one with a due date
            if (a.dueDate && !b.dueDate) return -1;
            if (!a.dueDate && b.dueDate) return 1;
            
            // If both have due dates or both don't, sort by completion percentage
            const percentA = (a.value / a.goal) * 100;
            const percentB = (b.value / b.goal) * 100;
            return percentB - percentA; // Descending order (highest percentage first)
        });
        return sorted.slice(0, 3);
    };

    return (
        <GoalsContext.Provider value={{
            goals,
            completedGoals,
            addGoal,
            updateGoal,
            completeGoal,
            deleteGoal,
            getTopThreeGoals,
        }}>
            {children}
        </GoalsContext.Provider>
    );
}

export function useGoals() {
    const context = useContext(GoalsContext);
    if (context === undefined) {
        throw new Error('useGoals must be used within a GoalsProvider');
    }
    return context;
}
