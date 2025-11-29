import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Goal } from './GoalsContext';

interface GroupGoalsContextType {
    getGroupGoals: (groupId: string) => Goal[];
    getGroupCompletedGoals: (groupId: string) => Goal[];
    addGroupGoal: (groupId: string, goal: Goal) => void;
    updateGroupGoal: (groupId: string, goalId: string, value: number) => void;
    editGroupGoalDetails: (groupId: string, goalId: string, updates: Partial<Pick<Goal, 'label' | 'goal' | 'color' | 'dueDate'>>) => void;
    completeGroupGoal: (groupId: string, goalId: string) => void;
    deleteGroupGoal: (groupId: string, goalId: string, isCompleted?: boolean) => void;
    getTopThreeGroupGoals: (groupId: string) => Goal[];
}

const GroupGoalsContext = createContext<GroupGoalsContextType | undefined>(undefined);

export function GroupGoalsProvider({ children }: { children: ReactNode }) {
    // Store goals by groupId: { [groupId]: { active: Goal[], completed: Goal[] } }
    const [groupGoalsMap, setGroupGoalsMap] = useState<{
        [groupId: string]: { active: Goal[], completed: Goal[] }
    }>({
        '1': {
            active: [
                { id: 'g1-1', label: 'Connections', value: 4, goal: 10, color: '#0a7ea4' },
                { id: 'g1-2', label: 'Posts', value: 1, goal: 3, color: '#342A5f' },
            ],
            completed: []
        },
        '2': {
            active: [
                { id: 'g2-1', label: 'Study Sessions', value: 5, goal: 10, color: '#4CAF50' },
            ],
            completed: []
        },
        '3': {
            active: [],
            completed: []
        },
        '4': {
            active: [
                { id: 'g4-1', label: 'Team Projects', value: 2, goal: 5, color: '#FF9800' },
            ],
            completed: []
        }
    });

    const getGroupGoals = (groupId: string): Goal[] => {
        return groupGoalsMap[groupId]?.active || [];
    };

    const getGroupCompletedGoals = (groupId: string): Goal[] => {
        return groupGoalsMap[groupId]?.completed || [];
    };

    const addGroupGoal = (groupId: string, goal: Goal) => {
        setGroupGoalsMap(prev => ({
            ...prev,
            [groupId]: {
                active: [...(prev[groupId]?.active || []), goal],
                completed: prev[groupId]?.completed || []
            }
        }));
    };

    const updateGroupGoal = (groupId: string, goalId: string, valueToAdd: number) => {
        setGroupGoalsMap(prev => {
            const group = prev[groupId];
            if (!group) return prev;

            const updatedActive = group.active.map(goal => {
                if (goal.id === goalId) {
                    const newValue = Math.min(goal.value + valueToAdd, goal.goal);
                    return { ...goal, value: newValue };
                }
                return goal;
            });

            return {
                ...prev,
                [groupId]: {
                    ...group,
                    active: updatedActive
                }
            };
        });
    };

    const editGroupGoalDetails = (groupId: string, goalId: string, updates: Partial<Pick<Goal, 'label' | 'goal' | 'color' | 'dueDate'>>) => {
        setGroupGoalsMap(prev => {
            const group = prev[groupId];
            if (!group) return prev;

            const updatedActive = group.active.map(goal => {
                if (goal.id === goalId) {
                    return { ...goal, ...updates };
                }
                return goal;
            });

            return {
                ...prev,
                [groupId]: {
                    ...group,
                    active: updatedActive
                }
            };
        });
    };

    const completeGroupGoal = (groupId: string, goalId: string) => {
        setGroupGoalsMap(prev => {
            const group = prev[groupId];
            if (!group) return prev;

            const goal = group.active.find(g => g.id === goalId);
            if (!goal) return prev;

            return {
                ...prev,
                [groupId]: {
                    active: group.active.filter(g => g.id !== goalId),
                    completed: [...group.completed, { 
                        ...goal, 
                        value: goal.goal,
                        completedAt: new Date().toISOString()
                    }]
                }
            };
        });
    };

    const deleteGroupGoal = (groupId: string, goalId: string, isCompleted: boolean = false) => {
        setGroupGoalsMap(prev => {
            const group = prev[groupId];
            if (!group) return prev;

            if (isCompleted) {
                return {
                    ...prev,
                    [groupId]: {
                        ...group,
                        completed: group.completed.filter(g => g.id !== goalId)
                    }
                };
            } else {
                return {
                    ...prev,
                    [groupId]: {
                        ...group,
                        active: group.active.filter(g => g.id !== goalId)
                    }
                };
            }
        });
    };

    const getTopThreeGroupGoals = (groupId: string): Goal[] => {
        const goals = getGroupGoals(groupId);
        
        // Sort: 1) Goals with due dates first, 2) Then by completion percentage
        const sorted = [...goals].sort((a, b) => {
            if (a.dueDate && !b.dueDate) return -1;
            if (!a.dueDate && b.dueDate) return 1;
            
            const percentA = (a.value / a.goal) * 100;
            const percentB = (b.value / b.goal) * 100;
            return percentB - percentA;
        });
        return sorted.slice(0, 3);
    };

    return (
        <GroupGoalsContext.Provider value={{
            getGroupGoals,
            getGroupCompletedGoals,
            addGroupGoal,
            updateGroupGoal,
            editGroupGoalDetails,
            completeGroupGoal,
            deleteGroupGoal,
            getTopThreeGroupGoals,
        }}>
            {children}
        </GroupGoalsContext.Provider>
    );
}

export function useGroupGoals() {
    const context = useContext(GroupGoalsContext);
    if (context === undefined) {
        throw new Error('useGroupGoals must be used within a GroupGoalsProvider');
    }
    return context;
}
