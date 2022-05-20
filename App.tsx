import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator} from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import { Session } from '@supabase/supabase-js';
import Account from './Account';
import Auth from './Auth';
import Profile from './Profile';
import 'react-native-url-polyfill/auto';

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const Stack = createNativeStackNavigator()
  
  useEffect(() => {
    setSession(supabase.auth.session())
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, [])

  return (
      <NavigationContainer>
        <Stack.Navigator>
          {
          session ? (<>
          <Stack.Screen name="Account" component={Account} initialParams={{session: session}}/>
          <Stack.Screen name="Profile" component={Profile}/>
          </>) : (<>
          <Stack.Screen name="Auth" component={Auth}/>
          </>)}
        </Stack.Navigator>
      </NavigationContainer>
  );
}
