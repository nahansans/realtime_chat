import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, SafeAreaView, Image, TouchableOpacity } from 'react-native'

import { Fonts } from './../references/fonts';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

import { StackParamsList } from '../references/types/navigator'
import LinearGradient from 'react-native-linear-gradient';
import database from '@react-native-firebase/database';

type PropsList = {
    navigation: StackNavigationProp<StackParamsList, 'Home'>
    route: RouteProp<StackParamsList, 'Home'>
}

const Home = (props: PropsList) => {
    const { navigation, route } = props
    const { OpenSans } = Fonts
    useEffect(() => {
        database()
        .ref('/users/')
        .once('value')
        .then(snapshot => {
            console.log(snapshot.val())
        })
    }, [])
    const chats = [
        {
            user: 'Naufal Hanif Ihsanudin',
            chat: 'This is the distance between the top of the user scre'
        },
        {
            user: 'Naufal',
            chat: 'This is the distance between the top of the user screen and the react native view, may be non-zero in some use cases. Defaults to 0.'
        },
        {
            user: 'Hanif',
            chat: 'This is the distance between the top of the user screen and the react native view, may be non-zero in some use cases. Defaults to 0.'
        },
        {
            user: 'Ihsanudin',
            chat: 'This is the distance between the top of the user screen and the react native view, may be non-zero in some use cases. Defaults to 0.'
        },
    ]
    return(
        <SafeAreaView
            style = {{
                flex: 1,
            }}
        >
            <View
                style = {{
                    backgroundColor: '#0abde3',
                    padding: 20,
                    borderBottomEndRadius: 50,
                    overflow: 'hidden',               
                }}
            >
                <LinearGradient
                    colors = {['#48dbfb', '#10ac84']}
                    start = {{x: 0, y: 1}}
                    end = {{x: 1, y: 0}}
                    style = {{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        opacity: 0.8
                    }}
                />
                <View
                    style = {{
                        flexDirection: 'row',
                        alignItems: 'center'
                    }}
                >
                    <Image
                        source = {require('../images/chat_outline.png')}
                        style = {{
                            width: 40,
                            height: 40,
                            tintColor: 'white'
                        }}
                    />
                    <Text
                        style = {{
                            fontFamily: OpenSans.SemiBold,
                            letterSpacing: 1,
                            color: '#FFF',
                            fontSize: 16,
                            marginLeft: 10
                        }}
                    >
                        Skuy Chat
                    </Text>
                </View>

            </View>
            <ScrollView>
                {
                    chats.map((item, index) => {
                        return (
                            <TouchableOpacity
                                key = {index}
                                activeOpacity = {0.6}
                                onPress = {() => navigation.navigate('Chat', {fromScreen:'Home'})}
                                style = {{
                                    flexDirection: 'row',
                                    margin: 10,
                                    alignItems: 'center',
                                    borderBottomColor: '#c8d6e5',
                                }}
                            >
                                {/* <Image
                                    source = {require('../images/user.png')}
                                    style = {{
                                        width: 30,
                                        height: 30
                                    }}
                                /> */}
                                <View
                                    style = {{
                                        paddingLeft: 10,
                                    }}
                                >
                                    <Text
                                        numberOfLines = {1}
                                        style = {{
                                            fontFamily: OpenSans.SemiBold,
                                            color: '#222f3e',
                                            fontSize: 14
                                        }}
                                    >
                                        {item.user.length <= 53 ? item.user : `${item.user.substring(0, 53)}...`}
                                    </Text>
                                    <Text
                                        numberOfLines = {1}
                                        style = {{
                                            fontFamily: OpenSans.Regular,
                                            color: '#222f3e',
                                            fontSize: 12, 
                                        }}
                                    >
                                        {item.chat}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        )
                    })
                }
            </ScrollView>
        </SafeAreaView>
    )
}

export default Home