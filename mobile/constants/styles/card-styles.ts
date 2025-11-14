import { StyleSheet } from 'react-native';
import { colors } from '../theme';

export const cardStyles = StyleSheet.create({
  card: {
    padding: 16,
    marginVertical: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  value: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  label: {
    fontSize:14,
    color: colors.subtext,
  },
  labelBold: {
    fontSize:16,
    color: colors.text,
    fontWeight: 'bold',
  },
  rowstyles: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 4
  },
  halfwidthImage: {
    width: 100, //percent image size
    height: 100,
  },
});

export const groupCardStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  logoWrap: {
    width: 72,
    height: 72,
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: '100%',
    height: '100%',
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
    justifyContent: 'center',
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  shadowWrap: {
    borderRadius: 14,
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    // Android elevation
    elevation: 3,
    // allow the shadow to show outside the bounds
    backgroundColor: 'transparent',
  },
});

export default cardStyles;
