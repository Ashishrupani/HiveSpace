// import React from 'react'
// import { View, ScrollView, TextInput, TouchableOpacity, Text, Alert, Modal, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
// import groupSettingsStyles from '@/constants/styles/group-settings.styles';
// import { useRouter } from 'expo-router';
// import GroupCardWithJoin from '@/components/ui/cards/groupCardWithJoin';
// import colors from '@/constants/theme';
// import axios from 'axios';
// import { useUser } from '@clerk/clerk-expo';
// import showErrorToast from '@/components/ui/toast/ErrorToast';
// import showSuccessToast from '@/components/ui/toast/SuccessToast';
// import showInfoToast from '@/components/ui/toast/InfoToast';
// import { Ionicons } from '@expo/vector-icons';
// import Toast from 'react-native-toast-message';

// export default function GroupSetting() {
//   const router = useRouter();
//   const { user } = useUser();
//   const [query, setQuery] = React.useState('');
//   const [joined, setJoined] = React.useState<Record<string, boolean>>({});
  
//   // Modal states
//   const [createModalVisible, setCreateModalVisible] = React.useState(false);
  
//   // Create group form states
//   const [groupName, setGroupName] = React.useState('');
//   const [about, setAbout] = React.useState('');

//   // Sample groups - replace with API data
//   const groups = React.useMemo(() => [
//       { id: '1', name: 'Study Buddies', members: 24, iconName: 'timer' },
//       { id: '2', name: 'React Learners', members: 12, iconName: 'note.fill' },
//       { id: '3', name: 'Design Crew', members: 8, iconName: 'person.crop.circle' },
//       { id: '4', name: 'Productivity Champs', members: 42, iconName: 'chart.bar.fill' },
//   ], []);

//   const filtered = React.useMemo(() => {
//     const q = query.trim().toLowerCase();
//     if (!q) return groups;
//     return groups.filter(g => g.name.toLowerCase().includes(q));
//   }, [groups, query]);

//   const handleJoin = (id: string, name: string) => {
//     // TODO: call real API to join group

//     setJoined(prev => ({ ...prev, [id]: true }));
//     showSuccessToast(`You joined ${name}`);
//   }

//   const handleCreateGroup = async () => {
//     if (!groupName.trim()) {
//       showInfoToast('Group name is required.');
//       return;
//     }

//     try {
//       const response = await axios.post(`http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:5000/api/groups/createGroup`, { groupName, about, user });

//       if (response.data.success === false) {
//         if (response.data.error == 'group-name-exists'){
//           showInfoToast('Group name already exists. Please choose another name.');
//         } else {
//           showErrorToast(`Failed to create group: ${response.data.error}`);
//         }
//       } else {
//         showSuccessToast(`Group "${groupName}" created successfully!`);
//         setCreateModalVisible(false);
//         setGroupName('');
//         setAbout('');
//       }
//     } catch (error) {
//       showErrorToast('Failed to create group.');
//       return;
//     }
//   };

//   return (
//     <>
//       <ScrollView style={groupSettingsStyles.container}>
//         <View style={[groupSettingsStyles.navRow, { marginBottom: 28 }]}> 
//           <TouchableOpacity 
//             style={groupSettingsStyles.navButton} 
//             onPress={() => setCreateModalVisible(true)}
//           >
//             <Text style={groupSettingsStyles.navButtonText}>Create a Group</Text>
//           </TouchableOpacity>
//         </View>

        
//         <TextInput
//           placeholder="Search groups"
//           value={query}
//           onChangeText={setQuery}
//           style={[groupSettingsStyles.searchInput, { marginBottom: 28 }]}
//           placeholderTextColor="#b0b0b0"
//           autoCapitalize="none"
//           autoCorrect={false}
//           returnKeyType="search"
//         /> 

//         {filtered.map((item) => (
//           <GroupCardWithJoin
//             key={item.id}
//             id={item.id}
//             name={item.name}
//             members={item.members}
//             iconName={item.iconName}
//             isJoined={!!joined[item.id]}
//             onJoin={handleJoin}
//           />
//         ))}
//         <View style={{ height: 24 }} />
//       </ScrollView>

