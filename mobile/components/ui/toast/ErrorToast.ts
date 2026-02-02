import Toast from 'react-native-toast-message';

export default function showErrorToast(message: string) {
  Toast.show({
    type: 'error',
    text1: 'Error',
    text2: message,
    position: 'bottom',
    visibilityTime: 3000,
    autoHide: true,
    bottomOffset: 40,
  });
}