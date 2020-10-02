import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, SafeAreaView, Image, TouchableOpacity } from 'react-native'

import { Fonts } from './../references/fonts';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

import { StackParamsList } from '../references/types/navigator'
import LinearGradient from 'react-native-linear-gradient';
import database from '@react-native-firebase/database';
import AsyncStorage from '@react-native-community/async-storage';

import { SessionUserType } from '../references/types/session-user'
import { RoomType } from '../references/types/room'

type PropsList = {
    navigation: StackNavigationProp<StackParamsList, 'Home'>
    route: RouteProp<StackParamsList, 'Home'>
}

const Home = (props: PropsList) => {
    const { navigation, route } = props
    const { OpenSans } = Fonts

    const [sessionUser, setSessionUser] = useState({} as SessionUserType)
    const [rooms, setRooms] = useState([] as RoomType[])

    useEffect(() => {
        getSessionUserAndRooms()
    }, [])

    async function getSessionUserAndRooms() {
        const sessionUser = await AsyncStorage.getItem('SessionUser')

        setSessionUser(JSON.parse(sessionUser!) as SessionUserType)

        database()
        .ref('/rooms/')
        .on('value', (snapshot: any) => setRooms((snapshot.val() || []) as RoomType[]))
    }

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
                    rooms.map((room, roomIndex) => {
                        const interlocutors = room.participants[0] == sessionUser!.username ? room.participants[1] : room.participants[0]

                        return (
                            <TouchableOpacity
                                key = {roomIndex}
                                activeOpacity = {0.6}
                                onPress = {() => navigation.navigate('Chat', {fromScreen:'Home', roomIndex, withUser: interlocutors})}
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
                                        {interlocutors}
                                    </Text>

                                    <Text
                                        numberOfLines = {1}
                                        style = {{
                                            fontFamily: OpenSans.Regular,
                                            color: '#222f3e',
                                            fontSize: 12, 
                                        }}
                                    >
                                        {room.messages![room.messages!.length - 1].sender + ' : ' + room.messages![room.messages!.length - 1].text}
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