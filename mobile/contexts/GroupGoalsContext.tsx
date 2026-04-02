import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useAuth } from '@clerk/expo';
import axios from 'axios';
import { Alert } from 'react-native';
import { Goal } from './GoalsContext';
import { API_BASE_URL , IPHONE_TESTING_URL} from '@/api/constants';
 
const baseUrl = API_BASE_URL;
 
interface GroupGoalsContextType {
    getGroupGoals: (groupId: string) => Goal[];
    getGroupCompletedGoals: (groupId: string) => Goal[];
    groupLoading: (groupId: string) => boolean;
    fetchGroupGoals: (groupId: string) => Promise<void>;
    addGroupGoal: (groupId: string, goal: Goal) => Promise<void>;
    updateGroupGoal: (groupId: string, goalId: string, value: number) => Promise<void>;
    editGroupGoalDetails: (groupId: string, goalId: string, updates: Partial<Pick<Goal, 'label' | 'goal' | 'color' | 'dueDate'>>) => Promise<void>;
    completeGroupGoal: (groupId: string, goalId: string) => void;
    deleteGroupGoal: (groupId: string, goalId: string, isCompleted?: boolean) => Promise<void>;
    getTopThreeGroupGoals: (groupId: string) => Goal[];
}
 
const GroupGoalsContext = createContext<GroupGoalsContextType | undefined>(undefined);
 
// Backend shape  →  frontend Goal
const mapFromBackend = (g: any): Goal => ({
    id: g.id,
    label: g.label,
    value: g.progress ?? 0,
    goal: g.target,
    color: g.color,
    dueDate: g.deadline,
    completedAt: g.completedAt,
});
 
// Frontend Goal  →  backend request body
const mapToBackend = (goal: Goal) => ({
    id: goal.id,
    label: goal.label,
    progress: goal.value,
    target: goal.goal,
    color: goal.color,
    deadline: goal.dueDate,
});
 
// ─── Provider ─────────────────────────────────────────────────────────────────
 
