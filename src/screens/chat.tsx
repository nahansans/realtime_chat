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
import { getStatusBarHeight } from 'react-native-status-bar-height';
import moment from 'moment';
import { getOpenedRoomIndex, setOpenedRoomIndex } from './../references/navigationProp';

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
    const [token, setToken] = useState('')
    const scrollViewRef = useRef<ScrollView>(null)
    const [getUsersData, setgetUsersData] = useState([] as SessionUserType[])
    const [mode, setMode] = useState('')

    useEffect(() => {      
        checkTheme()
        getSessionUserAndRooms()
        setOpenedRoomIndex(route.params['roomIndex'] == undefined ? roomIndex : route.params['roomIndex'])
        checkSessionNotification()
        scrollViewRef.current?.scrollToEnd()        
        return() => {
            setOpenedRoomIndex(undefined)
        }
    }, [])
    const checkTheme = async() => {
        const themeMode = await AsyncStorage.getItem('mode')
        if (themeMode != null) {
            setMode('dark')
            Animated.timing(scaleGradient, {
                toValue: 1,
                useNativeDriver: true
            }).start()
        } else {
            Animated.timing(scaleGradient, {
                toValue: 1,
                duration: 300,
                delay: 100,
                useNativeDriver: true
            }).start()

        }
    }
    async function checkSessionNotification() {
        const notificationData = await AsyncStorage.getItem('notification')
        if (notificationData != null) {
            await AsyncStorage.removeItem('notification')
        }
    }

    async function getSessionUserAndRooms() {
        const recentUser = await AsyncStorage.getItem('SessionUser')
        const sessionUser = JSON.parse(recentUser!) as SessionUserType

        setSessionUser(JSON.parse(recentUser!) as SessionUserType)

        if (route.params['roomIndex'] != undefined) {
            database()
                .ref(`/rooms/${route.params.roomIndex}`)
                .on('value', (snapshot: any) => {
                    setRoom(snapshot.val() as RoomType)
                })
        } else {
            database()
            .ref('rooms')
            .on('value', (snapshot: any) => {
                setStartChatRoom(snapshot.val() as RoomType[])
            })
        }

        
        database()
        .ref('/users/')
        .once('value')
        .then(snapshot => {
            const usersData = snapshot.val() || []
            setgetUsersData(usersData)
            if (route.params['withUser'] != undefined) {
                for (let index = 0; index < usersData.length; index++) {
                    const currentIndexUserData = usersData[index];
                    if (currentIndexUserData.username == route.params['withUser']) {
                        setToken(currentIndexUserData.token)

                        break
                    }                
                }
            }
        })
        
        
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
                    
                    database()
                        .ref(`/rooms/`)
                        .update(roomDataToSend)
                        .then(async() => {
                            sendNotification(token)

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
        .then(async() => {
            if (route.params['withUser'] != undefined) {
                sendNotification(token)
            } else {
                for (let index = 0; index < room.participants.length; index++) {
                    const element = room.participants[index];
                    console.log(element)
                    for (let i = 0; i < getUsersData.length; i++) {
                        const user = getUsersData[i];
                        if (element == user.username) {
                            if (user.username != sessionUser.username) {
                                sendNotification(user.token)
                                console.log(user.token)
                            }
                        }
                    }
                }
            }

            setInputText('')
        })
    }

    const getMessageAfterSubmit = (index: any) => {
        database()
            .ref(`/rooms/${index}`)
            .on('value', (snapshot: any) => {
                setRoom(snapshot.val() as RoomType)
            })
    }

    const sendNotification = (value: string) => {
        
        fetch(
            'https://fcm.googleapis.com/fcm/send',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'key=AAAAJDBaOnc:APA91bFUJBKT03Yt5ZNayYwqn4waoeteuXIpPL4JvtPrw3PwtwEELYnMyZgqt5RMMndSwkPnj7D9RO8FDm3PdE00EE7shaElvlhF5PfBbF8enmyW-hraXuqMqxLMcCfki_4ZQQ16qxlL',
                },
                body: JSON.stringify({
                    notification: {
                        body: inputText,
                        title: sessionUser.username
                    },
                    to: value,
                    data: {
                        roomIndex,
                        withUser: route.params['withGroup'] != undefined ? undefined : sessionUser.username,
                        withGroup: route.params['withGroup'] != undefined ? route.params['withGroup'] : undefined
                    }
                })
            }
        )
        .catch(error => console.warn(error))        
    }

    return(
        <>
            <StatusBar translucent backgroundColor='transparent' barStyle = 'light-content' />
        <SafeAreaView
            style = {{
                flex: 1,
                backgroundColor: mode == 'dark' ? '#1D1D1D' : '#f9f9f9'
            }}
        >
            <View
                style = {{
                    backgroundColor: mode == '' ? '#0abde3' : '#1D1D1D',
                    paddingHorizontal: 20,
                    overflow: 'hidden',   
                    paddingBottom: 10,
                    paddingTop: statusBarHeight + 10,
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
                        colors = {mode == '' ? ['#48dbfb', '#10ac84'] : ['#262626', '#262626']}
                        start = {{x: 0, y: 1}}
                        end = {{x: 1, y: 0}}
                        style = {{
                            position: 'absolute',
                            top: 0, left: 0, right: 0, bottom: 0,
                            opacity: mode == '' ? 0.8 : 1
                        }}
                    />
                </Animated.View>
                <TouchableOpacity
                    onPress = {() => navigation.navigate('Home')}
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
                <TouchableOpacity 
                    activeOpacity = {1} 
                    style = {{ paddingLeft: 10}} 
                    onPress = {() => {
                        
                    }}
                >
                    <Text
                        numberOfLines = {1}
                        style = {{
                            fontFamily: OpenSans.SemiBold,
                            letterSpacing: 1,
                            color: '#FFF',
                            fontSize: 16,
                            flexWrap: 'wrap',
                        }}
                    >
                        {route.params.withGroup == undefined ? route.params['withUser'] : route.params['withGroup']}
                    </Text>
                    {
                        route.params.withUser == undefined ?
                            <Text
                                style = {{
                                    fontFamily: OpenSans.SemiBold,
                                    color: '#FFF',
                                    fontSize: 12,
                                }}
                            >
                                {`${room.participants} `}
                            </Text>
                        : null
                    }
                </TouchableOpacity>
            </View>
            <ScrollView
                ref = {scrollViewRef}
                contentContainerStyle = {{
                    justifyContent: 'flex-end',
                    flexGrow: 1
                }}
                style = {{
                    flex: 1,
                    backgroundColor: mode == 'dark' ? '#1D1D1D' : '#f9f9f9'
                }}
                onContentSizeChange = {() => {
                    scrollViewRef.current?.scrollToEnd()
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
                                            backgroundColor: mode == '' ? '#0abde3' : '#146b7a',
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
                                        <Text
                                            style = {{
                                                color: mode == '' ? 'dimgrey' : 'lightgrey',
                                                alignSelf: 'flex-end',
                                                fontSize: 12
                                            }}
                                        >
                                            {moment(message.time).format('HH:mm')}
                                        </Text>
                                    </View>
                                    :
                                    <View
                                        style = {{
                                            backgroundColor: mode == '' ? '#c8d6e5' : '#353535',
                                            alignItems: 'flex-start',
                                            alignSelf: message.sender != 'Sistem' ? 'flex-start' : 'center',
                                            flexWrap: 'wrap',
                                            paddingVertical: 10,
                                            paddingHorizontal: 10,
                                            borderRadius: 10,
                                            marginLeft:  message.sender != 'Sistem' ? 10 : 0,
                                            marginRight:  message.sender != 'Sistem' ? 50 : 0,
                                            marginTop: 10,
                                        }}
                                    >
                                        {
                                            route.params.withGroup != undefined ?
                                            <>
                                            {
                                                message.sender != 'Sistem' ?
                                                <Text
                                                    style = {{
                                                        fontFamily: OpenSans.Regular,
                                                        color: mode == '' ? 'black' : 'white'
                                                    }}
                                                >
                                                    {message.sender}
                                                </Text>
                                                : null
                                            }
                                            </>
                                            : null
                                        }
                                        <Text
                                            style = {{
                                                fontFamily: OpenSans.Regular,
                                                color: mode == '' ? 'black' : 'white'
                                            }}
                                        >
                                            {message.text}
                                        </Text>
                                        {
                                            message.sender != 'Sistem' ?
                                            <Text
                                                style = {{
                                                    color: mode == '' ? 'grey' : 'lightgrey',
                                                    alignSelf: 'flex-end',
                                                    fontSize: 12,
                                                }}
                                            >
                                                {moment(message.time).format('HH:mm')}
                                            </Text>
                                            : null
                                        }
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
                    padding: 10,
                    alignItems: 'center',
                    backgroundColor: mode == '' ? 'white' : '#262626'
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
                        placeholderTextColor = 'grey'
                        onSubmitEditing = {() => submit()}
                        onChangeText = {(newValue: string) => setInputText(newValue)}
                        style = {{
                            borderWidth: 1,
                            borderColor: mode == '' ? '#c8d6e5' : 'lightgrey',
                            justifyContent: 'space-between',
                            borderRadius: 40,
                            paddingHorizontal: 20,
                            fontFamily: OpenSans.Regular,
                            color: mode == '' ? 'black' : 'white'
                        }}
                        value = {inputText}
                    />
                </View>
                <TouchableOpacity
                    activeOpacity = {0.7}
                    onPress = {() => submit()}
                    style = {{
                        padding: 10,
                        backgroundColor: mode == '' ? '#0abde3' : '#3a3a3a',
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