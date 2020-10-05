import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, SafeAreaView, Image, TouchableOpacity, Dimensions } from 'react-native'

import { Fonts } from './../references/fonts';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

import { StackParamsList } from '../references/types/navigator'
import LinearGradient from 'react-native-linear-gradient';
import { TextInput } from 'react-native-gesture-handler';

import database from '@react-native-firebase/database';

import { SessionUserType } from '../references/types/session-user'
import { RoomType } from '../references/types/room'
import AsyncStorage from '@react-native-community/async-storage';
import { string } from 'yargs';

type PropsList = {
    navigation: StackNavigationProp<StackParamsList, 'Chat'>
    route: RouteProp<StackParamsList, 'Chat'>
}

const Chat = (props: PropsList) => {
    const { navigation, route } = props
    const {OpenSans} = Fonts

    const [sessionUser, setSessionUser] = useState({} as SessionUserType)
    const [room, setRoom] = useState({} as RoomType)
    const [inputText, setInputText] = useState('')

    useEffect(() => {
        getSessionUserAndRooms()
    }, [])

    async function getSessionUserAndRooms() {
        const sessionUser = await AsyncStorage.getItem('SessionUser')

        setSessionUser(JSON.parse(sessionUser!) as SessionUserType)

        database()
        .ref(`/rooms/${route.params.roomIndex}`)
        .on('value', (snapshot: any) => setRoom(snapshot.val() as RoomType))
    }

    function submit() {
        const newRoomData = JSON.parse(JSON.stringify(room)) as RoomType
        
        newRoomData.messages?.push({
            sender: sessionUser.username,
            time: (new Date()).getTime(),
            text: inputText
        })

        database()
        .ref(`/rooms/${route.params.roomIndex}`)
        .update(newRoomData)
        .then(() => setInputText(''))
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
                    paddingHorizontal: 20,
                    overflow: 'hidden',   
                    paddingBottom: 20,
                    paddingTop: 30,
                    flexDirection: 'row',
                    alignItems: 'center',
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
                <TouchableOpacity
                    onPress = {() => navigation.goBack()}
                    activeOpacity = {0.7}
                >
                    <Image
                        source = {require('../images/ic_arrow_back_white.png')}
                        style = {{
                            width: 20,
                            height: 20,
                        }}
                    />
                </TouchableOpacity>
                <Text
                    numberOfLines = {1}
                    style = {{
                        fontFamily: OpenSans.SemiBold,
                        letterSpacing: 1,
                        color: '#FFF',
                        fontSize: 16,
                        flex: 1,
                        flexWrap: 'wrap',
                        paddingLeft: 10
                    }}
                >
                    {route.params.withUser}
                </Text>
            </View>
            <ScrollView
                contentContainerStyle = {{
                    justifyContent: 'flex-end',
                    flexGrow: 1
                }}
                style = {{
                    flex: 1
                }}
            >
                {
                    (room.messages || []).map((message, messageIndex) => {
                        const interlocutors = room.participants[0] == sessionUser!.username ? room.participants[1] : room.participants[0]

                        return (
                            <>
                            {/* <View
                                style = {{
                                    flex: 1,
                                    justifyContent: 'flex-end',
                                    marginHorizontal: 10
                                }}
                            >
                                <Text
                                    style = {{
                                        textAlign: 'center',
                                        backgroundColor: '#c8d6e5',
                                        alignSelf: 'center',
                                        paddingHorizontal: 10,
                                        paddingVertical: 5,
                                        borderRadius: 20,
                                        fontFamily: OpenSans.Regular,
                                        marginVertical: 10
                                    }}
                                >
                                    {item.date}
                                </Text>
                            </View> */}
                            
                            {
                                message.sender == sessionUser.username ?
                                    <View
                                        style = {{
                                            backgroundColor: '#0abde3',
                                            alignItems: 'flex-end',
                                            alignSelf: 'flex-end',
                                            flexWrap: 'wrap',
                                            paddingVertical: 10,
                                            paddingHorizontal: 10,
                                            borderRadius: 10,
                                            marginLeft: 50,
                                            marginRight: 10,
                                            marginBottom: 10,
                                            marginTop: 10
                                        }}
                                    >
                                        <Text
                                            style = {{
                                                fontFamily: OpenSans.Regular,
                                                color: '#FFF',
                                            }}
                                        >
                                            {message.text}
                                        </Text>
                                    </View>
                                    :
                                    <View
                                        style = {{
                                            backgroundColor: '#c8d6e5',
                                            alignItems: 'flex-start',
                                            alignSelf: 'flex-start',
                                            flexWrap: 'wrap',
                                            paddingVertical: 10,
                                            paddingHorizontal: 10,
                                            borderRadius: 10,
                                            marginLeft: 10,
                                            marginRight: 50,
                                            marginTop: 10
                                        }}
                                    >
                                        <Text
                                            style = {{
                                                fontFamily: OpenSans.Regular,
                                                color: 'black',
                                            }}
                                        >
                                            {message.text}
                                        </Text>
                                    </View>
                            }
                            </>
                        )
                    })
                }
            </ScrollView>
            <View
                style = {{
                    flexDirection: 'row',
                    margin: 10,
                    alignItems: 'center',
                }}
            >
                <View
                    style = {{
                        flex:1,
                        justifyContent: 'space-between',
                        paddingRight: 10
                    }}
                >
                    <TextInput
                        onSubmitEditing = {() => submit()}
                        onChangeText = {(newValue: string) => setInputText(newValue)}
                        style = {{
                            borderWidth: 1,
                            borderColor: '#c8d6e5',
                            justifyContent: 'space-between',
                            borderRadius: 40,
                            paddingHorizontal: 20,
                            fontFamily: OpenSans.Regular
                        }}
                        value = {inputText}
                    />
                </View>
                <TouchableOpacity
                    activeOpacity = {0.7}
                    onPress = {() => submit()}
                    style = {{
                        padding: 10,
                        backgroundColor: '#0abde3',
                        justifyContent: 'center',
                        borderRadius: 25,
                    }}
                >
                    <Image
                        source = {require('../images/send.png')}
                        style = {{
                            width: 25,
                            height: 25,
                            tintColor: 'white'
                        }}
                    />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}

export default Chat