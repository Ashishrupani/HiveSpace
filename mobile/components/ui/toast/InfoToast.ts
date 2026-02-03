import Toast from 'react-native-toast-message';

export default function showInfoToast(message: string) {
  Toast.show({
    type: 'info',
    text1: 'Info',
    text2: message,
    position: 'top',
    visibilityTime: 3000,
    autoHide: true,
    topOffset: 50,
  });
}