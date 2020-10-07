import React, { useState, useEffect, useRef} from 'react'
import { View, Text, Image, TextInput, TouchableOpacity, Pressable, Animated, Easing, ActivityIndicator, StatusBar } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { StackNavigationProp } from '@react-navigation/stack'
import { StackParamsList } from '../references/types/navigator'
import { Fonts } from './../references/fonts';
import { RouteProp } from '@react-navigation/native'
import database from '@react-native-firebase/database'
import Snackbar from 'react-native-snackbar'
import AsyncStorage from '@react-native-community/async-storage'

type usersDataType = {
    username: string,
    password: string,
    token: string
}


type PropsList = {
    navigation: StackNavigationProp<StackParamsList, 'Register'>
    route: RouteProp<StackParamsList, 'Register'>
}

const Register = (props: PropsList) => {
    const {OpenSans} = Fonts
    const { navigation , route } = props
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [scale, setScale] = useState(new Animated.Value(0))
    const [isLoading, setisLoading] = useState(false)
    const [usersData, setusersData] = useState<usersDataType[]>([])  
    const [mode, setMode] = useState('')
    const passwordRef = useRef<TextInput>(null)

    const circleView = useRef(new Animated.Value(0)).current
    
    useEffect(() => {
        StatusBar.setBarStyle('dark-content')
        checkTheme()
        Animated.timing(circleView, {
            toValue: 1,
            duration: 300,
            delay: 200,
            useNativeDriver: true,
        }).start()
        getUsersData()
    }, [])
    const checkTheme = async() => {
        const themeMode = await AsyncStorage.getItem('mode')
        console.log(themeMode)
        if (themeMode != null) {
            setMode('dark')
            StatusBar.setBarStyle('light-content')
        }
    }

    async function getUsersData() {        
        database()
            .ref('users')
            .once('value')
            .then((snapshot: any) => {
                setusersData((snapshot.val() || []) as usersDataType[])
            })
    }

    function submit() {
        setisLoading(true)

        if(usersData.length > 0) {
            for (let index = 0; index < usersData.length; index++) {
                const element = usersData[index];
                
                if (username.toLowerCase() === element.username.toLowerCase()) {
                    Snackbar.show({
                        text: 'Username Sudah Digunakan',
                        duration: Snackbar.LENGTH_SHORT,
                    });
                    setisLoading(false)
    
                    break
                } else {
                    register()
                }
            }
        } else {
            register()
        }
    }
    function register() {        
        // console.log()
        let newUsersData = JSON.parse(JSON.stringify(usersData)) as usersDataType[]

        newUsersData.push({
            username: username.toLowerCase(),
            password,
            token: ''
        })   

        let usersDataToSend = {} as any

        for(let userDataIndex = 0; userDataIndex < newUsersData.length; userDataIndex++) {
            usersDataToSend[userDataIndex.toString()] = newUsersData[userDataIndex]
        }

        database()
        .ref(`/users/`)
        .update(usersDataToSend)
        .then(() => {
            navigation.navigate('Login')
            
            setisLoading(false)
        })
    }

    return (
        <View style = {{ flex: 1 }} >
            <LinearGradient
                colors = {mode == '' ? ['#FFF', '#48dbfb'] : ['#1D1D1D', '#1D1D1D']}
                style = {{
                    opacity: mode == '' ? 0.2 : 1,
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0
                }}
            />
            <Animated.View
                style = {{
                    height: 500,
                    width: 500,
                    borderBottomStartRadius: 200,
                    borderBottomEndRadius: 255,
                    position: 'absolute',
                    top: -50,
                    left: -130,
                    backgroundColor: mode == '' ? 'white' : '#212121',
                    transform: [{scaleY: circleView}]
                }}
            />
            <View
                style = {{
                    marginTop: 100,
                    marginHorizontal: 20,
                }}
            >
                <View
                    style = {{
                        flexDirection: 'row',
                        alignItems: 'center'
                    }}
                >
                    <Image
                        source = {require('../images/chat.png')}
                        style = {{
                            width: 70,
                            height: 70
                        }}
                    />
                    <Text
                        style = {{
                            marginTop: 20,
                            fontSize: 20,
                            fontFamily: OpenSans.SemiBold,
                            letterSpacing: 0.8,
                            marginLeft: 10,
                            color: mode == '' ? 'black' : 'white'
                        }}
                    >
                        Register
                    </Text>
                </View>
                <Text
                    style = {{
                        marginTop: 20,
                        fontSize: 16,
                        fontFamily: OpenSans.Regular,
                        letterSpacing: 0.2,
                        color: mode == '' ? 'black' : 'white'
                    }}
                >
                    Username
                </Text>
                <TextInput
                    autoCapitalize = 'none'
                    returnKeyType = 'next'
                    onSubmitEditing = {() => passwordRef.current?.focus()}
                    style = {{
                        borderRadius:50,
                        borderWidth: 1,
                        borderColor: mode == '' ? '#c8d6e5' : 'white',
                        marginTop: 10,
                        paddingHorizontal: 20,
                        backgroundColor: mode == '' ? '#FFF' : '#2C2C2C',
                        fontFamily: OpenSans.Regular,
                        color: mode == '' ? '#222f3e' : 'white'
                    }}
                    placeholder = 'username'
                    placeholderTextColor = {mode == '' ? '#c8d6e5' : 'lightgrey'}
                    onChangeText = {(value) => {
                        setUsername(value)
                    }}
                />
                
                <Text
                    style = {{
                        marginTop: 10,
                        fontSize: 16,
                        fontFamily: OpenSans.Regular,
                        letterSpacing: 0.2,
                        color: mode == '' ? 'black' : 'white'
                    }}
                >
                    Password
                </Text>
                <TextInput
                    autoCapitalize = 'none'
                    returnKeyType = 'go'
                    secureTextEntry = {true}
                    onSubmitEditing = {submit}
                    ref = {passwordRef}
                    style = {{
                        borderRadius:50,
                        borderWidth: 1,
                        borderColor: mode == '' ? '#c8d6e5' : 'white',
                        marginTop: 10,
                        paddingHorizontal: 20,
                        backgroundColor: mode == '' ? '#FFF' : '#2C2C2C',
                        fontFamily: OpenSans.Regular,
                        color: mode == '' ? '#222f3e' : 'white'
                    }}
                    placeholder = 'password'
                    placeholderTextColor = {mode == '' ? '#c8d6e5' : 'lightgrey'}
                    onChangeText = {(value) => {
                        setPassword(value)
                    }}
                />
                <View
                    style = {{
                        flexDirection: 'row',
                        alignItems:'center'
                    }}
                >
                    <Text
                        style = {{
                            marginTop: 10,
                            fontSize: 10,
                            fontFamily: OpenSans.Regular,
                            letterSpacing: 0.2,
                            marginRight: 5,
                            color: mode == '' ? '#222f3e' : 'white'
                        }}
                    >
                        Sudah Punya Akun?
                    </Text>
                    <TouchableOpacity
                        activeOpacity = {0.8}
                        onPress = {() => {
                            navigation.replace('Login')
                        }}
                    >
                        <Text
                        style = {{
                            marginTop: 10,
                            fontSize: 12,
                            fontFamily: OpenSans.Regular,
                            letterSpacing: 0.2,
                            color: mode == '' ? '#341f97' : '#856ff2'
                        }}
                        >
                            Login
                        </Text>
                    </TouchableOpacity>
                </View>

                <Pressable
                    disabled = {username == '' || password == '' ? true : false}
                    onPressIn = {() => {
                        Animated.timing(scale, {
                            toValue: 1,
                            duration: 100,
                            useNativeDriver: true
                        }).start()
                    }}
                    onPressOut = {() => {
                        Animated.timing(scale, {
                            toValue: 0,
                            duration: 10,
                            useNativeDriver: true,
                            easing: Easing.ease
                        }).start()
                    }}
                    onPress = {submit}
                    style = {{
                        alignSelf: 'flex-end',
                        marginTop: 20,
                        height: 60,
                        width: 60,
                        alignItems: 'center',
                        justifyContent: 'center'
                        // justifyContent: 'center'
                    }}
                >
                    <View
                        style = {{
                            padding: 10,
                            borderRadius: 20,
                            backgroundColor: username == '' || password == '' ? '#2C2C2C' :'#0abde3',
                            // width: 20,
                            // height: 20,
                        }}
                    >
                        {
                            isLoading ?
                            <ActivityIndicator
                                size = 'small'
                                color = 'white'
                            />
                            :
                            <Image
                                source = {require('../images/right-arrow.png')}
                                style = {{
                                    width: 20,
                                    height: 20,
                                    tintColor: '#FFF'
                                }}
                            />
                        }
                    </View>
                    <Animated.View
                        style = {{
                            position: 'absolute',
                            backgroundColor: 'rgba(0,0,0,0.1)',
                            width: 60, height: 60,
                            borderRadius: 60,
                            transform: [{scale}],
                            // opacity: scale
                        }}
                    />
                </Pressable>                
            </View>
        </View>
    )
}

export default Register