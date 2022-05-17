import { Session } from '@supabase/supabase-js';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Account from './Account';
import Auth from './Auth';
import { supabase } from './supabase';

export default function Home({navigation}: {navigation: any}) {
    const [session, setSession] = useState<Session | null>(null)

    useEffect(() => {
      setSession(supabase.auth.session())
      supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
      });
    }, [])

    const styles = StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: '#fff',
          alignItems: 'center',
          justifyContent: 'center',
        },
      });

    return (
        <View style={styles.container}>
            {
            session && session.user ?
            <Account key={session.user.id} session={session} navigation={navigation}/>:
            <Auth/>
            }
        </View>
    )
}