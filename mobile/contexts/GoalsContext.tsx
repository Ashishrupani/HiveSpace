import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@clerk/expo';
import axios from 'axios';
import { Alert } from 'react-native';
import { API_BASE_URL , IPHONE_TESTING_URL} from '@/api/constants';
 
export interface Goal {
    id: string;
    label: string;
    value: number;
    goal: number;
    color?: string;
    dueDate?: string;
    completedAt?: string;
}
 
interface GoalsContextType {
    goals: Goal[];
    completedGoals: Goal[];
    loading: boolean;
    addGoal: (goal: Goal) => Promise<void>;
    updateGoal: (id: string, value: number) => Promise<void>;
    editGoalDetails: (id: string, updates: Partial<Pick<Goal, 'label' | 'goal' | 'color' | 'dueDate'>>) => Promise<void>;
    completeGoal: (id: string) => void;
    deleteGoal: (id: string, isCompleted?: boolean) => Promise<void>;
    getTopThreeGoals: () => Goal[];
}
 
const GoalsContext = createContext<GoalsContextType | undefined>(undefined);
 

const mapFromBackend = (g: any): Goal => ({
    id: g.id,
    label: g.label,
    value: g.progress ?? 0,
    goal: g.target,
    color: g.color,
    dueDate: g.deadline,
    completedAt: g.completedAt,
});
 

const mapToBackend = (goal: Goal) => ({
    id: goal.id,
    label: goal.label,
    progress: goal.value,
    target: goal.goal,
    color: goal.color,
    deadline: goal.dueDate,
});
 
// ─── Provider ─────────────────────────────────────────────────────────────────
 
export function GoalsProvider({ children }: { children: ReactNode }) {
    const { getToken } = useAuth();
 
    const [goals, setGoals] = useState<Goal[]>([]);
    const [completedGoals, setCompletedGoals] = useState<Goal[]>([]);
    const [loading, setLoading] = useState(true);

    const baseUrl = API_BASE_URL;
 
    // Fetch goals on mount
    useEffect(() => {
        const loadGoals = async () => {
            const token = await getToken();
            try {
                // Ensure user document exists before fetching goals
                await axios.get(`${baseUrl}/api/home/dashboard`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const response = await axios.get(
                    `${baseUrl}/api/home/fetch-goals`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                if (response.data.success) {
                    setGoals(response.data.goals.map(mapFromBackend));
                }
            } catch (error: any) {
                const message = error?.response?.data?.message ?? 'Could not load goals. Please try again.';
                Alert.alert('Error', message);
            } finally {
                setLoading(false);
            }
        };
        loadGoals();
    }, []);
 
    // Optimistically add a goal, rollback on failure
    const addGoal = async (goal: Goal) => {
        setGoals(prev => [...prev, goal]);
        const token = await getToken();
        try {
            const response = await axios.post(
                `${baseUrl}/api/home/create-goal`,
                mapToBackend(goal),
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            if (!response.data.success) {
                setGoals(prev => prev.filter(g => g.id !== goal.id));
                Alert.alert('Error', response.data.message || 'Failed to create goal');
            }
        } catch (error: any) {
            setGoals(prev => prev.filter(g => g.id !== goal.id));
            const message = error?.response?.data?.message ?? 'Failed to create goal. Please try again.';
            Alert.alert('Error', message);
        }
    };
 
    // Optimistically add progress, rollback on failure
    const updateGoal = async (id: string, valueToAdd: number) => {
        let previousGoals: Goal[] = [];
        let updatedGoal: Goal | undefined;
 
        setGoals(prev => {
            previousGoals = prev;
            return prev.map(goal => {
                if (goal.id === id) {
                    updatedGoal = { ...goal, value: Math.min(goal.value + valueToAdd, goal.goal) };
                    return updatedGoal;
                }
                return goal;
            });
        });
 
        if (!updatedGoal) return;
 
        const token = await getToken();
        try {
            const response = await axios.post(
                `${baseUrl}/api/home/update-goal`,
                mapToBackend(updatedGoal),
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            if (!response.data.success) {
                setGoals(previousGoals);
                Alert.alert('Error', response.data.message || 'Failed to update goal');
            }
        } catch (error: any) {
            setGoals(previousGoals);
            const message = error?.response?.data?.message ?? 'Failed to update goal. Please try again.';
            Alert.alert('Error', message);
        }
    };
 
    // Optimistically edit goal details, rollback on failure
    const editGoalDetails = async (
        id: string,
        updates: Partial<Pick<Goal, 'label' | 'goal' | 'color' | 'dueDate'>>
    ) => {
        let previousGoals: Goal[] = [];
        let updatedGoal: Goal | undefined;
 
        setGoals(prev => {
            previousGoals = prev;
            return prev.map(goal => {
                if (goal.id === id) {
                    updatedGoal = { ...goal, ...updates };
                    return updatedGoal;
                }
                return goal;
            });
        });
 
        if (!updatedGoal) return;
 
        const token = await getToken();
        try {
            const response = await axios.post(
                `${baseUrl}/api/home/update-goal`,
                mapToBackend(updatedGoal),
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            if (!response.data.success) {
                setGoals(previousGoals);
                Alert.alert('Error', response.data.message || 'Failed to edit goal');
            }
        } catch (error: any) {
            setGoals(previousGoals);
            const message = error?.response?.data?.message ?? 'Failed to edit goal. Please try again.';
            Alert.alert('Error', message);
        }
    };
 
    // Moves a goal to the completed list — local only since completed goals are not stored in the backend
    const completeGoal = (id: string) => {
        const goal = goals.find(g => g.id === id);
        if (goal) {
            setGoals(prev => prev.filter(g => g.id !== id));
            setCompletedGoals(prev => [
                ...prev,
                { ...goal, value: goal.goal, completedAt: new Date().toISOString() },
            ]);
        }

    };
 
    // Optimistically delete an active goal, rollback on failure.
    // Completed goals are local-only so no API call is needed for those.
    const deleteGoal = async (id: string, isCompleted: boolean = false) => {
        if (isCompleted) {
            setCompletedGoals(prev => prev.filter(g => g.id !== id));
            return;
        }
 
        let previousGoals: Goal[] = [];
        setGoals(prev => {
            previousGoals = prev;
            return prev.filter(g => g.id !== id);
        });
 
        const token = await getToken();
        try {
            const response = await axios.post(
                `${baseUrl}/api/home/delete-goal`,
                { id },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            if (!response.data.success) {
                setGoals(previousGoals);
                Alert.alert('Error', response.data.message || 'Failed to delete goal');
            }
        } catch (error: any) {
            setGoals(previousGoals);
            const message = error?.response?.data?.message ?? 'Failed to delete goal. Please try again.';
            Alert.alert('Error', message);
        }
    };
 
    // Returns top 3 goals: due-date goals first, then sorted by completion %
    const getTopThreeGoals = (): Goal[] => {
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
        <GoalsContext.Provider
            value={{
                goals,
                completedGoals,
                loading,
                addGoal,
                updateGoal,
                editGoalDetails,
                completeGoal,
                deleteGoal,
                getTopThreeGoals,
            }}
        >
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