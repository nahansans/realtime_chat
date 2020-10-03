import React, { useState, useEffect, useRef } from 'react'
import { View, Text, ScrollView, SafeAreaView, Image, TouchableOpacity, Pressable, Animated, Dimensions, Modal, TextInput } from 'react-native'

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

type usersType = {
    username: string
}

const Home = (props: PropsList) => {
    const { navigation, route } = props
    const { OpenSans } = Fonts
    const { width, height } = Dimensions.get('window')

    const [sessionUser, setSessionUser] = useState({} as SessionUserType)
    const [rooms, setRooms] = useState([] as RoomType[])
    const scale = useRef(new Animated.Value(1)).current
    const scaleSearch = useRef(new Animated.Value(1)).current
    const [modalVisible, setModalVisible] = useState(false)
    const [modalCreateRoom, setModalCreateRoom] = useState(false)
    const [modalSearching, setModalSearching] = useState(false)
    const [users, setUsers] = useState([] as usersType[])
    const [typing, setTyping] = useState('')

    useEffect(() => {
        getSessionUserAndRooms()
        // search()
    }, [])

    async function getSessionUserAndRooms() {
        const sessionUser = await AsyncStorage.getItem('SessionUser')

        setSessionUser(JSON.parse(sessionUser!) as SessionUserType)

        database()
        .ref('/rooms/')
        .on('value', (snapshot: any) => setRooms((snapshot.val() || []) as RoomType[]))
    }
    const textInputRef = useRef<TextInput>(null)

    const search = async() => {
        textInputRef.current?.blur()
        database()
        .ref('/users')
        .on('value', (snapshot:any) => {
            let users = (snapshot.val() || []) as usersType[]

            let filteredUsers = users.filter(user => user.username.includes(typing))
            setUsers(filteredUsers)
        })
    }    

    const chooseChat = (interlocutors: any) => {
        for (let index = 0; index < rooms.length; index++) {
            const element = rooms[index];
            console.log(element.participants[0])
            if (element.participants[0] === sessionUser.username && element.participants[1] == interlocutors || element.participants[0] == interlocutors && element.participants[1] === sessionUser.username) {
                const intrlctrs = element.participants[0] == sessionUser!.username ? element.participants[1] : element.participants[0]
                setModalSearching(false)
                setUsers([])
                navigation.navigate('Chat', {fromScreen:'Home', roomIndex: index, withUser: intrlctrs})
            }
        }
        
    }

    return(
        <SafeAreaView
            style = {{
                flex: 1,
            }}
        >
            <View
                style = {{
                    backgroundColor: 'white',
                    height,
                    width,
                    position: 'absolute',
                    borderBottomEndRadius: 600
                }}
            />
            <View
                style = {{
                    backgroundColor: '#0abde3',
                    paddingHorizontal: 20,
                    overflow: 'hidden',   
                    paddingVertical: 10            
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
                            marginLeft: 10,
                            justifyContent: 'space-between',
                            flex: 1
                        }}
                    >
                        Skuy Chat
                    </Text>
                    <TouchableOpacity
                        onPress = {() => setModalVisible(true)}
                    >
                        <Image
                            source = {require('../images/ic_keluar.png')}
                            style = {{
                                width: 22,
                                height: 22,
                                tintColor: 'white'
                            }}
                        />
                    </TouchableOpacity>
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
                                    padding: 10,
                                    alignItems: 'center',
                                    borderBottomColor: '#c8d6e5',
                                    borderBottomWidth: 1
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
            
            <Animated.View
                style = {{
                    position: 'absolute',
                    bottom: 75, right: 20,
                    backgroundColor: '#48dbfb',
                    borderRadius: 40,
                    padding: 10,
                    transform: [{scale: scaleSearch}]
                }}
            >
                <Pressable
                    onPress = {() => setModalSearching(true)}
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
                        source = {require('../images/search.png')}
                        style = {{ width: 18, height: 18, tintColor: 'white' }}
                    />
                </Pressable>
            </Animated.View>
            <Animated.View
                style = {{
                    position: 'absolute',
                    bottom: 20, right: 20,
                    backgroundColor: '#48dbfb',
                    borderRadius: 40,
                    padding: 10,
                    transform: [{scale}]
                }}
            >
                <Pressable
                    onPress = {() => setModalCreateRoom(true)}
                    onPressIn = {() => {
                        Animated.timing(scale, {
                            toValue: 0.7,
                            duration: 100,
                            useNativeDriver: true
                        }).start()
                    }}
                    onPressOut = {() => {
                        Animated.timing(scale, {
                            toValue: 1,
                            duration: 100,
                            useNativeDriver: true
                        }).start()
                    }}
                >
                    <Image
                        source = {require('../images/ic_add_white.png')}
                        style = {{ width: 30, height: 30 }}
                    />
                </Pressable>
            </Animated.View>
            <Modal
                visible = {modalVisible}
                transparent = {true}
            >
                <View
                    style = {{
                        flex: 1
                    }}
                >
                    <TouchableOpacity
                        onPress = {() => setModalVisible(false)}
                        style = {{
                            width: '100%',
                            height: '100%',
                            backgroundColor: 'rgba(0,0,0,0.5)'
                        }}
                    />
                    <View
                        style = {{
                            position: 'absolute',
                            width,
                            height: height * 0.3,
                            bottom: 0,
                            backgroundColor: 'white',
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
                                letterSpacing: 0.5
                            }}
                        >
                            Anda Yakin Ingin Keluar ?
                        </Text>
                        <Text
                            style = {{
                                fontFamily: OpenSans.Light
                            }}
                        >
                            Klik Logout untuk keluar
                        </Text>
                        <View style = {{flexDirection: 'row', marginTop: 10}} >
                            <TouchableOpacity
                                onPress = {() => setModalVisible(false)}
                                style = {{
                                    backgroundColor: '#10ac84',
                                    borderColor: '#10ac84',
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
                                onPress = {async() => {
                                    await AsyncStorage.removeItem('SessionUser')
                                    setModalVisible(false)
                                    navigation.replace('Login')
                                }}
                                style = {{
                                    borderColor: '#ee5253',
                                    borderWidth: 1,
                                    borderRadius: 10,
                                    paddingHorizontal: 20,
                                    paddingVertical: 10,
                                    marginLeft: 5
                                }}
                            >
                                <Text style = {{ color: '#ee5253' }} >
                                    LOGOUT
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
            <Modal
                visible = {modalCreateRoom}
                transparent = {true}
            >
                <View
                    style = {{
                        flex: 1
                    }}
                >
                    <TouchableOpacity
                        onPress = {() => setModalCreateRoom(false)}
                        style = {{
                            width: '100%',
                            height: '100%',
                            backgroundColor: 'rgba(0,0,0,0.5)'
                        }}
                    />
                    <View
                        style = {{
                            position: 'absolute',
                            width,
                            height: height * 0.3,
                            bottom: 0,
                            backgroundColor: 'white',
                            borderTopEndRadius: 20,
                            borderTopStartRadius: 20,
                            padding: 20,
                            flex:1,
                            justifyContent: 'center'
                        }}
                    >
                        <Text
                            style = {{
                                fontFamily: OpenSans.Regular,
                                textAlign: 'center'
                            }}
                        >
                            Buat Room Chat
                        </Text>
                        <TextInput
                            style = {{
                                borderColor: '#222f3e',
                                borderWidth: 1,
                                paddingHorizontal: 10,
                                marginVertical: 5,
                                borderRadius: 10,
                                fontFamily: OpenSans.Regular
                            }}
                        />
                        <View style = {{flexDirection: 'row', marginTop: 10, alignSelf: 'center'}} >
                            <TouchableOpacity
                                onPress = {() => setModalCreateRoom(false)}
                                style = {{
                                    borderColor: '#ee5253',
                                    borderWidth: 1,
                                    borderRadius: 10,
                                    paddingHorizontal: 20,
                                    paddingVertical: 10,
                                    marginRight: 5
                                }}
                            >
                                <Text style = {{ color: '#ee5253', textAlign: 'center' }} >
                                    BATAL
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress = {() => {
                                    setModalCreateRoom(false)
                                }}
                                style = {{
                                    backgroundColor: '#10ac84',
                                    borderColor: '#10ac84',
                                    borderWidth: 1,
                                    borderRadius: 10,
                                    paddingHorizontal: 20,
                                    paddingVertical: 10,
                                    marginLeft: 5,
                                }}
                            >
                                <Text style = {{ color: 'white', textAlign: 'center' }} >
                                    BUAT
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
            <Modal
                visible = {modalSearching}
                transparent = {true}
            >
                <View
                    style = {{
                        flex: 1
                    }}
                >
                    <TouchableOpacity
                        onPress = {() => {
                            setModalSearching(false)
                            setUsers([])
                        }}
                        style = {{
                            width: '100%',
                            height: '100%',
                            backgroundColor: 'rgba(0,0,0,0.5)'
                        }}
                    />
                    <View
                        style = {{
                            position: 'absolute',
                            width,
                            height: height * 0.75,
                            bottom: 0,
                            backgroundColor: 'white',
                            borderTopEndRadius: 20,
                            borderTopStartRadius: 20,
                            padding: 20,
                            flex:1,
                        }}
                    >
                        <Text
                            style = {{
                                fontFamily: OpenSans.Regular,
                                textAlign: 'center'
                            }}
                        >
                            Searching User
                        </Text>
                        <View style = {{flex: 1}} >
                            <ScrollView>
                                {
                                    users.map((item, index) => {
                                        return (
                                            <TouchableOpacity
                                                key = {index}
                                                activeOpacity = {0.6}
                                                // onPress = {() => navigation.navigate('Chat', {fromScreen:'Home', roomIndex, withUser: interlocutors})}
                                                onPress = {() => {
                                                    chooseChat(item.username)
                                                }}
                                                style = {{
                                                    flexDirection: 'row',
                                                    padding: 10,
                                                    alignItems: 'center',
                                                    borderBottomColor: '#c8d6e5',
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
                                                            color: '#222f3e',
                                                            fontSize: 14
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
                        <View style = {{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }} >
                            <TextInput
                                ref = {textInputRef}
                                returnKeyType = {'search'}
                                placeholder = 'searching user...'
                                style = {{
                                    borderColor: '#222f3e',
                                    borderWidth: 1,
                                    paddingHorizontal: 10,
                                    marginVertical: 5,
                                    borderRadius: 10,
                                    fontFamily: OpenSans.Regular,
                                    flex: 1,
                                    marginRight: 10
                                }}
                                onChangeText = {(value) => {
                                    setTyping(value)
                                }}
                                onSubmitEditing = {search}
                            />
                            <TouchableOpacity
                                onPress = {search}
                                style = {{
                                    backgroundColor: '#48dbfb',
                                    padding: 12,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    borderRadius: 10
                                }}
                            >
                                <Image
                                    source = {require('../images/search.png')}
                                    style = {{
                                        width: 17,
                                        height: 17,
                                        tintColor: 'white'
                                    }}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    )
}

export default Home