//       {/* Create Group Modal */}
//       <Modal
//         animationType="slide"
//         transparent={true}
//         visible={createModalVisible}
//         onRequestClose={() => setCreateModalVisible(false)}
//       >
//         <KeyboardAvoidingView
//           style={modalStyles.modalOverlay}
//           behavior={Platform.OS === 'ios' ? 'padding' : undefined}
//         >
//           <Toast />
//           <View style={modalStyles.modalContent}>
//             {/* Header */}
//             <View style={modalStyles.modalHeader}>
//               <Text style={modalStyles.modalTitle}>Create a New Group</Text>
//               <TouchableOpacity 
//                 onPress={() => setCreateModalVisible(false)}
//                 style={modalStyles.closeButton}
//               >
//                 <Ionicons name="close" size={28} color="#666" />
//               </TouchableOpacity>
//             </View>

//             {/* Form */}
//             <View style={modalStyles.modalBody}>
//               <TextInput
//                 placeholder="Group Name"
//                 value={groupName}
//                 onChangeText={setGroupName}
//                 style={modalStyles.input}
//                 placeholderTextColor="#b0b0b0"
//                 autoCapitalize="words"
//                 returnKeyType="done"
//               />
//               <TextInput
//                 placeholder="About this group (optional)"
//                 value={about}
//                 onChangeText={setAbout}
//                 style={[modalStyles.input, modalStyles.textArea]}
//                 placeholderTextColor="#b0b0b0"
//                 multiline
//                 maxLength={300}
//                 textAlignVertical="top"
//               />
//               <TouchableOpacity 
//                 style={modalStyles.button} 
//                 onPress={handleCreateGroup}
//               >
//                 <Text style={modalStyles.buttonText}>Create Group</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </KeyboardAvoidingView>
//       </Modal>
//     </>
//   );
// }

// const modalStyles = StyleSheet.create({
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'flex-end',
//   },
//   modalContent: {
//     backgroundColor: '#fff',
//     borderTopLeftRadius: 24,
//     borderTopRightRadius: 24,
//     paddingBottom: Platform.OS === 'ios' ? 40 : 24,
//     maxHeight: '85%',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: -4 },
//     shadowOpacity: 0.1,
//     shadowRadius: 12,
//     elevation: 8,
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 24,
//     paddingTop: 20,
//     paddingBottom: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#f0f0f0',
//   },
//   modalTitle: {
//     fontSize: 22,
//     fontWeight: '700',
//     color: '#000',
//     letterSpacing: 0.2,
//   },
//   closeButton: {
//     padding: 4,
//   },
//   modalBody: {
//     padding: 24,
//   },
//   input: {
//     backgroundColor: '#f7f8fa',
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: '#e0e0e0',
//     paddingHorizontal: 16,
//     paddingVertical: 14,
//     fontSize: 16,
//     marginBottom: 16,
//     color: '#000',
//   },
//   textArea: {
//     height: 90,
//     paddingTop: 14,
//   },
//   orText: {
//     textAlign: 'center',
//     color: '#888',
//     marginVertical: 8,
//     fontSize: 15,
//     fontWeight: '500',
//   },
//   button: {
//     backgroundColor: colors.primary,
//     borderRadius: 12,
//     paddingVertical: 16,
//     alignItems: 'center',
//     marginTop: 8,
//     shadowColor: colors.primary,
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.2,
//     shadowRadius: 8,
//     elevation: 4,
//   },
//   buttonText: {
//     color: '#fff',
//     fontSize: 17,
//     fontWeight: '600',
//     letterSpacing: 0.3,
//   },
// });


