import { supabase } from "./supabase";
import { Alert, StyleSheet, Text, View} from 'react-native';
import React, { useState } from "react";
import { Button, colors, Input } from 'react-native-elements'
import { useTheme } from "@react-navigation/native";
import { FontAwesome } from "@expo/vector-icons";

export default function Auth() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const colors = useTheme();

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

      async function signInWithFacebook() {
        setLoading(true);
        const { user, session, error } = await supabase.auth.signIn({
          provider: 'facebook',
        });
        if (error) Alert.alert("Sign up failed",error.message)
        setLoading(false);
      }

      return (
        <View style={[styles.container, {backgroundColor: colors.colors.background}]}>
            <View style={[styles.verticallySpaced, styles.mt20]}>
                <Input
                      style={{color: colors.colors.text}}
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
                      style={{color: colors.colors.text}}
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
            <View style={{width: "100%", marginTop: 5}}>
              <FontAwesome.Button
                  style={{margin: 5, width: "100%"}}
                  backgroundColor={"dodgerblue"}
                  name='facebook'
                  disabled={loading}
                  onPress={() => {signInWithFacebook()}}>
                  Sign in with Facebook
              </FontAwesome.Button>
            </View>
        </View>
      );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
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