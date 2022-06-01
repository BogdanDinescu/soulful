import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import Chat from './Chat';
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
                name="Chat"
                component={Chat}
                options={{headerTitle: 'chat', headerTitleAlign: 'center', headerTitleStyle: {fontFamily: 'honeyNotes', fontSize: 40}}}
            />
        </Stack.Navigator>
    )
}