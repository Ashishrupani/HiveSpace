import { useClerk } from '@clerk/clerk-expo'
import { useRouter } from 'expo-router'
import { Text, TouchableOpacity } from 'react-native'

export const SignOutButton = () => {
  // Use `useClerk()` to access the `signOut()` function
  const { signOut } = useClerk()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await signOut()
      // Redirect to your desired page
      router.replace('/')
    } catch (err) {
      // See https://clerk.com/docs/guides/development/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2))
    }
  }

  return (
    <TouchableOpacity onPress={handleSignOut} style={{ padding: 12, backgroundColor: 'rgba(3, 53, 100, 1)', borderRadius: 16 , width: '30%', alignSelf: 'flex-end', marginRight: 12 }} activeOpacity={0.8}>
      <Text style={{ color: '#fff', fontWeight: 'bold' }}>Sign out</Text>
    </TouchableOpacity>
  )
}