import React from 'react'
import { View, ScrollView, TextInput, TouchableOpacity, Text, Alert, Modal, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import groupSettingsStyles from '@/constants/styles/group-settings.styles';
import { useRouter } from 'expo-router';
import GroupCardWithJoin from '@/components/ui/cards/groupCardWithJoin';
import colors from '@/constants/theme';
import axios from 'axios';
import { useUser } from '@clerk/clerk-expo';
import showErrorToast from '@/components/ui/toast/ErrorToast';
import showSuccessToast from '@/components/ui/toast/SuccessToast';
import showInfoToast from '@/components/ui/toast/InfoToast';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

export default function GroupSetting() {
  const router = useRouter();
  const { user } = useUser();
  const [query, setQuery] = React.useState('');
  const [joined, setJoined] = React.useState<Record<string, boolean>>({});
  
  // Modal states
  const [createModalVisible, setCreateModalVisible] = React.useState(false);
  
  // Create group form states
  const [groupName, setGroupName] = React.useState('');
  const [about, setAbout] = React.useState('');

  // Sample groups - replace with API data
  const groups = React.useMemo(() => [
      { id: '1', name: 'Study Buddies', members: 24, iconName: 'timer' },
      { id: '2', name: 'React Learners', members: 12, iconName: 'note.fill' },
      { id: '3', name: 'Design Crew', members: 8, iconName: 'person.crop.circle' },
      { id: '4', name: 'Productivity Champs', members: 42, iconName: 'chart.bar.fill' },
  ], []);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    return groups.filter(g => g.name.toLowerCase().includes(q));
  }, [groups, query]);

  const handleJoin = (id: string, name: string) => {
    // TODO: call real API to join group
    // Example: axios.post(`http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:5000/api/groups/join`, { groupId: id, user })
    setJoined(prev => ({ ...prev, [id]: true }));
    showSuccessToast(`You joined ${name}`);
  }

  const handleFindGroup = () => {
              // TODO: Call backend API to search for groups
              // Example: axios.get(`http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:5000/api/groups/find?search=${query}`)
              showInfoToast(`Searching for groups matching "${query}"`);
  }

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      showInfoToast('Group name is required.');
      return;
    }

    try {
      const response = await axios.post(`http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:5000/api/groups/createGroup`, { groupName, about, user });

      if (response.data.success === false) {
        if (response.data.error == 'group-name-exists'){
          showInfoToast('Group name already exists. Please choose another name.');
        } else {
          showErrorToast(`Failed to create group: ${response.data.error}`);
        }
      } else {
        showSuccessToast(`Group "${groupName}" created successfully!`);
        setCreateModalVisible(false);
        setGroupName('');
        setAbout('');
      }
    } catch (error) {
      showErrorToast('Failed to create group.');
      return;
    }
  };

  return (
    <>
      <ScrollView style={groupSettingsStyles.container}>
        <View style={[groupSettingsStyles.navRow, { marginBottom: 28 }]}> 
          <TouchableOpacity 
            style={groupSettingsStyles.navButton} 
            onPress={() => setCreateModalVisible(true)}
          >
            <Text style={groupSettingsStyles.navButtonText}>Create a Group</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            placeholder="Search groups"
            value={query}
            onChangeText={setQuery}
            style={styles.searchInput}
            placeholderTextColor="#b0b0b0"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          <TouchableOpacity 
            style={styles.searchButton}
            onPress={handleFindGroup}
          >
            <Ionicons name="search" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {filtered.map((item) => (
          <GroupCardWithJoin
            key={item.id}
            id={item.id}
            name={item.name}
            members={item.members}
            iconName={item.iconName}
            isJoined={!!joined[item.id]}
            onJoin={handleJoin}
          />
        ))}
        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Create Group Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={createModalVisible}
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={modalStyles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Toast  />
          <View style={modalStyles.modalContent}>
            {/* Header */}
            <View style={modalStyles.modalHeader}>
              <Text style={modalStyles.modalTitle}>Create a New Group</Text>
              <TouchableOpacity 
                onPress={() => setCreateModalVisible(false)}
                style={modalStyles.closeButton}
              >
                <Ionicons name="close" size={28} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Form */}
            <View style={modalStyles.modalBody}>
              <TextInput
                placeholder="Group Name"
                value={groupName}
                onChangeText={setGroupName}
                style={modalStyles.input}
                placeholderTextColor="#b0b0b0"
                autoCapitalize="words"
                returnKeyType="done"
              />
              <TextInput
                placeholder="About this group (optional)"
                value={about}
                onChangeText={setAbout}
                style={[modalStyles.input, modalStyles.textArea]}
                placeholderTextColor="#b0b0b0"
                multiline
                maxLength={300}
                textAlignVertical="top"
              />
              <TouchableOpacity 
                style={modalStyles.button} 
                onPress={handleCreateGroup}
              >
                <Text style={modalStyles.buttonText}>Create Group</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const modalStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
    letterSpacing: 0.2,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 24,
  },
  input: {
    backgroundColor: '#f7f8fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 16,
    color: '#000',
  },
  textArea: {
    height: 90,
    paddingTop: 14,
  },
  orText: {
    textAlign: 'center',
    color: '#888',
    marginVertical: 8,
    fontSize: 15,
    fontWeight: '500',
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  searchButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
});



