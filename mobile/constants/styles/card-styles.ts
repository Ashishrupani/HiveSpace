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
export default cardStyles;
