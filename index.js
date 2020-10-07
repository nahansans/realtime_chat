import 'react-native-gesture-handler'
import PushNotification from 'react-native-push-notification'
import AsyncStorage from '@react-native-community/async-storage';
import {getNavigationProp} from './src/references/navigationProp'

/**
 * @format
 */
PushNotification.createChannel(
    {
      channelId: 'default', // (required)
      channelName: 'default', // (required)
      channelDescription: 'Default notifications channel', // (optional) default: undefined.
      soundName: 'default', // (optional) See soundName parameter of localNotification function
      importance: 4, // (optional) default: 4. Int value of the Android notification importance
      vibrate: true // (optional) default: true. Creates the default vibration patten if true.
    },
    created => console.log(`createChannel returned '${created}'`) // (optional) callback returns whether the channel was created, false means it already existed.
)

PushNotification.configure(
    {
        onNotification: async(notification) => {
            const navigationProp = getNavigationProp()

            if (navigationProp != undefined) {
                navigationProp.navigate('Home')

                setTimeout(() => {
                    const { roomIndex, withUser } = notification.data
                    
                    navigationProp.navigate('Chat', {
                        fromScreen: 'Home',
                        roomIndex,
                        withUser
                    })
                }, 400)
            } else {
                await AsyncStorage.setItem('notification', JSON.stringify(notification.data))
            }
        }
    }
)

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);