export function GroupGoalsProvider({ children }: { children: ReactNode }) {
    const { getToken } = useAuth();
 
    // Store goals by groupId: { [groupId]: { active: Goal[], completed: Goal[] } }
    const [groupGoalsMap, setGroupGoalsMap] = useState<{
        [groupId: string]: { active: Goal[], completed: Goal[] }
    }>({});
 
    // Track loading state per group
    const [loadingMap, setLoadingMap] = useState<{ [groupId: string]: boolean }>({});
 
    const groupLoading = (groupId: string) => loadingMap[groupId] ?? false;
 
    // Called when navigating into a group's goals screen
    const fetchGroupGoals = async (groupId: string) => {
        setLoadingMap(prev => ({ ...prev, [groupId]: true }));
        const token = await getToken();
        try {
            const response = await axios.post(
                `${baseUrl}/api/groups/fetch-goals`,
                { groupId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
 
            // Safely fall back to empty array if goals is missing
            const rawGoals = Array.isArray(response.data.goals) ? response.data.goals : [];
 
            setGroupGoalsMap(prev => ({
                ...prev,
                [groupId]: {
                    active: rawGoals.map(mapFromBackend),
                    completed: prev[groupId]?.completed || [],
                }
            }));
        } catch (error: any) {
            const message = error?.response?.data?.message ?? 'Could not load group goals. Please try again.';
            Alert.alert('Error', message);
            // Ensure the group entry exists even on failure so getGroupGoals never breaks
            setGroupGoalsMap(prev => ({
                ...prev,
                [groupId]: prev[groupId] ?? { active: [], completed: [] },
            }));
        } finally {
            setLoadingMap(prev => ({ ...prev, [groupId]: false }));
        }
    };
 
    const getGroupGoals = (groupId: string): Goal[] => {
        return groupGoalsMap[groupId]?.active || [];
    };
 
    const getGroupCompletedGoals = (groupId: string): Goal[] => {
        return groupGoalsMap[groupId]?.completed || [];
    };
 
    // Optimistically add a group goal, rollback on failure
    const addGroupGoal = async (groupId: string, goal: Goal) => {
        setGroupGoalsMap(prev => ({
            ...prev,
            [groupId]: {
                active: [...(prev[groupId]?.active || []), goal],
                completed: prev[groupId]?.completed || [],
            }
        }));
 
        const token = await getToken();
        try {
            const response = await axios.post(
                `${baseUrl}/api/groups/create-goal`,
                { groupId, ...mapToBackend(goal) },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (!response.data.success) {
                setGroupGoalsMap(prev => ({
                    ...prev,
                    [groupId]: {
                        ...prev[groupId],
                        active: (prev[groupId]?.active || []).filter(g => g.id !== goal.id),
                    }
                }));
                Alert.alert('Error', response.data.message || 'Failed to create goal');
            }
        } catch (error: any) {
            setGroupGoalsMap(prev => ({
                ...prev,
                [groupId]: {
                    ...prev[groupId],
                    active: (prev[groupId]?.active || []).filter(g => g.id !== goal.id),
                }
            }));
            const message = error?.response?.data?.message ?? 'Failed to create goal. Please try again.';
            Alert.alert('Error', message);
        }
    };
 
    // Optimistically update progress, rollback on failure
    const updateGroupGoal = async (groupId: string, goalId: string, valueToAdd: number) => {
        let previousActive: Goal[] = [];
        let updatedGoal: Goal | undefined;
 
        setGroupGoalsMap(prev => {
            const group = prev[groupId];
            if (!group) return prev;
            previousActive = group.active;
 
            const updatedActive = group.active.map(goal => {
                if (goal.id === goalId) {
                    updatedGoal = { ...goal, value: Math.min(goal.value + valueToAdd, goal.goal) };
                    return updatedGoal;
                }
                return goal;
            });
 
            return { ...prev, [groupId]: { ...group, active: updatedActive } };
        });
 
        if (!updatedGoal) return;
 
        const token = await getToken();
        try {
            const response = await axios.post(
                `${baseUrl}/api/groups/update-goal`,
                { groupId, ...mapToBackend(updatedGoal) },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (!response.data.success) {
                setGroupGoalsMap(prev => ({
                    ...prev,
                    [groupId]: { ...prev[groupId], active: previousActive }
                }));
                Alert.alert('Error', response.data.message || 'Failed to update goal');
            }
        } catch (error: any) {
            setGroupGoalsMap(prev => ({
                ...prev,
                [groupId]: { ...prev[groupId], active: previousActive }
            }));
            const message = error?.response?.data?.message ?? 'Failed to update goal. Please try again.';
            Alert.alert('Error', message);
        }
    };
 
    // Optimistically edit goal details, rollback on failure
    const editGroupGoalDetails = async (
        groupId: string,
        goalId: string,
        updates: Partial<Pick<Goal, 'label' | 'goal' | 'color' | 'dueDate'>>
    ) => {
        let previousActive: Goal[] = [];
        let updatedGoal: Goal | undefined;
 
        setGroupGoalsMap(prev => {
            const group = prev[groupId];
            if (!group) return prev;
            previousActive = group.active;
 
            const updatedActive = group.active.map(goal => {
                if (goal.id === goalId) {
                    updatedGoal = { ...goal, ...updates };
                    return updatedGoal;
                }
                return goal;
            });
 
            return { ...prev, [groupId]: { ...group, active: updatedActive } };
        });
 
        if (!updatedGoal) return;
 
        const token = await getToken();
        try {
            const response = await axios.post(
                `${baseUrl}/api/groups/update-goal`,
                { groupId, ...mapToBackend(updatedGoal) },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (!response.data.success) {
                setGroupGoalsMap(prev => ({
                    ...prev,
                    [groupId]: { ...prev[groupId], active: previousActive }
                }));
                Alert.alert('Error', response.data.message || 'Failed to edit goal');
            }
        } catch (error: any) {
            setGroupGoalsMap(prev => ({
                ...prev,
                [groupId]: { ...prev[groupId], active: previousActive }
            }));
            const message = error?.response?.data?.message ?? 'Failed to edit goal. Please try again.';
            Alert.alert('Error', message);
        }
    };
 
    // Moves a goal to the completed list — local only
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
                        completedAt: new Date().toISOString(),
                    }],
                }
            };
        });
    };
 
    // Optimistically delete an active goal, rollback on failure.
    // Completed goals are local-only so no API call needed for those.
    const deleteGroupGoal = async (groupId: string, goalId: string, isCompleted: boolean = false) => {
        if (isCompleted) {
            setGroupGoalsMap(prev => ({
                ...prev,
                [groupId]: {
                    ...prev[groupId],
                    completed: (prev[groupId]?.completed || []).filter(g => g.id !== goalId),
                }
            }));
            return;
        }
 
        let previousActive: Goal[] = [];
        setGroupGoalsMap(prev => {
            const group = prev[groupId];
            if (!group) return prev;
            previousActive = group.active;
            return { ...prev, [groupId]: { ...group, active: group.active.filter(g => g.id !== goalId) } };
        });
 
        const token = await getToken();
        try {
            const response = await axios.post(
                `${baseUrl}/api/groups/delete-goal`,
                { groupId, goalId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (!response.data.success) {
                setGroupGoalsMap(prev => ({
                    ...prev,
                    [groupId]: { ...prev[groupId], active: previousActive }
                }));
                Alert.alert('Error', response.data.message || 'Failed to delete goal');
            }
        } catch (error: any) {
            setGroupGoalsMap(prev => ({
                ...prev,
                [groupId]: { ...prev[groupId], active: previousActive }
            }));
            const message = error?.response?.data?.message ?? 'Failed to delete goal. Please try again.';
            Alert.alert('Error', message);
        }
    };
 
    const getTopThreeGroupGoals = (groupId: string): Goal[] => {
        const goals = getGroupGoals(groupId);
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
            groupLoading,
            fetchGroupGoals,
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