import { Link } from 'expo-router'
import {Text, View, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import authStyles from '../../styles/auth.styles'
import logo from '../../assets/images/logo_.png'




export default function WelcomePage() {
    return (
        <>
        <View style={authStyles.titleContainer}>
          <Text style={authStyles.mainTitle}>HIVE</Text>
          <Text style={authStyles.mainTitle}>SPACE</Text>
        </View>
        <View>
          <Image source={logo} style={authStyles.logoStyle} />
        </View>
        <Text style={authStyles.subtitle}>
          Connect, explore, and share. Please sign in or create an account to get started.
        </Text>
        <Link href="/(auth)/sign-in" asChild>
          <TouchableOpacity style={authStyles.button}>
            <Text style={authStyles.buttonText}>Sign In</Text>
          </TouchableOpacity>
        </Link>
        <Link href="/(auth)/sign-up" asChild>
          <TouchableOpacity style={authStyles.button}>
            <Text style={authStyles.buttonText}>Sign Up</Text>
          </TouchableOpacity>
        </Link>
        </>
    );
}