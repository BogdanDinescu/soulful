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
            <Stack.Screen name="Settings" component={Settings} initialParams={{session: route.params.session}}></Stack.Screen>
            <Stack.Screen name="Account" component={Account}/>
            <Stack.Screen name="Profile" component={Profile}/>
        </Stack.Navigator>
    )
}