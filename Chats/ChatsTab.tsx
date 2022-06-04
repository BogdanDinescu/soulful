import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, {  } from 'react';
import Profile from '../Profile';
import ChatComponent from './ChatComponent';
import Chats from './Chats';

export default function ChatsTab({navigation, route}: {navigation: any, route: any}) {

    const Stack = createNativeStackNavigator();

    return (
        <Stack.Navigator>
            <Stack.Screen 
                name="Chats"
                component={Chats}
                options={{headerTitle: 'chats', headerTitleAlign: 'center', headerTitleStyle: {fontFamily: 'honeyNotes', fontSize: 40}}}
                initialParams={{session: route.params.session}}
            />
            <Stack.Screen
                name="ChatComponent"
                component={ChatComponent}
                options={{headerTitle: 'chat', headerTitleAlign: 'center', headerTitleStyle: {fontFamily: 'honeyNotes', fontSize: 40}}}
            />
            <Stack.Screen
                name="Profile"
                options={{headerTitle: 'soulful', headerTitleAlign: 'center', headerTitleStyle: {fontFamily: 'honeyNotes', fontSize: 40}}}
                component={Profile}
            />
        </Stack.Navigator>
    )
}