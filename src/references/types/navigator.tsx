type FromScreen = (
    'Home'
    | 'Chat'
)

export type StackParamsList = {
    Home: undefined,
    Login: undefined,
    Register: undefined,
    SplashScreen: undefined,
    Chat: {
        fromScreen: FromScreen,
        roomIndex: number,
        withUser: string
    }
}