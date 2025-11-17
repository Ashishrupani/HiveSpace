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
  shadowWrap: {
    borderRadius: 14,
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#FFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ECECEC',
    flex: 1,
    minHeight: 72,
    gap: 14,
  },
  logoWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
  },
  logoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#342A5f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    marginLeft: 0,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    marginBottom: 2,
    letterSpacing: 0.1,
  },
});

export default cardStyles;
