import React, { useEffect, useState } from 'react';
import { Image, Alert, Text, View } from 'react-native';
import { useFonts } from 'expo-font';

export default function LogoTitle() {
    const fontsLoaded = useFonts({
        'honeyNotes': require('./assets/fonts/honeyNotes.ttf'),
    });

    useEffect(() => {
    }, [fontsLoaded])

    if (fontsLoaded) {
        return (
            <View>
                <Text style={{ fontFamily: 'honeyNotes', fontSize: 50}}>soulful</Text>
            </View>
        )
    } else {
        return (
            <View>
                <Text style={{ fontSize: 40}}>soulful</Text>
            </View>
        )
    }
}