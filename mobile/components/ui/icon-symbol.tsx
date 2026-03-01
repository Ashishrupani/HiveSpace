// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

// Mapping from a (subset) of SF Symbol names to MaterialIcons names.
// Use Partial because we only map a small subset of SF Symbols.
// Use a string-keyed mapping so we can map arbitrary SF-like names without
// requiring they be present in the large SymbolViewProps union.
type IconMapping = Record<string, ComponentProps<typeof MaterialIcons>['name']>;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING: IconMapping = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'timer': 'timer',
  'chevron.right': 'chevron-right',
  'clipboard.fill': 'content-paste',
  'chart.bar.fill': 'bar-chart',
  'person.crop.circle': 'account-circle',
  'note.fill': 'note',
  
  // Group/Team Icons
  'person.3.fill': 'group',
  'person.2.fill': 'people',
  'person.2.square.stack': 'groups',
  'heart.circle.fill': 'favorite',
  'star.fill': 'star',
  
  // Study/Education
  'book.fill': 'book',
  'graduationcap.fill': 'school',
  'pencil': 'edit',
  'lightbulb.fill': 'lightbulb',
  'brain': 'psychology',
  
  // Space/Science
  'sparkles': 'auto-awesome',
  'moon.stars.fill': 'nights-stay',
  'sun.max.fill': 'wb-sunny',
  'globe': 'public',
  'atom': 'science',
  
  // Activities/Hobbies
  'music.note': 'music-note',
  'gamecontroller.fill': 'sports-esports',
  'dumbbell.fill': 'fitness-center',
  'camera.fill': 'photo-camera',
  'paintbrush.fill': 'brush',
  'flag.fill': 'flag',
  
  // Work/Professional
  'briefcase.fill': 'work',
  'building.2.fill': 'business',
  'chart.line.uptrend': 'trending-up',
  'lightbulb.slash': 'tips-and-updates',
  'hammer.fill': 'build',
  
  // Social/Community
  'heart.fill': 'favorite',
  'bubble.left.and.bubble.right.fill': 'chat',
  'megaphone.fill': 'campaign',
  'hands.sparkles.fill': 'volunteer-activism',
  'gift.fill': 'card-giftcard',
  
  // Nature/Outdoor
  'leaf.fill': 'eco',
  'tree.fill': 'park',
  'mountain.2.fill': 'terrain',
  'flame.fill': 'local-fire-department',
  'drop.fill': 'water-drop',
  
  // Food/Social
  'cup.and.saucer.fill': 'local-cafe',
  'fork.knife': 'restaurant',
  'birthday.cake.fill': 'cake',
  'mug.fill': 'local-bar',
  
  // Tech/Gaming
  'cpu': 'developer-board',
  'antenna.radiowaves.left.and.right': 'wifi',
  'command': 'keyboard-command-key',
  'shield.fill': 'security',
  
  // Creative
  'wand.and.stars': 'auto-fix-high',
  'theatermasks.fill': 'theater-comedy',
  'film.fill': 'movie',
  'mic.fill': 'mic',
  
  // Travel/Adventure
  'airplane': 'flight',
  'car.fill': 'directions-car',
  'map.fill': 'map',
  'compass.fill': 'explore',
  
  // Misc Cool Icons
  'bolt.fill': 'bolt',
  'crown.fill': 'workspace-premium',
  'shield.checkered': 'verified',
  'infinity': 'all-inclusive',
  'target': 'gps-fixed',
};

// IconSymbolName is the union of keys actually present in MAPPING.
type IconSymbolName = keyof typeof MAPPING;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
