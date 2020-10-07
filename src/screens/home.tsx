import React, { useState, useEffect, useRef } from 'react'
import { 
    View, 
    Text, 
    ScrollView, 
    SafeAreaView, 
    Image, 
    TouchableOpacity, 
    Pressable, 
    Animated, 
    Dimensions, 
    Modal, 
    TextInput, 
    StatusBar } from 'react-native'

import { Fonts } from './../references/fonts';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

import { StackParamsList } from '../references/types/navigator'
import LinearGradient from 'react-native-linear-gradient';
import database from '@react-native-firebase/database';
import AsyncStorage from '@react-native-community/async-storage';

import { SessionUserType } from '../references/types/session-user'
import { RoomType } from '../references/types/room'
import { getStatusBarHeight } from 'react-native-status-bar-height';
import SideMenu from 'react-native-side-menu-updated'
import moment from 'moment'
import {setNavigationProp} from '../references/navigationProp'


type PropsList = {
    navigation: StackNavigationProp<StackParamsList, 'Home'>
    route: RouteProp<StackParamsList, 'Home'>
}

type usersType = {
    username: string
}
type notificationProps = {
    roomIndex: any,
    withUser: any
}

type PropsMenu = {
    changeTheme: () => void,
    logoutModal: () => void,
    backgroundColor: string,
    color: string,
    username: string,
    backgroundColorUsername: string,
    usernameColor: string,
    modeIcon: any,
    linearGradientColors: any,
    linearGradientOpacity: any
}

class Menu extends React.Component<PropsMenu, {}> {
    
