import React, { useState, useEffect, useRef } from 'react'
import { View, Text, ScrollView, SafeAreaView, Image, TouchableOpacity, Dimensions, Animated, StatusBar, Modal } from 'react-native'

import { Fonts } from './../references/fonts';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

import { StackParamsList } from '../references/types/navigator'
import LinearGradient from 'react-native-linear-gradient';
import { TextInput } from 'react-native-gesture-handler';

import database from '@react-native-firebase/database';

import { SessionUserType } from '../references/types/session-user'
import { RoomType, deletedType } from '../references/types/room'
import AsyncStorage from '@react-native-community/async-storage';
import { getStatusBarHeight } from 'react-native-status-bar-height';


type PropsList = {
    navigation: StackNavigationProp<StackParamsList, 'DetailGroup'>
    route: RouteProp<StackParamsList, 'DetailGroup'>
}

type usersType = {
    username: string
}

const DetailGroup = (props: PropsList) => {
    const { navigation, route } = props
    const {OpenSans} = Fonts

    const [sessionUser, setSessionUser] = useState({} as SessionUserType)
    const [room, setRoom] = useState({} as RoomType)
    const [startChatRoom, setStartChatRoom] = useState<RoomType[]>([])
    const [inputText, setInputText] = useState('')
    const scaleGradient = useRef(new Animated.Value(0)).current
    const statusBarHeight = getStatusBarHeight()
    const [roomIndex, setRoomIndex] = useState(0)
    const [mode, setMode] = useState('')
    const [participants, setparticipants] = useState([] as string[])
    const { width, height } = Dimensions.get('window')
    const [modalSearching, setModalSearching] = useState(false)
    const [users, setUsers] = useState([] as usersType[])
    const modalOpacity = useRef(new Animated.Value(0)).current
    const textInputRef = useRef<TextInput>(null)
    const [deletedParticipants, setDeletedParticipants] = useState([] as deletedType[])

    useEffect(() => {      
        checkTheme()
        getSessionUserAndRooms()
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
    async function getSessionUserAndRooms() {
        const recentUser = await AsyncStorage.getItem('SessionUser')
        const sessionUser = JSON.parse(recentUser!) as SessionUserType

        setSessionUser(JSON.parse(recentUser!) as SessionUserType)

        database()
            .ref(`/rooms/${route.params.roomIndex}`)
            .on('value', (snapshot: any) => {
                setRoom(snapshot.val() as RoomType)
                let newParticipants = snapshot.val().participants
                let filteredParticipants = [] as string[]
                setDeletedParticipants(snapshot.val().deleted_participants)
                filteredParticipants = newParticipants.filter((participant: any) => participant != sessionUser.username)
                setparticipants(filteredParticipants)
        })

        
        database()
        .ref('/users/')
        .once('value')
        .then(snapshot => {
            const usersData = snapshot.val() || []
            
        })
    }

    async function deleteMember(value: any) {                
        const newRoomData = JSON.parse(JSON.stringify(room)) as RoomType

        newRoomData.messages?.push({
            sender: 'Sistem',
            time: (new Date()).getTime(),
            text: `${sessionUser.username} telah mengeluarkan ${value}`
        })
        let last_message_index = room.messages?.length
        let deleted_participants = [] as deletedType[]
        if (room.deleted_participants == undefined) {
            deleted_participants = [{
                username: value,
                last_message_index,
                status: 'dikeluarkan'
            }]
        } else {
            newRoomData.deleted_participants?.push({
                username: value,
                last_message_index,
                status: 'dikeluarkan'
            })
        }
        database()
        .ref(`/rooms/${route.params.roomIndex}`)
        .update({
            messages: newRoomData.messages,
            deleted_participants: room.deleted_participants == undefined ? deleted_participants : newRoomData.deleted_participants
        })
        .then(() => {
            console.log('delete member success')            
        })
    }

    const leaveGroup = () => {
        const newRoomData = JSON.parse(JSON.stringify(room)) as RoomType

        newRoomData.messages?.push({
            sender: 'Sistem',
            time: (new Date()).getTime(),
            text: `${sessionUser.username} telah keluar grub`
        })
        let last_message_index = room.messages?.length
        let deleted_participants = [] as deletedType[]
        if (room.deleted_participants == undefined) {
            deleted_participants = [{
                username: sessionUser.username,
                last_message_index,
                status: 'keluar'
            }]
        } else {
            newRoomData.deleted_participants?.push({
                username: sessionUser.username,
                last_message_index,
                status: 'keluar'
            })
        }
        database()
        .ref(`/rooms/${route.params.roomIndex}`)
        .update({
            messages: newRoomData.messages,
            deleted_participants: room.deleted_participants == undefined ? deleted_participants : newRoomData.deleted_participants
        })
        .then(() => {
            console.log('keluar grub member success')
            navigation.replace('Home')
        })
    }

    const deletedGroup = () => {
        
        database()
        .ref(`/rooms/${route.params['roomIndex']}`)
        .update({
            messages: [{
                sender: 'Sistem',
                time: (new Date()).getTime(),
                text: `${sessionUser.username} delete group`
            }],
            participants: ['']
        })
        .then(() => {
            console.log('delete success')
            navigation.navigate('Home')
        })
    }

    const search = (value: string) => {        
        // database()
        // .ref('/users')
        // .on('value', (snapshot:any) => {
        //     let users = (snapshot.val() || []) as usersType[]            
        //     let filteredUsers = [] as usersType[]

            
        //     filteredUsers = users.filter(user => user.username.toLocaleLowerCase().includes(value.toLowerCase()) && user.username != sessionUser.username)
        //     setUsers(filteredUsers)
        // })
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
                <TouchableOpacity 
                    activeOpacity = {1}
                    style = {{ paddingLeft: 10}} 
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
                        {room.groupName}
                    </Text>
                </TouchableOpacity>
            </View>
            <ScrollView
                style = {{
                    flex: 1,
                    backgroundColor: mode == 'dark' ? '#1D1D1D' : '#f9f9f9',
                    paddingHorizontal: 20
                }}
            >
                {
                    !route.params.isDeleted ?
                    <>
                    <TouchableOpacity
                        style = {{
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                            borderRadius: 8,
                            borderWidth: 1,
                            borderColor: mode == '' ? '#1D1D1D' : '#f9f9f9',
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginTop: 20,
                            alignSelf: 'flex-start'
                        }}
                        onPress = {() => {
                            StatusBar.setHidden(true)
                            setModalSearching(true)
                            Animated.timing(modalOpacity, {
                                toValue: 1,
                                duration: 1000,
                                delay: 200,
                                useNativeDriver: true
                            }).start()
                        }}
                    >
                        <Image
                            source = {require('../images/users.png')}
                            style = {{
                                width: 18,
                                height: 18,
                                tintColor: mode == '' ? '#1D1D1D' : '#f9f9f9',
                                marginRight: 5
                            }}
                        />
                        <Text>
                            Add Member
                        </Text>
                    </TouchableOpacity>
                    </>
                    : null
                }

                <Text
                    style = {{
                        color: mode == '' ? '#222f3e' : 'white',
                        fontSize: 14,
                        marginVertical: 20
                    }}
                >
                    Members
                </Text>
                {
                    !route.params.isDeleted ?
                    <Text
                        style = {{
                            color: mode == '' ? '#222f3e' : 'white',
                            fontSize: 14,
                            marginVertical: 10
                        }}
                    >
                        Anda
                    </Text>
                    : null
                }
                {
                    participants != undefined ?
                    participants.map((item, index) => {                        
                        const isThisDeletedParticipant = deletedParticipants != undefined ? deletedParticipants.filter(user => user.username == item ).length == 1 : 0
                        
                        return (
                            <>
                            {
                                !isThisDeletedParticipant ?
                                <View
                                    style = {{
                                        opacity: 1,
                                        flexDirection: 'row',
                                        marginVertical: 10
                                    }}
                                >
                                    <Text
                                        style = {{
                                            color: mode == '' ? '#222f3e' : 'white',
                                            fontSize: 14,
                                            flex: 1,
                                            justifyContent: 'space-between'
                                        }}
                                    >
                                        {item == sessionUser.username ? 'Anda' : item}
                                    </Text>
                                    {
                                        !route.params.isDeleted ?
                                        <TouchableOpacity
                                            onPress = {() => deleteMember(item)}
                                        >
                                            <Image
                                                source = {require('../images/trash.png')}
                                                style = {{
                                                    width: 18,
                                                    height: 18,
                                                    tintColor: mode == '' ? '#1D1D1D' : '#f9f9f9',
                                                }}
                                            />
                                        </TouchableOpacity>
                                        : null
                                    }
                                </View>
                                : null
                            }
                            </>
                        )
                    })
                    : null
                }
            </ScrollView>
            <Modal
                onRequestClose = {() => {
                    StatusBar.setHidden(false)
                    Animated.timing(modalOpacity, {
                        toValue: 0,
                        duration: 100,
                        useNativeDriver: true
                    }).start(()=> {
                        setModalSearching(false)
                        setUsers([])
                    })
                }}
                visible = {modalSearching}
                transparent = {true}
                animationType = 'slide'
            >
                <SafeAreaView
                    style = {{
                        flex: 1,
                    }}
                >
                    <Animated.View
                        style = {{
                            flex: 1,
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            opacity: modalOpacity,
                        }}
                    >
                        <TouchableOpacity
                            onPress = {() => {
                                StatusBar.setHidden(false)
                                Animated.timing(modalOpacity, {
                                    toValue: 0,
                                    duration: 100,
                                    useNativeDriver: true
                                }).start(()=> {
                                    setModalSearching(false)
                                    setUsers([])
                                })
                            }}
                            style = {{
                                width: '100%',
                                height: '100%',
                            }}
                        />
                    </Animated.View>
                    <View
                        style = {{
                            position: 'absolute',
                            width,
                            height: height,
                            bottom: 0,
                            backgroundColor: mode == '' ? 'white' : '#262626',
                            borderTopEndRadius: 20,
                            borderTopStartRadius: 20,
                            padding: 20,
                            flex:1,
                        }}
                    >
                        <Text
                            style = {{
                                fontFamily: OpenSans.Regular,
                                textAlign: 'center',
                                color: mode == '' ? 'black' : 'white'
                            }}
                        >
                            Searching User
                        </Text>
                        <View style = {{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }} >
                            <TextInput
                                ref = {textInputRef}
                                autoCapitalize = 'none'
                                // returnKeyType = {'search'}
                                placeholder = 'searching user...'
                                placeholderTextColor = {mode == '' ? '#242424' : 'white'}
                                style = {{
                                    borderColor: mode == '' ? '#222f3e' : 'lightgrey',
                                    borderWidth: 1,
                                    paddingHorizontal: 10,
                                    marginVertical: 5,
                                    borderRadius: 10,
                                    fontFamily: OpenSans.Regular,
                                    flex: 1,
                                    marginRight: 10,
                                    color: mode == '' ? 'black' : 'white'
                                }}
                                onChangeText = {(value) => {
                                    search(value)
                                }}
                            />
                        </View>
                        <View style = {{flex: 1}} >
                            <ScrollView        
                                keyboardShouldPersistTaps = 'handled'
                            >
                                {
                                    users.map((item, index) => {
                                        return (
                                            <TouchableOpacity
                                                key = {index}
                                                activeOpacity = {0.6}
                                                // onPress = {() => navigation.navigate('Chat', {fromScreen:'Home', roomIndex, withUser: interlocutors})}
                                                onPress = {() => {
                                                
                                                }}
                                                style = {{
                                                    flexDirection: 'row',
                                                    padding: 10,
                                                    alignItems: 'center',
                                                    borderBottomColor: mode == '' ? '#c8d6e5' : '#2D2D2D',
                                                    borderBottomWidth: 1
                                                }}
                                            >
                                                
                                                <View
                                                    style = {{
                                                        paddingLeft: 10,
                                                    }}
                                                >
                                                    <Text
                                                        numberOfLines = {1}
                                                        style = {{
                                                            fontFamily: OpenSans.SemiBold,
                                                            fontSize: 14,
                                                            color: mode == '' ? '#222f3e' : 'white'
                                                        }}
                                                    >
                                                        {item.username}
                                                    </Text>
                                                </View>
                                            </TouchableOpacity>
                                        )
                                    })
                                }
                            </ScrollView>
                        </View>
                    </View>
                </SafeAreaView>
            </Modal>
            
            {
                !route.params.isDeleted ?
                <View
                    style = {{
                        paddingHorizontal: 20,
                        paddingVertical: 10,
                        position: 'absolute',
                        backgroundColor: mode == 'dark' ? '#1D1D1D' : '#f9f9f9',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        alignItems: 'center'
                    }}
                >
                    <TouchableOpacity
                        onPress = {() => {
                            deletedGroup()
                        }}
                        style = {{
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                            borderRadius: 8,
                            borderWidth: 1,
                            borderColor: mode == '' ? '#1D1D1D' : '#f9f9f9',
                            marginBottom: 5,
                            flexDirection: 'row',
                            alignItems: 'center'
                        }}
                    >
                        <Image
                            source = {require('../images/trash.png')}
                            style = {{
                                width: 18,
                                height: 18,
                                tintColor: mode == '' ? '#1D1D1D' : '#f9f9f9',
                                marginRight: 5
                            }}
                        />
                        <Text
                            style = {{
                                color: mode == '' ? '#1D1D1D' : '#f9f9f9',
                            }}
                        >
                            Delete Group
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style = {{
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                            borderRadius: 8,
                            borderWidth: 1,
                            borderColor: mode == '' ? '#1D1D1D' : '#f9f9f9',
                            flexDirection: 'row',
                            alignItems: 'center'
                        }}
                        onPress = {() => {
                            leaveGroup()
                        }}
                    >
                        <Image
                            source = {require('../images/ic_keluar.png')}
                            style = {{
                                width: 18,
                                height: 18,
                                tintColor: mode == '' ? '#1D1D1D' : '#f9f9f9',
                                marginRight: 5
                            }}
                        />
                        <Text
                            style = {{
                                color: mode == '' ? '#1D1D1D' : '#f9f9f9',
                            }}
                        >
                            Leave Group
                        </Text>
                    </TouchableOpacity>
                </View>
                : null
            }
        </SafeAreaView>
        </>
    )
}

export default DetailGroup