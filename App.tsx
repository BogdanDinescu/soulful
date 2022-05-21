import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator} from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import { Session } from '@supabase/supabase-js';
import Account from './Account';
import Auth from './Auth';
import Profile from './Profile';
import Settings from './Settings';
import Explore from './Explore';
import Chats from './Chats';
import LogoTitle from './LogoTitle';
import 'react-native-url-polyfill/auto';

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const Stack = createNativeStackNavigator()
  const Tab = createBottomTabNavigator();

  useEffect(() => {
    setSession(supabase.auth.session())
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, [])

  return (
      <NavigationContainer>
        {session?
          <Tab.Navigator initialRouteName='Explore'
            screenOptions={({ route }) => ({
              tabBarIcon: ({ focused, color, size }) => {
                let iconName;
                if (route.name === 'Settings') {
                  if (focused) {
                    return <Ionicons name='settings' size={30}/>;
                  } else {
                    return <Ionicons name='settings-outline' size={30}/>;
                  }
                }
                if (route.name === 'Explore') {
                  if (focused) {
                    return <Ionicons name='compass' size={30}/>;
                  } else {
                    return <Ionicons name='compass-outline' size={30}/>;
                  }
                }
                if (route.name === 'Chats') {
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
            <Tab.Screen name="Settings" component={Settings} options={{ headerTitle: () => <LogoTitle/> }}></Tab.Screen>
            <Tab.Screen name="Explore" component={Explore} options={{ headerTitle: () => <LogoTitle/> }}></Tab.Screen>
            <Tab.Screen name="Chats" component={Chats} options={{ headerTitle: () => <LogoTitle/> }}></Tab.Screen>
          </Tab.Navigator>:
          <Stack.Navigator>
            <Stack.Screen name="Account" component={Account} initialParams={{session: session}}/>
            <Stack.Screen name="Profile" component={Profile}/>
            <Stack.Screen name="Auth" component={Auth}/>
          </Stack.Navigator>}
      </NavigationContainer>
  );
}
