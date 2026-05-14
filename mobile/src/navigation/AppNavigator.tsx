// src/navigation/AppNavigator.tsx
import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useSelector } from 'react-redux'
import { RootState } from '../store'

import { LoginScreen } from '../screens/auth/LoginScreen'
import { RegisterScreen } from '../screens/auth/RegisterScreen'

// Placeholders — implemente cada tela progressivamente
const PlaceholderScreen = ({ route }: any) => {
  const { View, Text } = require('react-native')
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 18, color: '#1B2B4B' }}>🚧 {route.name}</Text>
      <Text style={{ color: '#9A9A9A', marginTop: 8 }}>Em construção</Text>
    </View>
  )
}

const Stack = createNativeStackNavigator()

export function AppNavigator() {
  const autenticado = useSelector((state: RootState) => state.auth.autenticado)

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!autenticado ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Dashboard" component={PlaceholderScreen} />
            <Stack.Screen name="Search" component={PlaceholderScreen} />
            <Stack.Screen name="TripDetail" component={PlaceholderScreen} />
            <Stack.Screen name="CreateTrip" component={PlaceholderScreen} />
            <Stack.Screen name="MyTrips" component={PlaceholderScreen} />
            <Stack.Screen name="Requests" component={PlaceholderScreen} />
            <Stack.Screen name="Chat" component={PlaceholderScreen} />
            <Stack.Screen name="Profile" component={PlaceholderScreen} />
            <Stack.Screen name="Review" component={PlaceholderScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}