    render() {
        const { logoutModal, color, backgroundColor, backgroundColorUsername, username, usernameColor, changeTheme, modeIcon, linearGradientColors, linearGradientOpacity } = this.props
        return (
            <View
                style = {{
                    flex:1,
                    backgroundColor,
                }}
            >
                <View
                    style = {{
                        height: '30%',
                        width: '100%',
                        padding: 20,
                        backgroundColor: backgroundColorUsername,
                        justifyContent: 'flex-end'
                    }}
                >
                    <LinearGradient
                        colors = {linearGradientColors}
                        start = {{x: 0, y: 1.4}}
                        end = {{x: 0.6, y: 0}}
                        style = {{
                            position: 'absolute',
                            top: 0, left: 0, right: 0, bottom: 0,
                            opacity: linearGradientOpacity
                        }}
                    />
                    <Text
                        style = {{
                            color: usernameColor,
                            fontSize: 24,
                            fontWeight: '700'
                        }}
                    >
                        {username}
                    </Text>
                </View>
                <View style = {{ flex: 1, padding: 20 }} >
                <TouchableOpacity
                        onPress = {() => {
                            changeTheme()
                        }}
                        style = {{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginBottom: 20
                        }}
                    >
                        <Image
                            source = {modeIcon}
                            style = {{
                                width: 22,
                                height: 22,
                                tintColor: color,
                                marginRight: 20
                            }}
                        />
                        <Text
                            style = {{
                                color
                            }}
                        >
                            Change Theme
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress = {() => {
                            logoutModal()
                        }}
                        style = {{
                            flexDirection: 'row',
                            alignItems: 'center'
                        }}
                    >
                        <Image
                            source = {require('../images/ic_keluar.png')}
                            style = {{
                                width: 22,
                                height: 22,
                                tintColor: color,
                                marginRight: 20
                            }}
                        />
                        <Text
                            style = {{
                                color
                            }}
                        >
                            Logout
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }
}

const Home = (props: PropsList) => {
    const { navigation, route } = props
    const { OpenSans } = Fonts
    const { width, height } = Dimensions.get('window')

    const [sessionUser, setSessionUser] = useState({} as SessionUserType)
    const [rooms, setRooms] = useState([] as RoomType[])
    
    const [modalVisible, setModalVisible] = useState(false)
    const [modalSearching, setModalSearching] = useState(false)
    const [users, setUsers] = useState([] as usersType[])

    const scale = useRef(new Animated.Value(0)).current
    const scaleSearch = useRef(new Animated.Value(0)).current
    const scaleGradient = useRef(new Animated.Value(0)).current
    const modalOpacity = useRef(new Animated.Value(0)).current
    const circleView = useRef(new Animated.Value(0)).current
    const [mode, setMode] = useState('')
    const [sideMenuVisible, setSideMenuVisible] = useState(false)

    const statusBarHeight = getStatusBarHeight()

    useEffect(() => {        
        checkTheme()
        setNavigationProp(navigation)
        checkNotificationSession()
        getSessionUserAndRooms()
        Animated.parallel([
            Animated.timing(circleView, {
                toValue: 1,
                duration: 300,
                delay: 200,
                useNativeDriver: true,
            }),
            Animated.timing(scaleSearch, {
                toValue: 1,
                duration: 300,
                delay: 200,
                useNativeDriver: true
            }),
            Animated.timing(scaleGradient, {
                toValue: 1,
                duration: 300,
                delay: 200,
                useNativeDriver: true
            })
        ]).start()
    }, [])
    const checkTheme = async() => {
        const themeMode = await AsyncStorage.getItem('mode')
        console.log(themeMode)
        if (themeMode != null) {
            setMode('dark')
        }
    }
    const changeTheme = async() => {
        const themeMode = await AsyncStorage.getItem('mode')
        if(themeMode == null) {
            await AsyncStorage.setItem('mode', 'dark')
            setMode('dark')
        } else {
            await AsyncStorage.removeItem('mode')
            setMode('')
        }

    }

    async function checkNotificationSession() {
        const sessionNotification = await AsyncStorage.getItem('notification')
        console.log(sessionNotification)
        if (sessionNotification != null) {
            const sessionNotificationData = JSON.parse(sessionNotification) as notificationProps
            navigation.navigate('Chat', {
                fromScreen: 'Home',
                roomIndex: sessionNotificationData.roomIndex,
                withUser: sessionNotificationData.withUser
            })
        }
    }

    async function getSessionUserAndRooms() {
        const recentSessionUser = JSON.parse(await AsyncStorage.getItem('SessionUser') as string) as SessionUserType
        const token = await AsyncStorage.getItem('token')

        setSessionUser(recentSessionUser)

        database()
        .ref('/rooms/')
        .on('value', (snapshot: any) => {
            let roomsData = ((snapshot.val() || []) as RoomType[]).filter(room => room.participants.includes(recentSessionUser.username))

            setRooms(roomsData)
        })
        database()
            .ref('/users/')
            .on('value', async(snapshot: any) => {
                const usersData = snapshot.val() || []
                
                for (let index = 0; index < usersData.length; index++) {
                    const currentIndexUserData = usersData[index];

                    if (currentIndexUserData.username == recentSessionUser.username && currentIndexUserData.password == recentSessionUser.password) {
                        if (currentIndexUserData.token != token) {
                            navigation.replace('Login')
                            await AsyncStorage.removeItem('SessionUser')
                            console.log('Token Expired')
                            break
                        }
                    }
                }
            })
    }
    const textInputRef = useRef<TextInput>(null)

    const search = (value: string) => {        
        database()
        .ref('/users')
        .on('value', (snapshot:any) => {
            let users = (snapshot.val() || []) as usersType[]

            let filteredUsers = users.filter(user => user.username.toLocaleLowerCase().includes(value.toLowerCase()) && user.username != sessionUser.username)

            setUsers(filteredUsers)
        })
    }    

    const logout = async() => {
        database()
            .ref('users')
            .once('value')
            .then(snapshot => {
                const usersData = snapshot.val() || []
                
                for (let index = 0; index < usersData.length; index++) {
                    const currentIndexUserData = usersData[index];

                    if (sessionUser.username === currentIndexUserData.username.toLowerCase() && sessionUser.password === currentIndexUserData.password) {                        
                        database()
                            .ref(`users/${index}`)
                            .update({
                                token: ''
                            })
                            .then(async() => {
                                await AsyncStorage.removeItem('SessionUser')
                                Animated.timing(modalOpacity, {
                                    toValue: 0,
                                    duration: 100,
                                    useNativeDriver: true
                                }).start(() => {
                                    StatusBar.setHidden(false)
                                    setModalVisible(false)
                                    navigation.replace('Login')
                                })
                            })

                        break
                    }
                }
            })
    }
    const menu = <Menu 
                    logoutModal = {() => {
                        StatusBar.setHidden(true)
                        setModalVisible(true)
                        Animated.timing(modalOpacity, {
                            toValue: 1,
                            duration: 100,
                            delay: 200,
                            useNativeDriver: true
                        }).start()
                    }} 
                    backgroundColor = {mode == 'dark' ? '#1D1D1D' : '#f9f9f9'}
                    color = {mode == 'dark' ? 'white' : 'black'}
                    usernameColor = 'white'
                    username = {sessionUser.username}
                    backgroundColorUsername = {mode == '' ? '#0abde3' : '#262626'}
                    changeTheme = {() => changeTheme()}
                    modeIcon = {mode == '' ? require('../images/dark.png') : require('../images/light.png')}
                    linearGradientColors = {mode == '' ? ['#10ac84', '#48dbfb'] : ['#262626', '#262626']}
                    linearGradientOpacity = {mode == '' ? 0.8 : 1}
                />
    return(        
        <>
        <StatusBar translucent backgroundColor='transparent' barStyle = 'light-content' />
        <SideMenu
            menu = {menu}
            isOpen = {sideMenuVisible}
            bounceBackOnOverdraw = {false}
            onChange = {(isOpen) => {
                if (isOpen == false) {
                    setSideMenuVisible(false)
                }
            }}
            animationFunction = {(prop, value) => Animated.spring(prop, {
                toValue: value,
                friction: 20,
                useNativeDriver: true
            })}
        >
            <SafeAreaView
                style = {{
                    flex: 1,
                    backgroundColor: mode == 'dark' ? '#1D1D1D' : '#f9f9f9'
                }}
            >
                <Animated.View
                    style = {{
                        backgroundColor: mode == '' ? 'white' : '#212121',
                        height,
                        width,
                        position: 'absolute',
                        borderBottomEndRadius: 600,
                        transform: [{scaleY: circleView}]
                    }}
                />
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
                            onPress = {() => setSideMenuVisible(true)}
                        >
                            <Image
                                source = {require('../images/menu-bar.png')}
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
                            Skuy Chat
                        </Text>
                    </View>

                </View>
                <ScrollView
                    keyboardShouldPersistTaps = 'handled'
                >
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
                                        padding: 10,
                                        alignItems: 'center',
                                        borderBottomColor: mode == '' ? '#c8d6e5' : '#2D2D2D',
                                        borderBottomWidth: 1,
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
                                            flex: 1,
                                            justifyContent: 'space-between',
                                        }}
                                    >
                                        <Text
                                            numberOfLines = {1}
                                            style = {{
                                                fontFamily: OpenSans.SemiBold,
                                                color: mode == '' ? '#222f3e' : 'white',
                                                fontSize: 14,
                                            }}
                                        >
                                            {interlocutors}
                                        </Text>
                                        <Text
                                            numberOfLines = {1}
                                            style = {{
                                                fontFamily: OpenSans.Regular,
                                                color: mode == '' ? '#222f3e' : 'lightgrey',
                                                fontSize: 12, 
                                            }}
                                        >
                                            {room.messages![room.messages!.length - 1].sender + ' : ' + room.messages![room.messages!.length - 1].text}
                                        </Text>
                                    </View>
                                    <View>
                                        <Text
                                            numberOfLines = {1}
                                            style = {{
                                                fontFamily: OpenSans.Regular,
                                                color: mode == '' ? 'grey' : 'lightgrey',
                                                fontSize: 12,
                                                flex: 1,
                                                justifyContent: 'flex-end'
                                            }}
                                        >
                                            {moment(room.messages![room.messages!.length - 1].time).format('HH:mm')}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            )
                        })
                    }
                </ScrollView>
                
                <Animated.View
                    style = {{
                        position: 'absolute',
                        bottom: 20, right: 20,
                        backgroundColor: mode == '' ? '#48dbfb' : '#2D2D2D',
                        borderRadius: 40,
                        padding: 10,
                        transform: [{scale: scaleSearch}]
                    }}
                >
                    <Pressable
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
                        onPressIn = {() => {
                            Animated.timing(scaleSearch, {
                                toValue: 0.8,
                                duration: 100,
                                useNativeDriver: true
                            }).start()
                        }}
                        onPressOut = {() => {
                            Animated.timing(scaleSearch, {
                                toValue: 1,
                                duration: 100,
                                useNativeDriver: true
                            }).start()
                        }}
                    >
                        <Image
                            source = {require('../images/message.png')}
                            style = {{ width: 20, height: 20, tintColor: 'white' }}
                        />
                    </Pressable>
                </Animated.View>
                <Modal
                    onRequestClose = {() => {
                        Animated.timing(modalOpacity, {
                            toValue: 0,
                            duration: 100,
                            useNativeDriver: true
                        }).start(() => {
                            StatusBar.setHidden(false)
                            setModalVisible(false)
                        })
                    }}
                    visible = {modalVisible}
                    transparent = {true}
                    animationType = 'slide'
                >
                    <View
                        style = {{
                            flex: 1
                        }}
                    >
                        <Animated.View
                            style = {{
                                width: '100%',
                                height: '100%',
                                backgroundColor: 'rgba(0,0,0,0.5)',
                                opacity: modalOpacity
                            }}
                        >
                            <TouchableOpacity
                                onPress = {() => {
                                    Animated.timing(modalOpacity, {
                                        toValue: 0,
                                        duration: 100,
                                        useNativeDriver: true
                                    }).start(() => {
                                        StatusBar.setHidden(false)
                                        setModalVisible(false)
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
                                height: height * 0.3,
                                bottom: 0,
                                backgroundColor: mode == '' ? 'white' : '#262626',
                                borderTopEndRadius: 20,
                                borderTopStartRadius: 20,
                                padding: 20,
                                flex:1,
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <Text
                                style = {{
                                    fontFamily: OpenSans.SemiBoldItalic,
                                    fontSize: 20,
                                    letterSpacing: 0.5,
                                    color: mode == '' ? 'black' : 'white'
                                }}
                            >
                                Anda Yakin Ingin Keluar ?
                            </Text>
                            <Text
                                style = {{
                                    fontFamily: OpenSans.Light,
                                    color: mode == '' ? 'black' : 'white'
                                }}
                            >
                                Klik Logout untuk keluar
                            </Text>
                            <View style = {{flexDirection: 'row', marginTop: 10}} >
                                <TouchableOpacity
                                    onPress = {() => {
                                        Animated.timing(modalOpacity, {
                                            toValue: 0,
                                            duration: 100,
                                            useNativeDriver: true
                                        }).start(() => {
                                            StatusBar.setHidden(false)
                                            setModalVisible(false)
                                        })
                                    }}
                                    style = {{
                                        backgroundColor: mode == '' ? '#10ac84' : '#128c6b',
                                        borderColor: mode == '' ? '#10ac84' : '#128c6b',
                                        borderWidth: 1,
                                        borderRadius: 10,
                                        paddingHorizontal: 20,
                                        paddingVertical: 10,
                                        marginRight: 5
                                    }}
                                >
                                    <Text style = {{ color: 'white' }} >
                                        BATAL
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress = {logout}
                                    style = {{
                                        borderColor: mode == '' ? '#ee5253' : '#f75656',
                                        borderWidth: 1,
                                        borderRadius: 10,
                                        paddingHorizontal: 20,
                                        paddingVertical: 10,
                                        marginLeft: 5
                                    }}
                                >
                                    <Text style = {{ color: mode == '' ? '#ee5253' : '#f75656' }} >
                                        LOGOUT
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
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
                                height: height * 0.5,
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
                                                        let selectedRoomIndex = -1

                                                        for(let roomIndex = 0; roomIndex < rooms.length; roomIndex++) {
                                                            if(rooms[roomIndex].participants.includes(sessionUser.username) && rooms[roomIndex].participants.includes(item.username)) {
                                                                selectedRoomIndex = roomIndex
                                                            }
                                                        }
                                                        StatusBar.setHidden(false)
                                                        setUsers([])
                                                        setModalSearching(false)

                                                        if(selectedRoomIndex != -1) {
                                                            navigation.navigate('Chat', {fromScreen:'Home', roomIndex: selectedRoomIndex, withUser: item.username})
                                                        } else {
                                                            navigation.navigate('Chat', {fromScreen:'Home', withUser: item.username})
                                                        }
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
            </SafeAreaView>
        
        </SideMenu>
        </>
    )
}

export default Home