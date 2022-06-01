import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Explore from "./Explore";
import Profile from "./Profile";

export default function SettingsTab({navigation, route}: {navigation: any, route: any}) {

    const Stack = createNativeStackNavigator();

    return (
        <Stack.Navigator>
            <Stack.Screen 
                name="Explore"
                component={Explore}
                options={{headerTitle: 'soulful', headerTitleAlign: 'center', headerTitleStyle: {fontFamily: 'honeyNotes', fontSize: 40}}}
                initialParams={{session: route.params.session}}
            />
            <Stack.Screen
                name="Profile"
                options={{headerTitle: 'soulful', headerTitleAlign: 'center', headerTitleStyle: {fontFamily: 'honeyNotes', fontSize: 40}}}
                component={Profile}
            />
        </Stack.Navigator>
    )
}