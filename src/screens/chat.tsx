import React, { useState, useEffect, useRef } from 'react'
import { View, Text, ScrollView, SafeAreaView, Image, TouchableOpacity, Dimensions, Animated, StatusBar } from 'react-native'

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
import { getStatusBarHeight } from 'react-native-status-bar-height';

type PropsList = {
    navigation: StackNavigationProp<StackParamsList, 'Chat'>
    route: RouteProp<StackParamsList, 'Chat'>
}

const Chat = (props: PropsList) => {
    const { navigation, route } = props
    const {OpenSans} = Fonts

    const [sessionUser, setSessionUser] = useState({} as SessionUserType)
    const [room, setRoom] = useState({} as RoomType)
    const [startChatRoom, setStartChatRoom] = useState<RoomType[]>([])
    const [inputText, setInputText] = useState('')
    const scaleGradient = useRef(new Animated.Value(0)).current
    const statusBarHeight = getStatusBarHeight()
    const [roomIndex, setRoomIndex] = useState(0)

    useEffect(() => {
        console.log(route.params['roomIndex'])
        
        getSessionUserAndRooms()
        Animated.timing(scaleGradient, {
            toValue: 1,
            duration: 300,
            delay: 100,
            useNativeDriver: true
        }).start()            
    }, [])

    async function getSessionUserAndRooms() {
        const sessionUser = await AsyncStorage.getItem('SessionUser')

        setSessionUser(JSON.parse(sessionUser!) as SessionUserType)

        if (route.params['roomIndex'] != undefined) {
            database()
                .ref(`/rooms/${route.params.roomIndex}`)
                .on('value', (snapshot: any) => setRoom(snapshot.val() as RoomType))
        } else {
            database()
            .ref('rooms')
            .on('value', (snapshot: any) => {
                setStartChatRoom(snapshot.val() as RoomType[])
            })
        }
        
    }

    function submit() {
        if (inputText !== '') {
            if (route.params['roomIndex'] == undefined) {
                if (roomIndex == 0) {
                    const newRoomData = startChatRoom == null ? [] as RoomType[] : JSON.parse(JSON.stringify(startChatRoom)) as RoomType[]
                    newRoomData.push({
                        participants: [sessionUser.username, route.params['withUser']],
                        messages: [{
                            sender: sessionUser.username,
                            time: (new Date()).getTime(),
                            text: inputText
                        }]
                    })
                    let roomDataToSend = {} as any
                    for(let roomDataIndex = 0; roomDataIndex < newRoomData.length; roomDataIndex++) {
                        roomDataToSend[roomDataIndex.toString()] = newRoomData[roomDataIndex]                    
                    }
                    setRoomIndex(newRoomData.length - 1)
                    console.log(newRoomData.length)
                    database()
                        .ref(`/rooms/`)
                        .update(roomDataToSend)
                        .then(() => {
                            setInputText('')
                            getMessageAfterSubmit(newRoomData.length - 1)
                        })
                } else {
                    submitMessage(roomIndex)
                }
    
            } else {
                submitMessage(route.params['roomIndex'])
            }
        }
    }

    const submitMessage = (index: any) => {
        const newRoomData = JSON.parse(JSON.stringify(room)) as RoomType
        
        newRoomData.messages?.push({
            sender: sessionUser.username,
            time: (new Date()).getTime(),
            text: inputText
        })
        database()
        .ref(`/rooms/${index}`)
        .update(newRoomData)
        .then(() => setInputText(''))
    }

    const getMessageAfterSubmit = (index: any) => {
        database()
            .ref(`/rooms/${index}`)
            .on('value', (snapshot: any) => {
                setRoom(snapshot.val() as RoomType)
            })
    }

    return(
        <>
            <StatusBar translucent backgroundColor='transparent' barStyle = 'light-content' />
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
                    paddingTop: statusBarHeight,
                    flexDirection: 'row',
                    alignItems: 'center',
                }}
            >
                <Animated.View
                    style = {{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        transform: [{scaleX: scaleGradient}],
                        opacity: scaleGradient
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
                </Animated.View>
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
                        placeholder = 'Type a message'
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
        </>
    )
}

export default Chat