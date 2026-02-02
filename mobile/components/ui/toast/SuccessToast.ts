import Toast from 'react-native-toast-message';

export default function showSuccessToast(message: string) {
  Toast.show({
        type: 'success',
        text1: 'Success',
        text2: message,
        position: 'bottom',
        visibilityTime: 3000,
        autoHide: true,
        bottomOffset: 40,
      });
}