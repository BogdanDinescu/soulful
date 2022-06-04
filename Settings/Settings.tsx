import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { Switch } from 'react-native-elements';
import ToggleSwitch from 'toggle-switch-react-native';
import { supabase } from '../supabase';

export default function Settings({navigation, route}: {navigation: any, route: any}) {
    const colors = useTheme();
    const [darkMode, setDarkMode] = useState<boolean>(false);
    
    useEffect(() => {
        getTheme();
    }, [darkMode])

    async function getTheme() {
        try {
            const value = await AsyncStorage.getItem('@darkMode')
            if (value !== null && value !== 'false') {
                setDarkMode(true);
            } else {
                setDarkMode(false);
            }
        } catch(e) {
            setDarkMode(false);
        }
    }

   async function setTheme(on: boolean) {
        try {
            await AsyncStorage.setItem('@darkMode', String(on));
            setDarkMode(on);
            Alert.alert("Theme changed succesfuly", "The changes will be visible after an app restart")
        } catch (error: any) {
            Alert.alert("Error changing theme", error.message);
        }
   }

    return (
        <View style={{padding: 5}}>
            <View style={{margin: 5}}>
                <FontAwesome.Button
                    style={{margin: 5}}
                    backgroundColor={"dodgerblue"}
                    name='info'
                    onPress={() =>
                        navigation.navigate('Account', {session: route.params.session})
                    }>
                    Edit your profile
                </FontAwesome.Button>
            </View>
            <View style={{margin: 5}}>
                <FontAwesome.Button
                    style={{margin: 5}}
                    backgroundColor={"dodgerblue"}
                    name='info'
                    onPress={() =>
                        navigation.navigate('Profile', {id: route.params.session.user.id})
                    }>
                    Preview your profile
                </FontAwesome.Button>
            </View>
            <View style={{margin: 5}}>
                <ToggleSwitch
                    labelStyle={{color: colors.colors.text}}
                    isOn={darkMode}
                    label='Dark mode'
                    onColor='dodgerblue'
                    offColor='grey'
                    onToggle={(isOn) => setTheme(isOn)}
                />
            </View>
            <View style={{margin: 5}}>
                <FontAwesome.Button
                    style={{margin: 5}}
                    backgroundColor={"red"}
                    name='close'
                    onPress={() => supabase.auth.signOut()}>
                    Sign Out
                </FontAwesome.Button>
            </View>
        </View>
    )
}