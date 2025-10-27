import { Platform, StyleSheet } from 'react-native';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import TimerCard from '@/components/ui/timerCard';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts } from '@/constants/theme';

// export default function TabTwoScreen(){
//     return <></>
// }
export default function TabTwoScreen() {
  const ontimerpress = () => {
    console.log("timer pressed");
    //routing for onclick
  };
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="timer"
          style={styles.headerImage}
        />
      }>
      <TimerCard
                  onPress={ontimerpress}
                />
      <ThemedView>
              <ThemedText
                type="title"
                style={{
                  fontFamily: Fonts.rounded,
                }}>
                This is the timer tab
              </ThemedText>
              <ThemedText>We will add all the timer functionality and features here.</ThemedText>
            </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});
