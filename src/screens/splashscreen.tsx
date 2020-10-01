import React, { useState, useEffect } from 'react'
import { View, Text, Image } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { StackNavigationProp } from '@react-navigation/stack'
import { StackParamsList } from '../references/types/navigator'
import { Fonts } from './../references/fonts';

type PropsList = {
    navigation: StackNavigationProp<StackParamsList, 'SplashScreen'>
}

const SplashScreen = (props: PropsList) => {
    const { OpenSans } = Fonts
    const { navigation } = props
    useEffect(() => {
        setTimeout(() => {
            navigation.replace('Login')
        }, 1000);
    }, [])
    return (
        <View style = {{ flex: 1, alignItems: 'center', justifyContent: 'center'}} >
            <LinearGradient
                colors = {['#FFF', '#48dbfb']}
                style = {{
                    opacity: 0.2,
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
    )
}

export default SplashScreen