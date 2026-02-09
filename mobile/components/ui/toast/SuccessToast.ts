import Toast from 'react-native-toast-message';

export default function showSuccessToast(message: string) {
  Toast.show({
        type: 'success',
        text1: 'Success',
        text2: message,
        position: 'top',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 50,
      });
}