import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator} from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFonts } from 'expo-font';
import React, { useEffect, useState } from 'react';
import { supabase } from './supabase';
import { Session } from '@supabase/supabase-js';
import Account from './Account';
import Auth from './Auth';
import Profile from './Profile';
import SettingsTab from './SettingsTab';
import Explore from './ExploreTab';
import Chats from './ChatsTab';
import 'react-native-url-polyfill/auto';
import { ActivityIndicator, View } from 'react-native';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [fontsLoaded] = useFonts({
    'honeyNotes': require('./assets/fonts/honeyNotes.ttf'),
  });
  const Stack = createNativeStackNavigator()
  const Tab = createBottomTabNavigator();

  useEffect(() => {
    setSession(supabase.auth.session())
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, [])

  if (!fontsLoaded)  {
    return(
      <View>
        <ActivityIndicator/>
      </View>
    )
  }

  return (
      <NavigationContainer>
        {session?
          <Tab.Navigator initialRouteName='ExploreTab'
            screenOptions={({ route }) => ({
              tabBarIcon: ({ focused, color, size }) => {
                if (route.name === 'SettingsTab') {
                  if (focused) {
                    return <Ionicons name='settings' size={30}/>;
                  } else {
                    return <Ionicons name='settings-outline' size={30}/>;
                  }
                }
                if (route.name === 'ExploreTab') {
                  if (focused) {
                    return <Ionicons name='compass' size={30}/>;
                  } else {
                    return <Ionicons name='compass-outline' size={30}/>;
                  }
                }
                if (route.name === 'ChatsTab') {
                  if (focused) {
                    return <Ionicons name='chatbubble' size={30}/>;
                  } else {
                    return <Ionicons name='chatbubble-outline' size={30}/>;
                  }
                }
              },
              tabBarActiveTintColor: 'black',
              tabBarInactiveTintColor: 'gray',
            })}>
            <Tab.Screen name="SettingsTab" 
              component={SettingsTab}
              options={{ tabBarLabel: 'Settings', headerShown: false }}
              initialParams={{session: session}}/>
            <Tab.Screen name="ExploreTab" 
              component={Explore} 
              options={{ tabBarLabel: 'Home', headerTitle: 'soulful', headerTitleAlign: 'center', headerTitleStyle: {fontFamily: 'honeyNotes', fontSize: 40}}}
              initialParams={{session: session}}/>
            <Tab.Screen name="ChatsTab" 
              component={Chats} 
              options={{ tabBarLabel: 'Chats', headerShown: false }}/>
            
          </Tab.Navigator>:
          <Stack.Navigator>
            <Stack.Screen name="Auth" 
              component={Auth} 
              options={{ headerTitle: 'soulful', headerTitleAlign: 'center', headerTitleStyle: {fontFamily: 'honeyNotes', fontSize: 40}}}/>
          </Stack.Navigator>}
      </NavigationContainer>
  );
}
