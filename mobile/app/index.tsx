import { SignOutButton } from '@/components/SignOutButton'
import WelcomePage from '@/components/ui/welcomepage'
import { SignedIn, SignedOut, useUser } from '@clerk/clerk-expo'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import React from 'react'
import { Text, TouchableOpacity } from 'react-native'
import { testApiHealth } from '../api/test.api'
import authStyles from '../constants/styles/auth.styles'
import colors from '../constants/theme'

export default function Page() {
  const { user } = useUser()
  const [apiResponse, setApiResponse] = React.useState(null);
  const router = useRouter() 


  React.useEffect(() => {
    if (user) {
      router.replace("./dashboard");
    }
    console.log("useeffect ran in index page");
  }, [user]);

  const handleTestApi = async () => {
    const response = await testApiHealth();
    setApiResponse(response);
    setTimeout(() => {
      setApiResponse(null);
    }, 1500); // Clear the response after 1.5 seconds
  }

  return (
    <LinearGradient colors={[colors.gradienttop, colors.gradientmid, colors.gradientbottom]} style={authStyles.container}>
      <SignedIn>
        {/* <Text style={authStyles.title}>Hello {user?.emailAddresses[0].emailAddress}</Text>
        <SignOutButton />

         <TouchableOpacity style={authStyles.button}>
            <Text onPress={handleTestApi} style={authStyles.buttonText}>Test API</Text>
          </TouchableOpacity>

          {
            apiResponse && (
              <Text style={authStyles.title}> {JSON.stringify(apiResponse)} : <></>"</Text>
            )
          } */}
      

      </SignedIn>
      <SignedOut>
        <WelcomePage />
      </SignedOut>
      </LinearGradient>
  )
}