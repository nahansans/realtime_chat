import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, SafeAreaView, Image, TouchableOpacity, Dimensions } from 'react-native'

import { Fonts } from './../references/fonts';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

import { StackParamsList } from '../references/types/navigator'
import LinearGradient from 'react-native-linear-gradient';
import { TextInput } from 'react-native-gesture-handler';

type PropsList = {
    navigation: StackNavigationProp<StackParamsList, 'Chat'>
    route: RouteProp<StackParamsList, 'Chat'>
}

const Chat = (props: PropsList) => {
    const { navigation, route } = props
    const {OpenSans} = Fonts
    const chats = [
        {
            date: '1 Oktober 2020',
            chat_terkirim: [
                `The words hadn't flowed from his fingers for the past few weeks`,
                `Josh had spent year and year accumulating the information. `
            ],
            chat_diterima: [
                `He never imagined he'd find himself with writer's block, but here he sat with a blank screen in front of him.`,
                `He knew it inside out and if there was ever anyone looking for an expert in the field, Josh would be the one to call.`
            ]
        },
        {
            date: '8 Oktober 2020',
            chat_terkirim: [
                `That blank screen taunting him day after day had started to play with his mind.`,
                `The problem was that there was nobody interested in the information besides him and he knew it.`
            ],
            chat_diterima: [
                `He didn't understand why he couldn't even type a single word, just one to begin the process and build from there.`,
                `Years of information painstakingly memorized and sorted with not a sole giving even an ounce of interest in the topic.`
            ]
        },
        {
            date: '10 Oktober 2020',
            chat_terkirim: [
                `And yet, he already knew that the eight hours he was prepared to sit in front of his computer today would end with the screen remaining blank.`,
                `Balloons are pretty and come in different colors, different shapes, different sizes, and they can even adjust sizes as needed. `
            ],
            chat_diterima: [
                `I recently discovered I could make fudge with just chocolate chips, sweetened condensed milk, vanilla extract, and a thick pot on slow heat.`,
                `But don't make them too big or they might just pop, and then bye-bye balloon.`
            ]
        },
        {
            date: '14 Oktober 2020',
            chat_terkirim: [
                `And yet, he already knew that the eight hours he was prepared to sit in front of his computer today would end with the screen remaining blank.`,
                `It'll be gone and lost for the rest of mankind.`
            ],
            chat_diterima: [
                `I recently discovered I could make fudge with just chocolate chips, sweetened condensed milk, vanilla extract, and a thick pot on slow heat.`,
                `They can serve a variety of purposes, from decorating to water balloon wars.`
            ]
        },
    ]
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
                    flexDirection: 'row',                    
                    alignItems: 'center'
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
                    Naufal Hanif
                </Text>
            </View>
            <ScrollView
                style = {{
                    flex: 1
                }}
            >
                {
                    chats.map((item, index) => {
                        return (
                            <>
                            <View
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
                            </View>
                            {
                                item.chat_terkirim.map((chatTerkirim, index) => {
                                    return (
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
                                                marginBottom: 10
                                            }}
                                        >
                                            <Text
                                                style = {{
                                                    fontFamily: OpenSans.Regular,
                                                    color: '#FFF',
                                                }}
                                            >
                                                {chatTerkirim}
                                            </Text>
                                        </View>
                                    )
                                })
                            }
                            {
                                item.chat_diterima.map((chatDiterima, index) => {
                                    return (
                                        <View
                                            style = {{
                                                backgroundColor: '#c8d6e5',
                                                alignItems: 'flex-end',
                                                alignSelf: 'flex-end',
                                                flexWrap: 'wrap',
                                                paddingVertical: 10,
                                                paddingHorizontal: 10,
                                                borderRadius: 10,
                                                marginLeft: 10,
                                                marginRight: 50,
                                                marginBottom: 10
                                            }}
                                        >
                                            <Text
                                                style = {{
                                                    fontFamily: OpenSans.Regular,
                                                    color: 'black',
                                                }}
                                            >
                                                {chatDiterima}
                                            </Text>
                                        </View>
                                    )
                                })
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
                        style = {{
                            borderWidth: 1,
                            borderColor: '#c8d6e5',
                            justifyContent: 'space-between',
                            borderRadius: 40,
                            paddingHorizontal: 20,
                            fontFamily: OpenSans.Regular
                        }}
                    />
                </View>
                <TouchableOpacity
                    activeOpacity = {0.7}
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