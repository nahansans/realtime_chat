import React, { useState, useEffect } from 'react'
import { StatusBar } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack'
import SplashScreen from './src/screens/splashscreen';
import Login from './src/screens/login';
import Home from './src/screens/home';
import Register from './src/screens/register';
import Chat from './src/screens/chat';
import messaging from '@react-native-firebase/messaging'
import PushNotification from 'react-native-push-notification'
import AsyncStorage from '@react-native-community/async-storage';
import { getOpenedRoomIndex } from './src/references/navigationProp';

const Stack = createStackNavigator()

type remoteMessageType = {
  roomIndex: any
}

const App = () => {
  let unsubcribeForegroundListener= undefined
  async function startListeningMessage() {
    const isPermitted = await getPermissionSuccessState()

    if (isPermitted) {
        const token = await messaging().getToken()

        AsyncStorage.setItem('token', token)

        unsubcribeForegroundListener = messaging().onMessage(remoteMessage => {
          const openedRoomIndex = getOpenedRoomIndex()
          const { roomIndex } = remoteMessage.data as remoteMessageType
          
          if (openedRoomIndex !== roomIndex) {
            PushNotification.localNotification({
              title: remoteMessage.notification?.title,
              message: remoteMessage.notification?.body!,
              channelId: 'default',
              playSound: true,
              soundName: 'default',
              importance: "high",
              priority: 'high',
              vibrate: true,
              userInfo: remoteMessage.data
            })
          }
        })
    }
  }

  useEffect(() => {
    startListeningMessage()
  }, [])
  
  return (
    <>
      <StatusBar translucent backgroundColor='transparent' barStyle = 'light-content' />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions = {{
            headerShown: false,
            ...TransitionPresets.SlideFromRightIOS
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

async function getPermissionSuccessState() {
  let isPermitted = false 
  await messaging().hasPermission().then((hasPermission) => {
    isPermitted = hasPermission ? true : false
  })
  
  if (!isPermitted) {
    await messaging().requestPermission().then(() => isPermitted == true)
  }

  return isPermitted
}
export default App