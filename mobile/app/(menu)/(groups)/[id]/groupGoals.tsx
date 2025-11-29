import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import pageStyles from '@/constants/styles/page-styles';
import GoalProgressBar from '@/components/ui/goalsProgressbar';
import { colors } from "../../../../constants/theme";
import { useGroupGoals } from '@/contexts/GroupGoalsContext';
import { Goal } from '@/contexts/GoalsContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import BackButton from '@/components/ui/BackButton';

export default function GroupGoals() {
    const { id } = useLocalSearchParams();
    const groupId = Array.isArray(id) ? id[0] : id || '1';
    const router = useRouter();
    
    const { 
        getGroupGoals, 
        getGroupCompletedGoals, 
        addGroupGoal, 
        updateGroupGoal, 
        editGroupGoalDetails,
        completeGroupGoal, 
        deleteGroupGoal 
    } = useGroupGoals();
    
    const goals = getGroupGoals(groupId);
    const completedGoals = getGroupCompletedGoals(groupId);
    
    const [showAddModal, setShowAddModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
    const [showCompleted, setShowCompleted] = useState(false);
    
    // Form state
    const [newGoalLabel, setNewGoalLabel] = useState('');
    const [newGoalTarget, setNewGoalTarget] = useState('');
    const [newGoalColor, setNewGoalColor] = useState('#4CAF50');
    const [newGoalDueDate, setNewGoalDueDate] = useState('');
    const [updateValue, setUpdateValue] = useState('');
    
    // Edit form state
    const [editLabel, setEditLabel] = useState('');
    const [editTarget, setEditTarget] = useState('');
    const [editColor, setEditColor] = useState('#4CAF50');
    const [editDueDate, setEditDueDate] = useState('');

    const colors_palette = ['#4CAF50', '#FF5722', '#2196F3', '#9C27B0', '#FF9800', '#00BCD4'];

    const handleAddGoal = () => {
        if (!newGoalLabel.trim() || !newGoalTarget.trim()) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        const target = parseFloat(newGoalTarget);
        if (isNaN(target) || target <= 0) {
            Alert.alert('Error', 'Please enter a valid target number');
            return;
        }

        const newGoal: Goal = {
            id: `g${groupId}-${Date.now()}`,
            label: newGoalLabel,
            goal: target,
            value: 0,
            color: newGoalColor,
            dueDate: newGoalDueDate || undefined,
        };

        addGroupGoal(groupId, newGoal);
        setNewGoalLabel('');
        setNewGoalTarget('');
        setNewGoalColor('#4CAF50');
        setNewGoalDueDate('');
        setShowAddModal(false);
    };

    const handleUpdateProgress = () => {
        if (!selectedGoal || !updateValue.trim()) {
            Alert.alert('Error', 'Please enter a value');
            return;
        }

        const value = parseFloat(updateValue);
        if (isNaN(value) || value < 0) {
            Alert.alert('Error', 'Please enter a valid number');
            return;
        }

        updateGroupGoal(groupId, selectedGoal.id, value);
        
        const goal = goals.find(g => g.id === selectedGoal.id);
        if (goal && (goal.value + value) >= goal.goal) {
            Alert.alert('🎉 Goal Completed!', `Congratulations on completing "${goal.label}"!`);
        }

        setUpdateValue('');
        setShowUpdateModal(false);
        setSelectedGoal(null);
    };

    const handleCompleteGoal = (goal: Goal) => {
        Alert.alert(
            'Complete Goal',
            `Mark "${goal.label}" as completed?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Complete',
                    onPress: () => completeGroupGoal(groupId, goal.id)
                }
            ]
        );
    };

    const openEditModal = (goal: Goal) => {
        setSelectedGoal(goal);
        setEditLabel(goal.label);
        setEditTarget(goal.goal.toString());
        setEditColor(goal.color || '#4CAF50');
        setEditDueDate(goal.dueDate || '');
        setShowEditModal(true);
    };

    const handleEditGoal = () => {
        if (!selectedGoal || !editLabel.trim() || !editTarget.trim()) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        const target = parseFloat(editTarget);
        if (isNaN(target) || target <= 0) {
            Alert.alert('Error', 'Please enter a valid target number');
            return;
        }

        editGroupGoalDetails(groupId, selectedGoal.id, {
            label: editLabel,
            goal: target,
            color: editColor,
            dueDate: editDueDate || undefined,
        });

        setShowEditModal(false);
        setSelectedGoal(null);
    };

    const handleDeleteGoal = (goalId: string, isCompleted: boolean = false) => {
        Alert.alert(
            'Delete Goal',
            'Are you sure you want to delete this goal?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => deleteGroupGoal(groupId, goalId, isCompleted)
                }
            ]
        );
    };

    const openUpdateModal = (goal: Goal) => {
        setSelectedGoal(goal);
        setShowUpdateModal(true);
    };

    const displayGoals = showCompleted ? completedGoals : goals;

    return (
        <View style={styles.container}>
            <BackButton />
            <Text style={pageStyles.title}>Group Goals</Text>
            
            <View style={styles.toggleContainer}>
                <TouchableOpacity 
                    style={[styles.toggleButton, !showCompleted && styles.toggleButtonActive]}
                    onPress={() => setShowCompleted(false)}
                >
                    <Text style={[styles.toggleText, !showCompleted && styles.toggleTextActive]}>
                        Active ({goals.length})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.toggleButton, showCompleted && styles.toggleButtonActive]}
                    onPress={() => setShowCompleted(true)}
                >
                    <Text style={[styles.toggleText, showCompleted && styles.toggleTextActive]}>
                        Completed ({completedGoals.length})
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                style={styles.scrollView}>

                {displayGoals.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>
                            {showCompleted ? 'No completed goals yet' : 'No active goals. Add one to get started!'}
                        </Text>
                    </View>
                ) : (
                    displayGoals.map((goal) => (
                        <TouchableOpacity 
                            key={goal.id} 
                            onLongPress={() => handleDeleteGoal(goal.id, showCompleted)}
                        >
                            <View style={styles.goalContainer}>
                                <GoalProgressBar goal={goal} />
                                {showCompleted && goal.completedAt && (
                                    <Text style={styles.completedDateText}>
                                        Completed: {new Date(goal.completedAt).toLocaleDateString('en-US', {
                                            month: 'long',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </Text>
                                )}
                                {!showCompleted && goal.dueDate && (
                                    <Text style={styles.dueDateText}>
                                        Due: {goal.dueDate}
                                    </Text>
                                )}
                                {!showCompleted && (
                                    <View style={styles.goalActions}>
                                        <TouchableOpacity 
                                            style={styles.actionButton}
                                            onPress={() => openEditModal(goal)}
                                        >
                                            <Text style={styles.actionButtonText}>Edit</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity 
                                            style={styles.actionButton}
                                            onPress={() => openUpdateModal(goal)}
                                        >
                                            <Text style={styles.actionButtonText}>Update</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity 
                                            style={[styles.actionButton, styles.completeButton]}
                                            onPress={() => handleCompleteGoal(goal)}
                                        >
                                            <Text style={styles.actionButtonText}>Complete</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        </TouchableOpacity>
                    ))
                )}

            </ScrollView>

            {!showCompleted && (
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.createButton} onPress={() => setShowAddModal(true)}>
                        <Text style={styles.createButtonText}>Create New Goal</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Add Goal Modal */}
            <Modal
                visible={showAddModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowAddModal(false)}
            >
                <TouchableOpacity 
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => {
                        setShowAddModal(false);
                        setNewGoalLabel('');
                        setNewGoalTarget('');
                        setNewGoalColor('#4CAF50');
                        setNewGoalDueDate('');
                    }}
                >
                    <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Add New Group Goal</Text>
                        
                        <TextInput
                            style={styles.input}
                            placeholder="Goal name (e.g., Weekly meetups)"
                            placeholderTextColor={colors.subtext}
                            value={newGoalLabel}
                            onChangeText={setNewGoalLabel}
                        />
                        
                        <TextInput
                            style={styles.input}
                            placeholder="Target number (e.g., 12)"
                            placeholderTextColor={colors.subtext}
                            keyboardType="numeric"
                            value={newGoalTarget}
                            onChangeText={setNewGoalTarget}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Due date (optional, e.g., 12/31/2025)"
                            placeholderTextColor={colors.subtext}
                            value={newGoalDueDate}
                            onChangeText={setNewGoalDueDate}
                        />

                        <Text style={styles.colorLabel}>Choose color:</Text>
                        <View style={styles.colorPicker}>
                            {colors_palette.map(color => (
                                <TouchableOpacity
                                    key={color}
                                    style={[
                                        styles.colorOption,
                                        { backgroundColor: color },
                                        newGoalColor === color && styles.colorOptionSelected
                                    ]}
                                    onPress={() => setNewGoalColor(color)}
                                />
                            ))}
                        </View>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity 
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => {
                                    setShowAddModal(false);
                                    setNewGoalLabel('');
                                    setNewGoalTarget('');
                                    setNewGoalColor('#4CAF50');
                                    setNewGoalDueDate('');
                                }}
                            >
                                <Text style={styles.modalButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.modalButton, styles.addButton]}
                                onPress={handleAddGoal}
                            >
                                <Text style={[styles.modalButtonText, styles.addButtonText]}>Add Goal</Text>
                            </TouchableOpacity>
                        </View>
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>

            {/* Update Progress Modal */}
            <Modal
                visible={showUpdateModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowUpdateModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Update Progress</Text>
                        <Text style={styles.modalSubtitle}>{selectedGoal?.label}</Text>
                        
                        <TextInput
                            style={styles.input}
                            placeholder="Add to progress (e.g., 1)"
                            placeholderTextColor={colors.subtext}
                            keyboardType="numeric"
                            value={updateValue}
                            onChangeText={setUpdateValue}
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity 
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => {
                                    setShowUpdateModal(false);
                                    setUpdateValue('');
                                    setSelectedGoal(null);
                                }}
                            >
                                <Text style={styles.modalButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.modalButton, styles.addButton]}
                                onPress={handleUpdateProgress}
                            >
                                <Text style={[styles.modalButtonText, styles.addButtonText]}>Update</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Edit Goal Details Modal */}
            <Modal
                visible={showEditModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowEditModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Edit Goal Details</Text>
                        
                        <TextInput
                            style={styles.input}
                            placeholder="Goal name"
                            placeholderTextColor={colors.subtext}
                            value={editLabel}
                            onChangeText={setEditLabel}
                        />
                        
                        <TextInput
                            style={styles.input}
                            placeholder="Target number"
                            placeholderTextColor={colors.subtext}
                            keyboardType="numeric"
                            value={editTarget}
                            onChangeText={setEditTarget}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Due date (optional, e.g., 12/31/2025)"
                            placeholderTextColor={colors.subtext}
                            value={editDueDate}
                            onChangeText={setEditDueDate}
                        />

                        <Text style={styles.colorLabel}>Choose color:</Text>
                        <View style={styles.colorPicker}>
                            {colors_palette.map(color => (
                                <TouchableOpacity
                                    key={color}
                                    style={[
                                        styles.colorOption,
                                        { backgroundColor: color },
                                        editColor === color && styles.colorOptionSelected
                                    ]}
                                    onPress={() => setEditColor(color)}
                                />
                            ))}
                        </View>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity 
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => {
                                    setShowEditModal(false);
                                    setSelectedGoal(null);
                                }}
                            >
                                <Text style={styles.modalButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.modalButton, styles.addButton]}
                                onPress={handleEditGoal}
                            >
                                <Text style={[styles.modalButtonText, styles.addButtonText]}>Save Changes</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f7f8fa',
        paddingTop: 60,
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 20,
    },
    scrollContent: {
        paddingBottom: 20
    },
    buttonContainer: {
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    createButton: {
        backgroundColor: colors.primary,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    createButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    toggleContainer: {
        flexDirection: 'row',
        marginHorizontal: 20,
        marginBottom: 20,
        backgroundColor: colors.text,
        borderRadius: 8,
        padding: 4,
    },
    toggleButton: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 6,
    },
    toggleButtonActive: {
        backgroundColor: colors.primary,
    },
    toggleText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.subtext,
    },
    toggleTextActive: {
        color: '#fff',
    },
    goalContainer: {
        marginBottom: 16,
    },
    goalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 8,
        gap: 8,
    },
    actionButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
    },
    completeButton: {
        backgroundColor: '#4CAF50',
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 16,
        color: colors.subtext,
        textAlign: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        width: '85%',
        maxWidth: 400,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 8,
    },
    modalSubtitle: {
        fontSize: 16,
        color: colors.subtext,
        marginBottom: 16,
    },
    input: {
        height: 48,
        backgroundColor: '#f7f8fa',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.shadow,
        paddingHorizontal: 16,
        fontSize: 16,
        marginBottom: 16,
    },
    colorLabel: {
        fontSize: 16,
        color: colors.text,
        marginBottom: 8,
        fontWeight: '600',
    },
    colorPicker: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 24,
    },
    colorOption: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    colorOptionSelected: {
        borderColor: colors.text,
        borderWidth: 3,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: colors.text,
    },
    addButton: {
        backgroundColor: colors.primary,
    },
    modalButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    addButtonText: {
        color: '#fff',
    },
    dueDateText: {
        fontSize: 13,
        color: colors.subtext,
        marginTop: 4,
        fontStyle: 'italic',
    },
    completedDateText: {
        fontSize: 13,
        color: colors.subtext,
        marginTop: 4,
        fontStyle: 'italic',
    },
});
