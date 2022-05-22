import React, { useEffect, useState } from 'react';
import { Image, Alert, Text, View, StyleSheet } from 'react-native';
import { Button } from 'react-native-elements';
import { supabase } from './supabase';

export default function Settings({navigation, route}: {navigation: any, route: any}) {
    return (
        <View>
            <Button
                style={[styles.marginVert]}
                title="Edit your profile"
                onPress={() =>
                    navigation.navigate('Account', {session: route.params.session})
                }
            />
            <Button
                style={[styles.marginVert]}
                title="Preview your profile"
                onPress={() =>
                    navigation.navigate('Profile', {id: route.params.session.user.id})
                }
            />
            <Button 
                style={[styles.marginVert, styles.darkred]}
                title="Sign Out"
                onPress={() => supabase.auth.signOut()} />
        </View>
    )
}

const styles = StyleSheet.create({
    marginVert: {
        marginVertical: 10
    },
    darkred: {
        backgroundColor: 'darkred'
    }
});