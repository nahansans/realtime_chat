import React, { useState, useEffect, useRef} from 'react'
import { View, Text, Image, TextInput, TouchableOpacity, Pressable, Animated, Easing, ActivityIndicator } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { StackNavigationProp } from '@react-navigation/stack'
import { StackParamsList } from '../references/types/navigator'
import { Fonts } from './../references/fonts';
import { RouteProp } from '@react-navigation/native'

type PropsList = {
    navigation: StackNavigationProp<StackParamsList, 'Login'>
    route: RouteProp<StackParamsList, 'Login'>
}

const Login = (props: PropsList) => {
    const {OpenSans} = Fonts
    const { navigation , route } = props
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [scale, setScale] = useState(new Animated.Value(0))
    const [isLoading, setisLoading] = useState(false)
    
    const passwordRef = useRef<TextInput>(null)

    const login = () => {
        setisLoading(true)
        if (username !== '' && password !== '') {
            setTimeout(() => {
                navigation.replace('Home')
                setisLoading(false)
            }, 1000);
        }
    }

    return (
        <View style = {{ flex: 1 }} >
            <LinearGradient
                colors = {['#FFF', '#48dbfb']}
                style = {{
                    opacity: 0.2,
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0
                }}
            />
            <View
                style = {{
                    height: 500,
                    width: 500,
                    borderBottomStartRadius: 200,
                    borderBottomEndRadius: 255,
                    position: 'absolute',
                    top: -50,
                    left: -130,
                    backgroundColor: '#FFF'
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
                            marginLeft: 10
                        }}
                    >
                        Login
                    </Text>
                </View>
                <Text
                    style = {{
                        marginTop: 10,
                        fontSize: 16,
                        fontFamily: OpenSans.Regular,
                        letterSpacing: 0.2
                    }}
                >
                    Username
                </Text>
                <TextInput
                    returnKeyType = 'next'
                    onSubmitEditing = {() => passwordRef.current?.focus()}
                    style = {{
                        borderRadius:50,
                        borderWidth: 1,
                        borderColor: '#c8d6e5',
                        marginTop: 10,
                        paddingHorizontal: 20,
                        backgroundColor: '#FFF',
                        fontFamily: OpenSans.Regular,
                        color: '#222f3e'
                    }}
                    placeholder = 'username'
                    placeholderTextColor = '#c8d6e5'
                    onChangeText = {(value) => {
                        setUsername(value)
                    }}
                />
                
                <Text
                    style = {{
                        marginTop: 10,
                        fontSize: 16,
                        fontFamily: OpenSans.Regular,
                        letterSpacing: 0.2
                    }}
                >
                    Password
                </Text>
                <TextInput
                    returnKeyType = 'go'
                    secureTextEntry = {true}
                    onSubmitEditing = {login}
                    ref = {passwordRef}
                    style = {{
                        borderRadius:50,
                        borderWidth: 1,
                        borderColor: '#c8d6e5',
                        marginTop: 10,
                        paddingHorizontal: 20,
                        backgroundColor: '#FFF',
                        fontFamily: OpenSans.Regular,
                        color: '#222f3e'
                    }}
                    placeholder = 'password'
                    placeholderTextColor = '#c8d6e5'
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
                            color: '#222f3e',
                            marginRight: 5
                        }}
                    >
                        Belum Punya Akun?
                    </Text>
                    <TouchableOpacity
                        activeOpacity = {0.8}
                        onPress = {() => {
                            navigation.replace('Register')
                        }}
                    >
                        <Text
                        style = {{
                            marginTop: 10,
                            fontSize: 12,
                            fontFamily: OpenSans.Regular,
                            letterSpacing: 0.2,
                            color: '#341f97'
                        }}
                        >
                            Daftar
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
                    onPress = {login}
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
                            backgroundColor: username == '' || password == '' ? 'grey' :'#0abde3',
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

export default Login