// import React from 'react';
// import { View, TouchableOpacity, Text, StyleSheet, Animated, Image } from 'react-native';
// import { IconSymbol } from '@/components/ui/icon-symbol';

// interface GroupCardWithJoinProps {
//   id: string;
//   name: string;
//   members: number;
//   logoUri?: string;
//   iconName?: string;
//   isJoined: boolean;
//   onJoin: (id: string, name: string) => void;
//   onPress?: () => void;
// }

// export default function GroupCardWithJoin({
//   id,
//   name,
//   members,
//   logoUri,
//   iconName,
//   isJoined,
//   onJoin,
//   onPress
// }: GroupCardWithJoinProps) {
//   const scaleAnim = React.useRef(new Animated.Value(1)).current;
//   const fadeAnim = React.useRef(new Animated.Value(1)).current;

//   const handleJoinPress = (e: any) => {
//     e.stopPropagation(); // Prevent card press when clicking button
    
//     // Scale animation
//     Animated.sequence([
//       Animated.timing(scaleAnim, {
//         toValue: 0.95,
//         duration: 100,
//         useNativeDriver: true,
//       }),
//       Animated.timing(scaleAnim, {
//         toValue: 1,
//         duration: 100,
//         useNativeDriver: true,
//       }),
//     ]).start();

//     // Fade animation when joined
//     if (!isJoined) {
//       Animated.timing(fadeAnim, {
//         toValue: 0.6,
//         duration: 300,
//         useNativeDriver: true,
//       }).start();
//     }

//     onJoin(id, name);
//   };

//   return (
//     <TouchableOpacity
//       style={styles.container}
//       activeOpacity={0.7}
//       onPress={onPress}
//     >
//       <View style={styles.cardContent}>
//         <View style={styles.row}>
//           <View style={styles.logoWrap}>
//             {logoUri ? (
//               <Image source={{ uri: logoUri }} style={styles.logoImage} resizeMode="cover" />
//             ) : (
//               <View style={styles.iconCircle}>
//                 <IconSymbol name={iconName as any} size={32} color="#fff" />
//               </View>
//             )}
//           </View>
//           <View style={styles.content}>
//             <Text numberOfLines={1} style={styles.name}>{name}</Text>
//             <Text style={styles.subtitle}>Group • Community</Text>
//             <View style={styles.membersRow}>
//               <View style={styles.memberDot} />
//               <Text style={styles.memberCount}>{members}</Text>
//               <Text style={styles.membersLabel}>members</Text>
//             </View>
//           </View>
//         </View>
        
//         <Animated.View
//           style={[
//             styles.joinButtonWrapper,
//             {
//               transform: [{ scale: scaleAnim }],
//               opacity: fadeAnim,
//             }
//           ]}
//         >
//           <TouchableOpacity
//             style={[styles.joinButton, isJoined && styles.joinedButton]}
//             onPress={handleJoinPress}
//             disabled={isJoined}
//             activeOpacity={0.8}
//           >
//             <Text style={styles.joinButtonText}>
//               {isJoined ? '✓ Joined' : 'Join'}
//             </Text>
//           </TouchableOpacity>
//         </Animated.View>
//       </View>
//     </TouchableOpacity>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     backgroundColor: '#F6F7F9',
//     borderRadius: 12,
//     marginBottom: 22,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 4,
//     elevation: 2,
//     overflow: 'hidden',
//   },
//   cardContent: {
//     padding: 16,
//   },
//   row: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   logoWrap: {
//     marginRight: 12,
//   },
//   logoImage: {
//     width: 56,
//     height: 56,
//     borderRadius: 28,
//   },
//   iconCircle: {
//     width: 56,
//     height: 56,
//     borderRadius: 28,
//     backgroundColor: '#6c5ce7',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   content: {
//     flex: 1,
//   },
//   name: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#111827',
//     marginBottom: 4,
//   },
//   subtitle: {
//     color: '#6B7280',
//     fontSize: 13,
//     marginBottom: 4,
//   },
//   membersRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 2,
//   },
//   memberDot: {
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     backgroundColor: '#6c5ce7',
//     marginRight: 6,
//   },
//   memberCount: {
//     color: '#6c5ce7',
//     fontWeight: '600',
//     fontSize: 14,
//   },
//   membersLabel: {
//     color: '#A3A3A3',
//     fontSize: 13,
//     marginLeft: 4,
//   },
//   joinButtonWrapper: {
//     alignItems: 'flex-end',
//   },
//   joinButton: {
//     backgroundColor: '#6c5ce7',
//     paddingHorizontal: 24,
//     paddingVertical: 10,
//     borderRadius: 8,
//     minWidth: 100,
//     alignItems: 'center',
//   },
//   joinedButton: {
//     backgroundColor: '#10b981',
//   },
//   joinButtonText: {
//     color: '#fff',
//     fontWeight: '600',
//     fontSize: 14,
//   },
// });

import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated, Image } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface GroupCardWithJoinProps {
  id: string;
  name: string;
  members: number;
  logoUri?: string;
  iconName?: string;
  isJoined: boolean;
  onJoin: (id: string, name: string) => void;
  onPress?: () => void;
}

export default function GroupCardWithJoin({
  id,
  name,
  members,
  logoUri,
  iconName,
  isJoined,
  onJoin,
  onPress
}: GroupCardWithJoinProps) {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const fadeAnim = React.useRef(new Animated.Value(1)).current;

  const handleJoinPress = (e: any) => {
    e.stopPropagation(); // Prevent card press when clicking button
    
    // Scale animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Fade animation when joined
    if (!isJoined) {
      Animated.timing(fadeAnim, {
        toValue: 0.6,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }

    onJoin(id, name);
  };

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={styles.cardContent}>
        <View style={styles.row}>
          <View style={styles.logoWrap}>
            {logoUri ? (
              <Image source={{ uri: logoUri }} style={styles.logoImage} resizeMode="cover" />
            ) : (
              <View style={styles.iconCircle}>
                <IconSymbol name={iconName as any} size={32} color="#fff" />
              </View>
            )}
          </View>
          <View style={styles.content}>
            <Text numberOfLines={1} style={styles.name}>{name}</Text>
            <Text style={styles.subtitle}>Group • Community</Text>
            <View style={styles.membersRow}>
              <View style={styles.memberDot} />
              <Text style={styles.memberCount}>{members}</Text>
              <Text style={styles.membersLabel}>members</Text>
            </View>
          </View>
        </View>
        
        <Animated.View
          style={[
            styles.joinButtonWrapper,
            {
              transform: [{ scale: scaleAnim }],
              opacity: fadeAnim,
            }
          ]}
        >
          <TouchableOpacity
            style={[styles.joinButton, isJoined && styles.joinedButton]}
            onPress={handleJoinPress}
            disabled={isJoined}
            activeOpacity={0.8}
          >
            <Text style={styles.joinButtonText}>
              {isJoined ? '✓ Joined' : 'Join'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardContent: {
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoWrap: {
    marginRight: 12,
  },
  logoImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#342A5f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    color: '#6B7280',
    fontSize: 13,
    marginBottom: 4,
  },
  membersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  memberDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6c5ce7',
    marginRight: 6,
  },
  memberCount: {
    color: '#6c5ce7',
    fontWeight: '600',
    fontSize: 14,
  },
  membersLabel: {
    color: '#A3A3A3',
    fontSize: 13,
    marginLeft: 4,
  },
  joinButtonWrapper: {
    alignItems: 'flex-end',
  },
  joinButton: {
    backgroundColor: '#342A5f',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  joinedButton: {
    backgroundColor: '#10b981',
  },
  joinButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});