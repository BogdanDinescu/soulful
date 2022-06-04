import { DarkTheme, DefaultTheme, NavigationContainer, useTheme } from '@react-navigation/native';
import { createNativeStackNavigator} from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFonts } from 'expo-font';
import React, { useEffect, useState } from 'react';
import { supabase } from './supabase';
import { Session } from '@supabase/supabase-js';
import Auth from './Auth';
import SettingsTab from './Settings/SettingsTab';
import Explore from './Explore/ExploreTab';
import Chats from './Chats/ChatsTab';
import 'react-native-url-polyfill/auto';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [fontsLoaded] = useFonts({
    'honeyNotes': require('./assets/fonts/honeyNotes.ttf'),
  });
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const Stack = createNativeStackNavigator()
  const Tab = createBottomTabNavigator();

  useEffect(() => {
    setSession(supabase.auth.session())
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  useEffect(() =>{
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

  if (!fontsLoaded)  {
    return(
      <View>
        <ActivityIndicator/>
      </View>
    )
  }

  return (
      <NavigationContainer theme={darkMode ? DarkTheme : DefaultTheme}>
        <StatusBar backgroundColor="dodgerblue"></StatusBar>
        {session?
          <Tab.Navigator initialRouteName='ExploreTab'
            screenOptions={({ route }) => ({
              tabBarIcon: ({ focused, color, size }) => {
                const colors = useTheme();
                if (route.name === 'SettingsTab') {
                  if (focused) {
                    return <Ionicons name='settings' size={30} color={colors.colors.text}/>;
                  } else {
                    return <Ionicons name='settings-outline' size={30} color={colors.colors.text}/>;
                  }
                }
                if (route.name === 'ExploreTab') {
                  if (focused) {
                    return <Ionicons name='compass' size={30} color={colors.colors.text}/>;
                  } else {
                    return <Ionicons name='compass-outline' size={30} color={colors.colors.text}/>;
                  }
                }
                if (route.name === 'ChatsTab') {
                  if (focused) {
                    return <Ionicons name='chatbubble' size={30} color={colors.colors.text}/>;
                  } else {
                    return <Ionicons name='chatbubble-outline' size={30} color={colors.colors.text}/>;
                  }
                }
              },
            })}>
            <Tab.Screen name="SettingsTab" 
              component={SettingsTab}
              options={{ tabBarLabel: 'Settings', headerShown: false }}
              initialParams={{session: session}}/>
            <Tab.Screen name="ExploreTab" 
              component={Explore} 
              options={{headerShown: false }}
              initialParams={{session: session}}/>
            <Tab.Screen
              name="ChatsTab" 
              component={Chats} 
              options={{ tabBarLabel: 'Chats', headerShown: false }}
              initialParams={{session: session}}/>
            
          </Tab.Navigator>:
          <Stack.Navigator>
            <Stack.Screen name="Auth" 
              component={Auth} 
              options={{ headerTitle: 'soulful', headerTitleAlign: 'center', headerTitleStyle: {fontFamily: 'honeyNotes', fontSize: 40}}}/>
          </Stack.Navigator>}
      </NavigationContainer>
  );
}
