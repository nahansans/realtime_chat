import { Platform } from 'react-native'
export const Fonts = {
    OpenSans: {
        Regular: Platform.OS == 'ios' ? 'OpenSansRegular' : 'OpenSans-Regular',
        SemiBold: Platform.OS == 'ios' ? 'OpenSansSemiBold' : 'OpenSans-SemiBold',
        SemiBoldItalic: Platform.OS == 'ios' ? 'OpenSansSemiBoldItalic' : 'OpenSans-SemiBoldItalic',
        Italic: Platform.OS == 'ios' ? 'OpenSansItalic' : 'OpenSans-Italic',
        Light: Platform.OS == 'ios' ? 'OpenSansLight' : 'OpenSans-Light',
        LightItalic: Platform.OS == 'ios' ? 'OpenSansLightItalic' : 'OpenSans-LightItalic',
        Bold: Platform.OS == 'ios' ? 'OpenSansBold' : 'OpenSans-Bold',
        BoldItalic: Platform.OS == 'ios' ? 'OpenSansBoldItalic' : 'OpenSans-BoldItalic',
        ExtraBold: Platform.OS == 'ios' ? 'OpenSansExtraBold' : 'OpenSans-ExtraBold',
    }
}