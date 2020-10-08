import { StackNavigationProp } from '@react-navigation/stack';

import { StackParamsList } from './types/navigator'

let navigationProp: StackNavigationProp<StackParamsList, 'Home'>
let openedRoomIndex: any = undefined

export function setNavigationProp(newNavigationProp: StackNavigationProp<StackParamsList, 'Home'>) {
    navigationProp = newNavigationProp
}

export function getNavigationProp() {
    return navigationProp
}

export function setOpenedRoomIndex(newOpenedRoomIndex: any) {
    openedRoomIndex =  newOpenedRoomIndex
}

export function getOpenedRoomIndex() {
    return openedRoomIndex
}