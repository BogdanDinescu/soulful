import { supabase } from "./supabase";
import { Alert, StyleSheet, Text, View} from 'react-native';
import React, { useState } from "react";
import { Button, Input } from 'react-native-elements'

export default function Auth() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)

    async function signInWithEmail() {
        setLoading(true)
        const { user, error } = await supabase.auth.signIn({
          email: email,
          password: password,
        })
        
        if (error) {
          Alert.alert("Sign in failed", error.message);
          setLoading(false)
        }
      }
    
      async function signUpWithEmail() {
        setLoading(true)
        const { user, error } = await supabase.auth.signUp({
          email: email,
          password: password,
        })
    
        if (error) Alert.alert("Sign up failed",error.message)
        setLoading(false)
      }

      return (
        <View style={styles.container}>
            <View style={[styles.verticallySpaced, styles.mt20]}>
                <Input
                      label="Email"
                      leftIcon={{ type: 'font-awesome', name: 'envelope' }}
                      onChangeText={(text) => setEmail(text)}
                      value={email}
                      placeholder="email@address.com"
                      autoCapitalize={'none'}
                      autoCompleteType={undefined}/>
            </View>
            <View style={styles.verticallySpaced}>
                <Input
                      label="Password"
                      leftIcon={{ type: 'font-awesome', name: 'lock' }}
                      onChangeText={(text) => setPassword(text)}
                      value={password}
                      secureTextEntry={true}
                      placeholder="Password"
                      autoCapitalize={'none'}
                      autoCompleteType={undefined}/>
            </View>
            <View style={[styles.verticallySpaced, styles.mt20]}>
                <Button title="Sign in" disabled={loading} onPress={() => signInWithEmail()}/>
            </View>
            <View style={styles.verticallySpaced}>
                <Button title="Sign up" disabled={loading} onPress={() => signUpWithEmail()}/>
            </View>
        </View>
      );
}

const styles = StyleSheet.create({
    container: {
        width: "80%"
      },
      verticallySpaced: {
        paddingTop: 4,
        paddingBottom: 4,
        alignSelf: 'stretch',
      },
      mt20: {
        marginTop: 20,
      },
  });