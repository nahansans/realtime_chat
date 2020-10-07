import React, { useState, useEffect } from 'react'
import { View, Text, Image, StatusBar } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { StackNavigationProp } from '@react-navigation/stack'
import { StackParamsList } from '../references/types/navigator'
import { Fonts } from './../references/fonts';
import AsyncStorage from '@react-native-community/async-storage'

type PropsList = {
    navigation: StackNavigationProp<StackParamsList, 'SplashScreen'>
}

type notificationProps = {
    roomIndex: any,
    withUser: any
}

const SplashScreen = (props: PropsList) => {
    const { OpenSans } = Fonts
    const { navigation } = props
    const [mode, setMode] = useState('')

    useEffect(() => {        
        checkTheme()
        setTimeout(async() => {
            const sessionUser = await AsyncStorage.getItem('SessionUser')
            const sessionNotification = await AsyncStorage.getItem('notification')
            console.log(sessionNotification)
            if(sessionUser == null) {                
                navigation.replace('Login')
            } else {
                if (sessionNotification != null) {
                    const sessionNotificationData = JSON.parse(sessionNotification) as notificationProps
                    navigation.replace('Chat', {
                        fromScreen: 'Home',
                        roomIndex: sessionNotificationData.roomIndex,
                        withUser: sessionNotificationData.withUser
                    })
                } else {
                    navigation.replace('Home')
                }
            }
        }, 1000);
    }, [])
    const checkTheme = async() => {
        const themeMode = await AsyncStorage.getItem('mode')
        console.log(themeMode)
        if (themeMode != null) {
            setMode('dark')
            StatusBar.setBarStyle('light-content')
        }
    }

    return (
        <>
        <StatusBar barStyle='dark-content' />
        <View style = {{ flex: 1, alignItems: 'center', justifyContent: 'center'}} >
            <LinearGradient
                colors = {mode == '' ? ['#FFF', '#48dbfb'] : ['#1D1D1D', '#1D1D1D']}
                style = {{
                    opacity: mode == '' ? 0.2 : 1,
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0
                }}
            />
            <Image
                source = {require('../images/chat.png')}
                style = {{
                    width: 100,
                    height: 100
                }}
            />
            <Text
                style = {{
                    fontFamily: OpenSans.Bold,
                    color: '#fff',
                    letterSpacing: 1.5,
                    marginTop: 12,
                    textShadowRadius: 5,
                    textShadowColor: 'rgba(0,0,0,0.5)',
                    textShadowOffset: {height: 0.5, width: 0},
                }}
            >
                Skuy Chat
            </Text>
        </View>
        </>
    )
}

export default SplashScreen