import React, { useState, useEffect, useRef } from 'react'
import { View, ScrollView, TouchableOpacity, Text, SafeAreaView, Animated, Image, Pressable } from 'react-native'
import { StackNavigationProp } from '@react-navigation/stack';
import { StackParamsList } from '../../references/types/navigator'
import { Fonts } from '../../references/fonts';
import AsyncStorage from '@react-native-community/async-storage';
import { SessionUserType } from '../../references/types/session-user'
import database from '@react-native-firebase/database';
import LinearGradient from 'react-native-linear-gradient';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { TextInput } from 'react-native-gesture-handler';
import { RoomType } from '../../references/types/room';

type PropsList = {
    navigation: StackNavigationProp<StackParamsList, 'NewGroup'>
}
type usersType = {
    username: string
}

const NewGroup = (props: PropsList) => {
    const { navigation } = props
    const { OpenSans } = Fonts
    const [mode, setMode] = useState('')
    const [sessionUser, setSessionUser] = useState({} as SessionUserType)

    const scaleGradient = useRef(new Animated.Value(0)).current
    const statusBarHeight = getStatusBarHeight()
    const [participant, setParticipant] = useState<usersType[]>([])
    
    const scrollViewHorizontalRef = useRef<ScrollView>(null)
    const [users, setUsers] = useState([] as usersType[])
    const scaleNext = useRef(new Animated.Value(1)).current
    const [textValue, setTextValue] = useState('')
    const [createRoom, setcreateRoom] = useState<RoomType[]>([])

    useEffect(() => {
        checkTheme()
        getSessionUserAndRooms()
        Animated.parallel([
            Animated.timing(scaleGradient, {
                toValue: 1,
                duration: 300,
                delay: 200,
                useNativeDriver: true
            })
        ]).start()
    }, [])

    async function getSessionUserAndRooms() {
        const sessionUser = await AsyncStorage.getItem('SessionUser')
        setSessionUser(JSON.parse(sessionUser!) as SessionUserType)

        database()
        .ref('rooms')
        .on('value', (snapshot: any) => {
            setcreateRoom(snapshot.val() as RoomType[])
        })
    }
    const checkTheme = async() => {
        const themeMode = await AsyncStorage.getItem('mode')
        
        if (themeMode != null) {
            setMode('dark')
        }
    }
    const search = (value: string) => {        
        database()
        .ref('/users')
        .on('value', (snapshot:any) => {
            let users = (snapshot.val() || []) as usersType[]

            let filteredUsers = users.filter(user => user.username.toLocaleLowerCase().includes(value.toLowerCase()) && user.username != sessionUser.username)

            setUsers(filteredUsers)
        })
    }

    const submit = () => {
        if (textValue != '' && participant.length > 0) {
            const newRoomData = createRoom == null ? [] as RoomType[] : JSON.parse(JSON.stringify(createRoom)) as RoomType[]
            const newParticipant = JSON.parse(JSON.stringify(participant))
            newParticipant.unshift(sessionUser)

            let participants = {} as any
            for(let roomDataIndex = 0; roomDataIndex < newParticipant.length; roomDataIndex++) {
                const element = newParticipant[roomDataIndex] as usersType
                participants[roomDataIndex] = element.username
            }
            
            console.log(participants)

            newRoomData.push({
                participants: participants,
                groupName: textValue,
                messages: [{
                    sender: "Sistem",
                    time: (new Date()).getTime(),
                    text: `${sessionUser.username} telah membuat grub`
                }],
                created_by: sessionUser.username,
                deleted_participants: []
            })
            let roomDataToSend = {} as any
            let roomIndex = 0
            for(let roomDataIndex = 0; roomDataIndex < newRoomData.length; roomDataIndex++) {
                roomDataToSend[roomDataIndex.toString()] = newRoomData[roomDataIndex]
                roomIndex = roomDataIndex
            }
            
            database()
                .ref(`/rooms/`)
                .update(roomDataToSend)
                .then(async() => {                
                    navigation.replace('Chat', {
                        fromScreen: 'Home',
                        roomIndex,
                        withUser: undefined,
                        withGroup: textValue,
                    })
                    setTextValue('')
                })
        }
    }
    return (
        <>
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
                    paddingTop: statusBarHeight + 10
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
                <View
                    style = {{
                        flexDirection: 'row',
                        alignItems: 'center'
                    }}
                >
                    <TouchableOpacity
                        onPress = {() => navigation.goBack()}
                    >
                        <Image
                            source = {require('../../images/ic_arrow_back_white.png')}
                            style = {{
                                width: 22,
                                height: 22,
                                tintColor: 'white'
                            }}
                        />
                    </TouchableOpacity>
                    
                    <Text
                        style = {{
                            fontFamily: OpenSans.SemiBold,
                            letterSpacing: 1,
                            color: '#FFF',
                            fontSize: 16,
                            marginLeft: 10,
                            justifyContent: 'space-between',
                            flex: 1
                        }}
                    >
                        New Group
                    </Text>
                </View>
            </View>
            <View
                style = {{
                    paddingHorizontal: 20,
                    borderBottomColor: mode == '' ? '#c8d6e5' : '#2D2D2D',
                    borderBottomWidth: 1,                    
                }}
            >
                <TextInput
                    placeholder = 'Enter group name'
                    placeholderTextColor = {mode == '' ? '#242424' : 'white'}
                    style = {{
                        fontFamily: OpenSans.Regular,
                        color: mode == '' ? 'black' : 'white'
                    }}
                    onChangeText = {(value) => {
                        setTextValue(value)
                    }}
                />
            </View>
            <View
                style = {{
                    paddingHorizontal: 20,
                    borderBottomColor: mode == '' ? '#c8d6e5' : '#2D2D2D',
                    borderBottomWidth: 1,
                    // borderTopWidth: 1,
                    // borderTopColor: mode == '' ? '#c8d6e5' : '#2D2D2D',
                    marginTop: 50,
                }}
            >
                <TextInput
                    placeholder = 'Add Participants...'
                    placeholderTextColor = {mode == '' ? '#242424' : 'white'}
                    style = {{
                        fontFamily: OpenSans.Regular,
                        color: mode == '' ? 'black' : 'white'
                    }}
                    onChangeText = {(value) => {
                        search(value)
                    }}
                />
            </View>
            {
                participant.length > 0 ?
                <View style = {{ borderBottomColor: mode == '' ? '#c8d6e5' : '#2D2D2D', borderBottomWidth: 1, paddingVertical: 10 }} >
                    <ScrollView   
                            ref = {scrollViewHorizontalRef}
                            horizontal
                            showsHorizontalScrollIndicator = {false}
                            onContentSizeChange = {() => {
                                scrollViewHorizontalRef.current?.scrollToEnd()
                            }}
                        >
                            {
                                participant.map((item, index) => {
                                    return (
                                        <TouchableOpacity
                                            key = {index}
                                            activeOpacity = {0.6}
                                            // onPress = {() => navigation.navigate('Chat', {fromScreen:'Home', roomIndex, withUser: interlocutors})}
                                            onPress = {() => {
                                                for (let index = 0; index < participant.length; index++) {
                                                    const element = participant[index];
                                                    if (element.username == item.username) {
                                                        const newParticipant = JSON.parse(JSON.stringify(participant))
                                                        newParticipant.splice(index, 1)
                                                        setParticipant(newParticipant)
                                                        scrollViewHorizontalRef.current?.scrollTo({x: 0})
                                                        break
                                                    }
                                                    
                                                }
                                            }}
                                            style = {{
                                                flexDirection: 'row',
                                                margin: 10,
                                                alignItems: 'center',
                                            }}
                                        >
                                            
                                            <View
                                                style = {{
                                                    paddingHorizontal: 10,
                                                    paddingVertical: 5,
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                    backgroundColor: mode == '' ? '#c8d6e5' : '#353535',
                                                    borderRadius: 20
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
                                                <Image
                                                    source = {require('../../images/close-cross-in-circular-outlined-interface-button.png')}
                                                    style = {{
                                                        width: 12,
                                                        height: 12,
                                                        tintColor: mode == '' ? '#222f3e' : 'white'
                                                    }}
                                                />
                                            </View>
                                        </TouchableOpacity>
                                    )
                                })
                            }
                        </ScrollView>
                </View>
                : null
            }
            <View style = {{flex: 1,}} >
                <ScrollView        
                    keyboardShouldPersistTaps = 'handled'
                >
                    {
                        users.map((item, index) => {
                            const isThisUserAParticipant = participant.filter(user => user.username == item.username).length == 1

                            return (
                                <TouchableOpacity
                                    key = {index}
                                    activeOpacity = {0.6}
                                    // onPress = {() => navigation.navigate('Chat', {fromScreen:'Home', roomIndex, withUser: interlocutors})}
                                    onPress = {() => {
                                        if(!isThisUserAParticipant) {
                                            const newParticipant = participant.concat(item)
    
                                            setParticipant(newParticipant)  
                                        } else {
                                            for (let index = 0; index < participant.length; index++) {
                                                const element = participant[index];
                                                if (element.username == item.username) {
                                                    const newParticipant = JSON.parse(JSON.stringify(participant))
                                                    newParticipant.splice(index, 1)
                                                    setParticipant(newParticipant)
                                                    scrollViewHorizontalRef.current?.scrollTo({x: 0})
                                                    break
                                                }
                                                
                                            }
                                        }
                                    }}
                                    style = {{
                                        flexDirection: 'row',
                                        padding: 10,
                                        alignItems: 'center',
                                        borderBottomColor: mode == '' ? '#c8d6e5' : '#2D2D2D',
                                        borderBottomWidth: 1,
                                        marginTop: 10
                                    }}
                                >
                                    <View
                                        style = {{
                                            paddingLeft: 10,
                                            flexDirection: 'row',
                                            alignItems: 'center'
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

                                        {
                                            isThisUserAParticipant ?
                                                <Image
                                                    source = {require('../../images/ic_checkbox_blue_filled.png')}
                                                    style = {{
                                                        width: 15,
                                                        height: 15,
                                                        marginLeft: 10,
                                                    }}
                                                />
                                                :
                                                null
                                        }
                                    </View>
                                </TouchableOpacity>
                            )
                        })
                    }
                </ScrollView>
            </View>
            <Animated.View
                style = {{
                    position: 'absolute',
                    bottom: 20, right: 20,
                    backgroundColor: mode == '' ? '#48dbfb' : '#2D2D2D',
                    borderRadius: 40,
                    padding: 10,
                    transform: [{scale: scaleNext}]
                }}
            >
                <Pressable
                    onPress = {() => {
                        submit()
                    }}
                    onPressIn = {() => {
                        Animated.timing(scaleNext, {
                            toValue: 0.8,
                            duration: 100,
                            useNativeDriver: true
                        }).start()
                    }}
                    onPressOut = {() => {
                        Animated.timing(scaleNext, {
                            toValue: 1,
                            duration: 100,
                            useNativeDriver: true
                        }).start()
                    }}
                >
                    <Image
                        source = {require('../../images/ic_add_white.png')}
                        style = {{ width: 20, height: 20, tintColor: 'white' }}
                    />
                </Pressable>
            </Animated.View>
        </SafeAreaView>
        </>
    )
}

export default NewGroup