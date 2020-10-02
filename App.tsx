import React, { useState, useEffect } from 'react'
import { StatusBar } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack'
import SplashScreen from './src/screens/splashscreen';
import Login from './src/screens/login';
import Home from './src/screens/home';
import Register from './src/screens/register';
import Chat from './src/screens/chat';

const Stack = createStackNavigator()

const App = () => {
  useEffect(() => {
    StatusBar.setHidden(true)
  }, [])
  return (
    <>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions = {{
            headerShown: false,
            // ...TransitionPresets.FadeFromBottomAndroid
          }}
        >
          <Stack.Screen
            name = 'SplashScreen'
            component = {SplashScreen}
          />
          <Stack.Screen
            name = 'Login'
            component = {Login}
          />
          <Stack.Screen
            name = 'Register'
            component = {Register}
          />
          <Stack.Screen
            name = 'Home'
            component = {Home}
            options = {{
              // ...TransitionPresets.ModalSlideFromBottomIOS
            }}
          />
          <Stack.Screen
            name = 'Chat'
            component = {Chat}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  )
}

export default App