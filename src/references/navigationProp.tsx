import { StackNavigationProp } from '@react-navigation/stack';

import { StackParamsList } from './types/navigator'

let navigationProp: StackNavigationProp<StackParamsList, 'Home'>

export function setNavigationProp(newNavigationProp: StackNavigationProp<StackParamsList, 'Home'>) {
    navigationProp = newNavigationProp
}

export function getNavigationProp() {
    return navigationProp
}