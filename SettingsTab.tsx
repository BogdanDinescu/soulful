import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { Image, Alert, Text, View } from 'react-native';
import { Button } from 'react-native-elements';
import Account from './Account';
import Profile from './Profile';
import Settings from './Settings';

export default function SettingsTab({navigation, route}: {navigation: any, route: any}) {

    const Stack = createNativeStackNavigator();

    return (
        <Stack.Navigator>
            <Stack.Screen
                name="Settings"
                component={Settings}
                options={{headerTitle: 'settings', headerTitleAlign: 'center', headerTitleStyle: {fontFamily: 'honeyNotes', fontSize: 40}}}
                initialParams={{session: route.params.session}}
            />
            <Stack.Screen
                name="Account"
                options={{headerTitle: 'edit profile', headerTitleAlign: 'center', headerTitleStyle: {fontFamily: 'honeyNotes', fontSize: 40}}}
                component={Account}
            />
            <Stack.Screen
                name="Profile"
                options={{headerTitle: 'soulful', headerTitleAlign: 'center', headerTitleStyle: {fontFamily: 'honeyNotes', fontSize: 40}}}
                component={Profile}
            />
        </Stack.Navigator>
    )
}